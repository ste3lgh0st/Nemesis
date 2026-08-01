const Discord = require("discord.js");

module.exports = {
    name: "promotion",
    description: "Publie un avis de promotion officielle",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    async run(bot, message) {
        const modal = new Discord.ModalBuilder()
            .setCustomId("modal_promotion")
            .setTitle("Émettre une Promotion");

        const inputMembre = new Discord.TextInputBuilder()
            .setCustomId("input_membre")
            .setLabel("Membre promu")
            .setPlaceholder("Ex: @Nom ou Pseudo RP")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputGrade = new Discord.TextInputBuilder()
            .setCustomId("input_grade")
            .setLabel("Nouveau Grade")
            .setPlaceholder("Ex: Sergent / Capitaine / Officier II")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputEmetteur = new Discord.TextInputBuilder()
            .setCustomId("input_emetteur")
            .setLabel("Émis par")
            .setPlaceholder("Ex: @Nom ou Ton Pseudo")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputMotif = new Discord.TextInputBuilder()
            .setCustomId("input_motif")
            .setLabel("Motif")
            .setPlaceholder("Indiquez le motif de la promotion...")
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new Discord.ActionRowBuilder().addComponents(inputMembre),
            new Discord.ActionRowBuilder().addComponents(inputGrade),
            new Discord.ActionRowBuilder().addComponents(inputEmetteur),
            new Discord.ActionRowBuilder().addComponents(inputMotif)
        );

        await message.showModal(modal);
    }
};