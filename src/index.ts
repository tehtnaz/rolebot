import { ChatInputCommandInteraction, Client, Collection, GatewayIntentBits, IntentsBitField, Interaction, MessageReaction, Partials } from "discord.js";
import { Sequelize } from "sequelize";
import { VoteRole } from "./models/VoteRole.js";
import fs from 'fs';

const config = JSON.parse(fs.readFileSync("./config.json").toString());

// init database
const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

// client + intents
const intents_array = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages];
const partials_array = [Partials.Message, Partials.Channel, Partials.Reaction];
const client = new Client({ intents: intents_array, partials: partials_array});

// login
if(config.debug) client.login(config.token_beta);
else client.login(config.token);

// import commands
const commandCollection = new Collection<string, (interaction: ChatInputCommandInteraction) => Promise<void>>();
const commandFiles: Array<string> = fs.readdirSync("./commands").filter((file: string) => file.endsWith(".js"));
for(const file of commandFiles){
    import(`./commands/${file}`).then((command) =>{
        commandCollection.set(command.default.data.name, command.default.execute);
        console.log(`Registered: ${command.default.data.name} (from: ${file})`);
    });
}

// init db + log activity
client.once("ready", async () => {
    if(config.debug) {
        console.log("Started roleBot v0.1.dev in DEBUG MODE");
    }
    else {
        console.log("Started roleBot v0.1.0 in OFFICIAL mode");
        const d = new Date();
        const printStr = `-------------------------\n    @@@@ Bot went online at: ${d.toDateString()}, ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}\n`;
        fs.appendFile("activity.txt", printStr, (err) =>{
            if(err) console.log(err);
        })
    }
    VoteRole.m_init(sequelize);
});


client.on("interactionCreate", async (interaction) => {
    if(!interaction.isChatInputCommand()) {console.log("is not command"); return;}

    if(interaction.guild === null){
        await interaction.reply("You must be in a guild to use commands!");
        return;
    }
    try {
        if(interaction.isChatInputCommand()){
            console.log("received: " + interaction.commandName);
            const command = commandCollection.get(interaction.commandName);
            if(!command)return;
            await command(interaction);
        }else{
            //await search_command.receiveSelectMenu(interaction, serverQueue);
        }
    } catch (err){
        console.error(err);
        try{
            if(!interaction.replied)
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            else
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        }catch(err){
            console.log(err);
        }
    }
});

client.on("messageReactionAdd", async (messageReaction) =>{
    console.log("reaction added");
    if(messageReaction.partial){
        try{
            
            await messageReaction.fetch();
            console.log("fetched msg");
        }catch(err){
            console.error("Error while fetching the message: ", err);
            return;
        }
    }
    if(messageReaction.message.guildId === null){
        console.log("Reaction was not in a server...");
        return;
    }
    const voteRole = await VoteRole.findOne({where: {server_id: messageReaction.message.guildId, reaction_id: messageReaction.emoji.id}}).catch(() =>{
        console.log("promise rejected");
    });
    //console.log(voteRole);
    if(voteRole && messageReaction.count){
        console.log("Found database entry");
        if(messageReaction.count >= voteRole.votes_needed){
            try{
                const member = messageReaction.message.member;
                if(member?.user.bot) {
                    console.log("user was bot... skipping");
                    return;
                }
                await member?.roles.add(voteRole.role_id);
                messageReaction.message.reply("new role");
            }catch(err){
                console.error("Error while attempting to add role: ", err);
            }
        }
    }else{
        console.log("Could not find database entry for reaction");
    }
});

process.on("uncaughtException", () =>{
    if(!config.debug){
        const d = new Date();
        const printStr = `    %%%% Bot went offline at: ${d.toDateString()}, ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}\n`;
        fs.appendFileSync("activity.txt", printStr)
    }
})
process.on("SIGINT", () => {
    if(!config.debug){
        const d = new Date();
        const printStr = `    %%%% Bot went offline at: ${d.toDateString()}, ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}\n`;
        fs.appendFileSync("activity.txt", printStr)
    }
    client.destroy();
    process.exit(0);
});