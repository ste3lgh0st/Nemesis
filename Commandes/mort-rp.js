const Discord = require("discord.js");

module.exports = {
    name: "mort-rp",
    description: "Publie un avis d'exécution officielle (Mort RP)",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    async run(bot, message) {
        const modal = new Discord.ModalBuilder()
            .setCustomId("modal_mort_rp")
            .setTitle("Émettre une Exécution Officielle");

        const inputMembre = new Discord.TextInputBuilder()
            .setCustomId("input_membre")
            .setLabel("Membre décédé")
            .setPlaceholder("Ex: @Nom ou Pseudo")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputEmetteur = new Discord.TextInputBuilder()
            .setCustomId("input_emetteur")
            .setLabel("Exécuté par")
            .setPlaceholder("Ex: @Nom ou Pseudo")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputDateHeure = new Discord.TextInputBuilder()
            .setCustomId("input_date_heure")
            .setLabel("Date et heure du décès")
            .setPlaceholder("Ex: 24/07/2026 à 22h30")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputMotif = new Discord.TextInputBuilder()
            .setCustomId("input_motif")
            .setLabel("Motif")
            .setPlaceholder("Indiquez le motif de l'exécution...")
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new Discord.ActionRowBuilder().addComponents(inputMembre),
            new Discord.ActionRowBuilder().addComponents(inputEmetteur),
            new Discord.ActionRowBuilder().addComponents(inputDateHeure),
            new Discord.ActionRowBuilder().addComponents(inputMotif)
        );

        await message.showModal(modal);
    }
};