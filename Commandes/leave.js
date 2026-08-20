const { SlashCommandBuilder, MessageFlags } = require("discord.js");

const OWNER_ID = "1202502660469817394";

module.exports = {
    name: "leave",
    description: "Fait quitter le bot du serveur actuel (Réservé au créateur)",
    category: "Administration",
    dm: false,
    slash: new SlashCommandBuilder()
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