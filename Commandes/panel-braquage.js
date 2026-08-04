const Discord = require("discord.js");

module.exports = {
    name: "panel-braquage",
    description: "Affiche le panneau de déclaration des braquages",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    async run(bot, message) {
        const embed = new Discord.EmbedBuilder()
            .setTitle("🔫 DÉCLARATION DE BRAQUAGE")
            .setColor("#2F3136")
            .setDescription("Cliquez sur le bouton correspondant au type de braquage effectué pour en faire la déclaration officielle.")
            .setFooter({ text: "MAFIA The Olympius Syndicate", iconURL: message.guild.iconURL() });

        // Première ligne de boutons (3 boutons)
        const row1 = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("btn_braquage_atm")
                .setLabel("ATM")
                .setStyle(Discord.ButtonStyle.Secondary), // Noir / Gris sombre
            new Discord.ButtonBuilder()
                .setCustomId("btn_braquage_conteneur")
                .setLabel("Conteneur")
                .setStyle(Discord.ButtonStyle.Danger), // Rouge
            new Discord.ButtonBuilder()
                .setCustomId("btn_braquage_superette")
                .setLabel("Supérette")
                .setStyle(Discord.ButtonStyle.Success) // Vert
        );

        // Deuxième ligne de boutons (3 boutons)
        const row2 = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("btn_braquage_fleeca")
                .setLabel("Fleeca")
                .setStyle(Discord.ButtonStyle.Primary), // Bleu
            new Discord.ButtonBuilder()
                .setCustomId("btn_braquage_bijouterie")
                .setLabel("Bijouterie")
                .setStyle(Discord.ButtonStyle.Primary), // Bleu (Diamant)
            new Discord.ButtonBuilder()
                .setCustomId("btn_braquage_banque_centrale")
                .setLabel("Banque Centrale")
                .setStyle(Discord.ButtonStyle.Secondary) // Style secondaire
        );

        await message.channel.send({
            embeds: [embed],
            components: [row1, row2]
        });

        if (message.isChatInputCommand && message.isChatInputCommand()) {
            await message.reply({ content: "Panneau de déclaration des braquages envoyé !", flags: Discord.MessageFlags.Ephemeral });
        }
    }
};