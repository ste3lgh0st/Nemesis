const Discord = require("discord.js");

module.exports = {
    name: "panel-braquage",
    description: "Affiche le panel de déclaration de braquage",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    async run(bot, interaction) {
        const embed = new Discord.EmbedBuilder()
            .setColor("#FFFFFF")
            .setTitle("🔫 DÉCLARATION DE BRAQUAGE")
            .setDescription("Cliquez sur le bouton correspondant au type de braquage effectué pour en faire la déclaration officielle.")
            .setFooter({ 
                text: "MAFIA The Olympius Syndicate", 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            });

        const row1 = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("btn_braquage_atm")
                .setLabel("ATM")
                .setStyle(Discord.ButtonStyle.Secondary), // Gris

            new Discord.ButtonBuilder()
                .setCustomId("btn_braquage_conteneur")
                .setLabel("Conteneur")
                .setStyle(Discord.ButtonStyle.Danger), // Rouge

            new Discord.ButtonBuilder()
                .setCustomId("btn_braquage_superette")
                .setLabel("Supérette")
                .setStyle(Discord.ButtonStyle.Success) // Vert
        );

        const row2 = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("btn_braquage_fleeca")
                .setLabel("Fleeca")
                .setStyle(Discord.ButtonStyle.Success), // Bleu

            new Discord.ButtonBuilder()
                .setCustomId("btn_braquage_bijouterie")
                .setLabel("Bijouterie")
                .setStyle(Discord.ButtonStyle.Primary), // Bleu

            new Discord.ButtonBuilder()
                .setCustomId("btn_braquage_banque_centrale")
                .setLabel("Banque Centrale")
                .setStyle(Discord.ButtonStyle.Primary) // Bleu
        );

        await interaction.reply({
            embeds: [embed],
            components: [row1, row2]
        });
    }
};