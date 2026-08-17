const { SlashCommandBuilder, MessageFlags } = require("discord.js");

// Remplace par ton ID Discord
const OWNER_ID = "TON_ID_DISCORD"; 

module.exports = {
    category: "Administration",
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Fait quitter le bot du serveur actuel (Réservé au créateur)"),

    async run(bot, interaction) {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: "❌ Seul le créateur du bot peut utiliser cette commande.",
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.reply("👋 Le bot quitte le serveur. À bientôt !");
        await interaction.guild.leave();
    }
};