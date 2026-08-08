const Discord = require("discord.js");

module.exports = {
    name: "retrogradation",
    description: "Émet une rétrogradation officielle",
    category: "Gestion",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    async run(bot, interaction) {
        const modal = new Discord.ModalBuilder()
            .setCustomId("modal_retrogradation")
            .setTitle("Rétrogradation Officielle");

        const inputMembre = new Discord.TextInputBuilder()
            .setCustomId("input_membre")
            .setLabel("Membre (mention, pseudo ou ID)")
            .setPlaceholder("Ex: @Nom ou ID Discord")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputGrade = new Discord.TextInputBuilder()
            .setCustomId("input_grade")
            .setLabel("Nouveau Grade")
            .setPlaceholder("Ex: Associé")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputMotif = new Discord.TextInputBuilder()
            .setCustomId("input_motif")
            .setLabel("Motif de la rétrogradation")
            .setPlaceholder("Ex: Non-respect des consignes, manquements...")
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new Discord.ActionRowBuilder().addComponents(inputMembre),
            new Discord.ActionRowBuilder().addComponents(inputGrade),
            new Discord.ActionRowBuilder().addComponents(inputMotif)
        );

        await interaction.showModal(modal);
    }
};