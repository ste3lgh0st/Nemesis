const Discord = require("discord.js");

module.exports = {
    name: "coffre",
    description: "Affiche le panneau de gestion des coffres",
    category: "Gestion",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    async run(bot, message, args) {
        const ROLE_MAFIEUX_ID = "1472563147834392718";

        const embed = new Discord.EmbedBuilder()
            .setColor(bot.color || "#2f3136")
            .setTitle("Gestion des Coffres")
            .setDescription(`Bonjour <@&${ROLE_MAFIEUX_ID}>\nMerci de bien préciser les objets déposés ou retirés des coffres dans ce salon. Merci de respecter cette procédure sous peine de sanctions.`);

        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId("action_depot")
                    .setLabel("Dépôt")
                    .setStyle(Discord.ButtonStyle.Success),
                new Discord.ButtonBuilder()
                    .setCustomId("action_retrait")
                    .setLabel("Retrait")
                    .setStyle(Discord.ButtonStyle.Danger)
            );

        // Détection automatique : Slash Command (Interaction) ou Message classique
        if (message.isChatInputCommand && message.isChatInputCommand()) {
            await message.reply({ embeds: [embed], components: [row] });
        } else {
            await message.channel.send({ embeds: [embed], components: [row] });
        }
    }
};