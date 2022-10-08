import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandRoleOption } from "discord.js";
import { DeleteVoteRole } from "../models/VoteRole.js";

export default {
    data: new SlashCommandBuilder()
        .setName("remove_vote_role")
        .setDescription("Delete a VoteRole")
        .addRoleOption((option: SlashCommandRoleOption)=> option.setName("role")
            .setDescription("The role").setRequired(true))
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction){
        if(interaction.guildId === null) return;
        DeleteVoteRole(interaction.guildId, interaction.options.getRole("role", true).id);

        //update this terrible response
        interaction.reply("Done!");
    }
}