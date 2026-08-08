const Discord = require("discord.js");

module.exports = {
    name: "convocation",
    description: "Émet une convocation officielle à un membre",
    category: "Gestion",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    async run(bot, message) {
        const modal = new Discord.ModalBuilder()
            .setCustomId("modal_convocation")
            .setTitle("Émettre une convocation");

        const inputMembre = new Discord.TextInputBuilder()
            .setCustomId("input_membre")
            .setLabel("Membre convoqué")
            .setPlaceholder("Ex: @Nom ou Pseudo")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputEmetteur = new Discord.TextInputBuilder()
            .setCustomId("input_emetteur")
            .setLabel("Convoqué par")
            .setPlaceholder("Ex: @Nom ou Ton Pseudo")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputHeure = new Discord.TextInputBuilder()
            .setCustomId("input_heure")
            .setLabel("Heure de la convocation")
            .setPlaceholder("Ex: 21h00")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputLieu = new Discord.TextInputBuilder()
            .setCustomId("input_lieu")
            .setLabel("Lieu de la convocation")
            .setPlaceholder("Ex: Salle de réunion, Bureau Lead")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputMotif = new Discord.TextInputBuilder()
            .setCustomId("input_motif")
            .setLabel("Motif de la convocation")
            .setPlaceholder("Indiquez la raison de la convocation...")
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new Discord.ActionRowBuilder().addComponents(inputMembre),
            new Discord.ActionRowBuilder().addComponents(inputEmetteur),
            new Discord.ActionRowBuilder().addComponents(inputHeure),
            new Discord.ActionRowBuilder().addComponents(inputLieu),
            new Discord.ActionRowBuilder().addComponents(inputMotif)
        );

        await message.showModal(modal);
    }
};