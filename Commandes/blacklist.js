const Discord = require("discord.js");

module.exports = {
    name: "blacklist",
    description: "Inscrit une personne sur la blacklist officielle",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    // 1. Déclenchement de la commande : Affichage du Modal
    async run(bot, message) {
        const modal = new Discord.ModalBuilder()
            .setCustomId("modal_blacklist")
            .setTitle("Inscription sur la Blacklist");

        const inputMembre = new Discord.TextInputBuilder()
            .setCustomId("input_membre")
            .setLabel("Personne visée")
            .setPlaceholder("Ex: @Nom ou Pseudo")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputEmetteur = new Discord.TextInputBuilder()
            .setCustomId("input_emetteur")
            .setLabel("Inscription décidée par")
            .setPlaceholder("Ex: @Nom ou Ton Pseudo")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputDuree = new Discord.TextInputBuilder()
            .setCustomId("input_duree")
            .setLabel("Durée (Permanente / Ex: 1 mois)")
            .setPlaceholder("Ex: Permanente OU 1 mois")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputMotif = new Discord.TextInputBuilder()
            .setCustomId("input_motif")
            .setLabel("Motif")
            .setPlaceholder("Indiquez le motif de l'inscription...")
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new Discord.ActionRowBuilder().addComponents(inputMembre),
            new Discord.ActionRowBuilder().addComponents(inputEmetteur),
            new Discord.ActionRowBuilder().addComponents(inputDuree),
            new Discord.ActionRowBuilder().addComponents(inputMotif)
        );

        await message.showModal(modal);
    }
};