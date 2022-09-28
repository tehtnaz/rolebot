import { SlashCommandBuilder } from "discord.js";
import { AddReactionID, RegisterRoleID } from "../models/VoteRole.js";
export default {
    data: new SlashCommandBuilder()
        .setName("create_vote_role")
        .setDescription("React to this message in order to associate it with a role")
        .addRoleOption((option) => option.setName("role")
        .setDescription("the role").setRequired(true))
        .addIntegerOption((option) => option.setName("votes")
        .setDescription("amount of votes needed to receive role").setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        if (interaction.guildId === null)
            return;
        const role_id = interaction.options.getRole("role", true).id;
        if (await RegisterRoleID(interaction.guildId, role_id, interaction.options.getInteger("votes", true))) {
            const message = await interaction.reply({ content: "Registered the role to the database. Please react with the reaction you'd like", fetchReply: true });
            message.awaitReactions({ max: 1, time: 60000, errors: ['time'] }).then(collected => {
                console.log("received reaction");
                const reaction = collected.first();
                console.log(interaction.guildId === null);
                console.log(reaction?.emoji);
                if (interaction.guildId === null || !reaction || (!reaction.emoji.id && !reaction.emoji.name))
                    return;
                AddReactionID(interaction.guildId, role_id, reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name);
                interaction.editReply("Reaction successfully added to database");
            }).catch(collected => {
                interaction.editReply("Emoji wasn't selected in time. Ignoring command...");
            });
        }
        else {
            interaction.reply("Command failed");
        }
    }
};
