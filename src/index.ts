import { ChatInputCommandInteraction, Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import { Sequelize } from "sequelize";
import { VoteRole } from "./models/VoteRole.js";
import fs from 'fs';
import { logDebug, logError, logInfo } from "./helpers/console-prefixes.js";
import chalk from "chalk";






/// TODO

/// MAKE /list!!!
/// MAKE /remove_vote_role!!!








//import config from "./config.json" assert {type: 'json'};
const config = JSON.parse(fs.readFileSync("./config.json").toString());

// init database
const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

// client creation with intents + login 
const intents_array = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages];
const partials_array = [Partials.Message, Partials.Channel, Partials.Reaction];
const client = new Client({ intents: intents_array, partials: partials_array });
client.login(config.token);

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
export const sb_version = "v0.1.0";
client.once("ready", async () => {
    if(config.debug) {
        logInfo("index.js", `Started soundbot ${sb_version}${chalk.redBright("-DEV")} in ${chalk.bgYellowBright("DEBUG MODE")}`);
    }
    else {
        logInfo("index.js", `Started soundbot ${sb_version} in ${chalk.bgBlueBright("OFFICIAL mode")}`);
        const d = new Date();
        const printStr = `-------------------------\n    @@@@ Bot went online at: ${d.toDateString()}, ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}\n`;
        fs.appendFile("activity.txt", printStr, (err) =>{
            if(err) logError("index.js", err);
        })
    }
    VoteRole.m_init(sequelize);
});


//do i really need a comment here?

//receives commands
client.on("interactionCreate", async (interaction) => {
    if(!interaction.isChatInputCommand()) {logError("index.js", "Somehow received a non-ChatInputCommand, ignoring..."); return;}

    if(interaction.guild === null){
        await interaction.reply("You must be in a guild to use commands!");
        return;
    }
    try {
        logDebug("index.js", "received: " + interaction.commandName);
        const command = commandCollection.get(interaction.commandName);
        if(!command)return;
        await command(interaction);
    } catch (err){
        logError("index.js", err);
        try{
            if(!interaction.replied)
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            else
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        }catch(err){
            logError("index.js", err);
        }
    }
});


//this should be obvious - "messageReactionAdd"
client.on("messageReactionAdd", async (messageReaction) =>{
    logDebug("index.js", "Reaction added");
    if(messageReaction.partial){
        try{
            await messageReaction.fetch();
            logDebug("index.js", "fetched msg");

        }catch(err){
            logError("index.js", "Error while fetching the message");
            logError("index.js", err);
            return;
        }
    }
    if(messageReaction.message.guildId === null){
        logDebug("index.js", "Reaction was not in a server...");
        return;
    }
    const member = messageReaction.message.member;
    if(member?.user.bot) {
        logDebug("index.js", "User was bot... skipping");
        return;
    }

    const voteRole = await VoteRole.findOne({where: {server_id: messageReaction.message.guildId, reaction_id: messageReaction.emoji.id}}).catch(() =>
        logError("index.js", "Promise rejected (Is the database synced yet?)"));

    //console.log(voteRole);
    if(voteRole && messageReaction.count){
        logDebug("index.js", "Found database entry");
        if(messageReaction.count >= voteRole.votes_needed){
            try{
                await member?.roles.add(voteRole.role_id);
                messageReaction.message.reply("new role");
            }catch(err){
                logError("index.js", "Error while attempting to add role | guildID: " + member?.guild.id + " | roleID: " + voteRole.role_id);
                logError("index.js", err);
            }
        }
    }else{
        logDebug("index.js", "Could not find database entry for reaction");
    }
});

process.on("uncaughtException", () =>{
    if(!config.debug){
        const d = new Date();
        const printStr = `    !!!! Bot had uncuaght exception at: ${d.toDateString()}, ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}\n`;
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