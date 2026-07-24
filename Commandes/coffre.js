const Discord = require("discord.js");

module.exports = {
    name: "coffre",
    description: "Affiche le panneau de gestion des coffres",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    async run(bot, message) {
        const ROLE_MAFIEUX_ID = "1472563147834392718";

        const embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle("Gestion des Coffres")
            .setDescription(`Bonjour <@&${ROLE_MAFIEUX_ID}> \n Merci de bien préciser les objets déposés ou retirés des coffres dans ce salon. Merci de respecter cette procédure sous peine de sanctions`);

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

        await message.reply({ embeds: [embed], components: [row] });
    }
};