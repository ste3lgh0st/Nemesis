const Discord = require("discord.js");

module.exports = {
    name: "mise-en-garde",
    description: "Envoyer une mise en garde formelle",

    async run(bot, interaction) {
        const modal = new Discord.ModalBuilder()
            .setCustomId("modal_mise_en_garde")
            .setTitle("Mise en garde");

        const inputMembre = new Discord.TextInputBuilder()
            .setCustomId("input_membre")
            .setLabel("Membre visé (mention, pseudo ou ID)")
            .setPlaceholder("Ex: @Nom, nonop ou ID Discord")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputMotif = new Discord.TextInputBuilder()
            .setCustomId("input_motif")
            .setLabel("Raison / Rappel")
            .setPlaceholder("Indiquez le motif de la mise en garde...")
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new Discord.ActionRowBuilder().addComponents(inputMembre),
            new Discord.ActionRowBuilder().addComponents(inputMotif)
        );

        await interaction.showModal(modal);
    }
};