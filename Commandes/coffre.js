const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");

const ROLE_MAFIEUX_ID = "1472563147834392718";

module.exports = {
    name: "coffre",
    description: "Affiche le panneau de gestion des coffres",
    category: "Gestion",
    permission: PermissionFlagsBits.Administrator,
    dm: false,
    slash: new SlashCommandBuilder()
        .setName("coffre")
        .setDescription("Affiche le panneau de gestion des coffres")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async run(bot, interaction) {
        const embed = new EmbedBuilder()
            .setColor(bot.color || "#0309e2")
            .setTitle("Gestion des Coffres")
            .setDescription(`Bonjour <@&${ROLE_MAFIEUX_ID}>\nMerci de bien préciser les objets déposés ou retirés des coffres dans ce salon. Merci de respecter cette procédure sous peine de sanctions.`);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("action_depot")
                    .setLabel("Dépôt")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("action_retrait")
                    .setLabel("Retrait")
                    .setStyle(ButtonStyle.Danger)
            );

        if (interaction.isRepliable && interaction.isRepliable()) {
            await interaction.reply({ embeds: [embed], components: [row] });
        } else if (interaction.channel) {
            await interaction.channel.send({ embeds: [embed], components: [row] });
        }
    }
};