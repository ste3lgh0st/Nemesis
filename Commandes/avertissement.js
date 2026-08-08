const Discord = require("discord.js");

module.exports = {
    name: "avertissement",
    description: "Émet un avertissement officiel à un membre",
    category: "Gestion",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    async run(bot, interaction) {
        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("warn_lvl_1")
                .setLabel("1er Avertissement")
                .setStyle(Discord.ButtonStyle.Primary), 
            new Discord.ButtonBuilder()
                .setCustomId("warn_lvl_2")
                .setLabel("2e Avertissement")
                .setStyle(Discord.ButtonStyle.Secondary), 
            new Discord.ButtonBuilder()
                .setCustomId("warn_lvl_3")
                .setLabel("3e Avertissement")
                .setStyle(Discord.ButtonStyle.Danger) 
        );

        await interaction.reply({
            content: "Veuillez sélectionner le niveau d'avertissement :",
            components: [row],
            ephemeral: true
        });
    }
};