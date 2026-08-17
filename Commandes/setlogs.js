const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");

module.exports = {
    category: "Administration",
    data: new SlashCommandBuilder()
        .setName("setlogs")
        .setDescription("Configure ou désactive le salon de logs principal")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName("salon")
                .setDescription("Le salon où envoyer les logs (laisser vide pour désactiver)")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        ),

    async run(bot, interaction) {
        const channel = interaction.options.getChannel("salon");

        if (!bot.db) bot.db = new Map();

        if (!channel) {
            bot.db.delete(`logs_${interaction.guild.id}`);
            return interaction.reply({
                content: "⚙️ **Système de logs désactivé.** Aucun log ne sera envoyé.",
                flags: MessageFlags.Ephemeral
            });
        }

        bot.db.set(`logs_${interaction.guild.id}`, channel.id);

        return interaction.reply({
            content: `✅ **Système de logs activé !** Les logs seront envoyés dans ${channel}.`,
            flags: MessageFlags.Ephemeral
        });
    }
};