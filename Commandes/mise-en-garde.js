const Discord = require("discord.js");

module.exports = {
    name: "mise-en-garde",
    description: "Émet une mise en garde à un membre",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    async run(bot, interaction) {
        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("btn_mise_en_garde")
                .setLabel("Émettre une Mise en Garde")
                .setStyle(Discord.ButtonStyle.Warning)
        );

        await interaction.reply({
            content: "Cliquez ci-dessous pour remplir la mise en garde :",
            components: [row],
            ephemeral: true
        });
    }
};