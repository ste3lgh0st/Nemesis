const Discord = require("discord.js");

module.exports = {
    name: "prime",
    description: "Publie un avis d'attribution de prime",
    category: "Gestion",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    async run(bot, message) {
        const modal = new Discord.ModalBuilder()
            .setCustomId("modal_prime")
            .setTitle("Attribuer une Prime");

        const inputMembre = new Discord.TextInputBuilder()
            .setCustomId("input_membre")
            .setLabel("Membre bénéficiant d'une prime")
            .setPlaceholder("Ex: @Nom ou Pseudo")
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
            .setPlaceholder("Indiquez le motif de la prime...")
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new Discord.ActionRowBuilder().addComponents(inputMembre),
            new Discord.ActionRowBuilder().addComponents(inputEmetteur),
            new Discord.ActionRowBuilder().addComponents(inputMotif)
        );

        await message.showModal(modal);
    }
};