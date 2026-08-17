const { ApplicationCommandOptionType, ChannelType, MessageFlags, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "setlogs",
    description: "Configure ou désactive le salon de logs principal",
    category: "Administration",
    options: [
        {
            name: "salon",
            description: "Le salon où envoyer les logs (laisser vide pour désactiver)",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false
        }
    ],

    async run(bot, interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Vous devez être Administrateur pour utiliser cette commande.",
                flags: MessageFlags.Ephemeral
            });
        }

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