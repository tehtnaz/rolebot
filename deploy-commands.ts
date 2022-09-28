import { SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";

//for debug
//import config from './config.json';

//for release
const config = JSON.parse(fs.readFileSync("./config.json").toString());

import fs from "fs";
const commands: Array<SlashCommandBuilder> = [];
const commandFiles_d: Array<string> = fs.readdirSync('./commands').filter((file: string) => file.endsWith('.js'));

const promises: Array<Promise<void>> = [];

for (const file of commandFiles_d) {
	promises.push(import(`./commands/${file}`).then((command) =>{
        commands.push(command.default.data.toJSON());
        //if(file === "skip.js")console.log(command.default.data.toJSON());
    }))
}

const rest = new REST({version : '10'}).setToken(config.token);
console.log(config.app_id_beta + " " + config.dev_server_id);
Promise.all(promises).then(()=>{
    console.log(commands);
    //console.log(commands.find((val) => val.name === 'skip'));
    if(config.debug === false){
        rest.put(Routes.applicationGuildCommands(config.app_id, config.dev_server_id), {body:commands})
            .then(() => console.log("Registered commands to test server"))
            .catch(console.error);

        rest.put(Routes.applicationCommands(config.app_id), {body:commands})
            .then(() => console.log("Registered commands to ALL servers"))
            .catch(console.error);
    }

    const debug_rest = new REST({version : '10'}).setToken(config.token_beta);
    debug_rest.put(Routes.applicationGuildCommands(config.app_id_beta, config.dev_server_id), {body:commands})
        .then(() => console.log("Registered commands to test server (DEBUG)"))
        .catch(console.error);
    debug_rest.put(Routes.applicationCommands(config.app_id_beta), {body:commands})
        .then(() => console.log("Registered commands to ALL servers (DEBUG)"))
        .catch(console.error);
})