import chalk from "chalk"
import {ChatInputCommandInteraction} from "discord.js"

//import pino from "pino"

//const logger = pino();

const info_header = chalk.green("INFO: ");
const debug_header = chalk.gray("DEBUG: ");
const error_header = chalk.redBright("ERROR: ");

export function sb_LogError(interaction: ChatInputCommandInteraction, err: unknown){
    console.error(interaction.guildId, "/" + interaction.commandName, error_header, err);
}
export function sb_LogDebug(interaction: ChatInputCommandInteraction, message: any){
    console.log(interaction.guildId, "/" + interaction.commandName, debug_header, message);
}

export function sb_LogInfo(interaction: ChatInputCommandInteraction, message: string){
    console.log(interaction.guildId, "/" + interaction.commandName, info_header, message);
}

export function logInfo(scriptName: string, message: string){
    console.log(`(${scriptName}):`, info_header, message);
}
export function logDebug(scriptName: string, message: any){
    console.log(`(${scriptName}):`, debug_header, message);
}
export function logError(scriptName: string, err: unknown){
    console.error(`(${scriptName}):`, error_header, err);
}