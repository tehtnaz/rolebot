import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandRoleOption } from "discord.js";
import { sb_LogDebug, sb_LogError } from "../helpers/console-prefixes.js";
import { AddReactionID, RegisterRoleID } from "../models/VoteRole.js";

export default {
    data: new SlashCommandBuilder()
        .setName("create_vote_role")
        .setDescription("React to this message in order to associate it with a role")
        .addRoleOption((option: SlashCommandRoleOption)=> option.setName("role")
            .setDescription("The role").setRequired(true))
        .addIntegerOption((option: SlashCommandIntegerOption) => option.setName("votes")
            .setDescription("The amount of votes needed to receive the role").setRequired(true))
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction){
        if(interaction.guildId === null) return;
        const role_id = interaction.options.getRole("role", true).id;
        if(await RegisterRoleID(interaction.guildId, role_id, interaction.options.getInteger("votes", true))){
            const message = await interaction.reply({content: "Registered the role to the database. Please react with the reaction you'd like", fetchReply: true});
            
            message.awaitReactions({max: 1, time: 60_000, errors: ['time']}).then(async (collected) =>{
                sb_LogDebug(interaction, "Received reaction");
                sb_LogDebug(interaction, interaction.guildId === null);

                const reaction = collected.first();
                sb_LogDebug(interaction, reaction?.emoji);

                if(interaction.guildId === null || !reaction || (!reaction.emoji.id && !reaction.emoji.name)) 
                    throw Error("Unexpected reaction");

                if(await AddReactionID(interaction.guildId, role_id, reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name))
                    interaction.editReply("Reaction successfully added to database");
                else{
                    interaction.editReply("Database retrieval failed, reaction role couldn't be finalized");
                    sb_LogError(interaction, "Was the database reset? Or are you just stupid and deleted the file mid-command? That's because, this error shouldn't ever happen... right?");
                }

            }).catch((collected) => {
                interaction.editReply("Emoji wasn't selected in time. Ignoring command...")
                sb_LogDebug(interaction, "REACTION REJECTED: " + collected);
            });
        }else{
            interaction.reply("Command failed");
            sb_LogError(interaction, "Interaction failed. Is the database synced?");
        }
    }
}