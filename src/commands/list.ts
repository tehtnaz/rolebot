import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandRoleOption } from "discord.js";
import { sb_LogDebug, sb_LogError } from "../helpers/console-prefixes.js";
import { DefaultEmbedColour } from "../helpers/embed-colour.js";
import { AddReactionID, RegisterRoleID, VoteRole } from "../models/VoteRole.js";

export default {
    data: new SlashCommandBuilder()
        .setName("list")
        .setDescription("Lists the roles associated to each reaction")
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction){
        if(interaction.guildId === null || !interaction.guild) return;
        const roleList = await VoteRole.findAll({where: {server_id: interaction.guildId}});

        const returnedEmbed = new EmbedBuilder()
                .setAuthor({name: `${interaction.guild.name}'s VoteRole list`, iconURL: `https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}.png`})
                .setColor(DefaultEmbedColour);
        

        if(roleList.length === 0){
            returnedEmbed.addFields({name: "No VoteRoles?", value: `😢`})
        }else{
            /// !!! OVERLOADS PAST EMBED LIMIT !!!
            for(const item of roleList){
                const name = (await interaction.guild.roles.fetch(item.role_id))?.name;
                if(!name) {
                    VoteRole.destroy({where: {role_id: item.role_id, server_id: item.server_id}});
                    continue
                }
                returnedEmbed.addFields({name: name, value: `\`${item.votes_needed.toString()}\` | ${item.reaction_id}`})
            }
        }

        //returnedEmbed.setFooter({text: `Page ${server_queue.getQueueLength() <= 0 ? "0" : (page_num).toString()} / ${(Math.ceil(server_queue.getQueueLength() / 10)).toString()}\n  Queue Repeat: ${server_queue.repeatQueue ? "✅" : "❌"} | Song Repeat: ${server_queue.repeatSong ? "✅" : "❌"}`});
        await interaction.reply( {embeds: [returnedEmbed]});
    }
}