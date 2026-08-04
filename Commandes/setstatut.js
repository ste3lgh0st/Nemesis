const Discord = require("discord.js");

module.exports = {
    name: "setstatut",
    description: "Changer le statut du bot (Présence / Activité)",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,
    options: [
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: "texte",
            description: "Le texte du statut à afficher",
            required: true
        },
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: "type",
            description: "Le type d'activité",
            required: false,
            choices: [
                { name: "Joue à (Playing)", value: "Playing" },
                { name: "Écoute (Listening)", value: "Listening" },
                { name: "Regarde (Watching)", value: "Watching" },
                { name: "Participe à (Competing)", value: "Competing" }
            ]
        },
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: "statut",
            description: "L'état de présence (En ligne, Inactif, etc.)",
            required: false,
            choices: [
                { name: "En ligne (Online)", value: "online" },
                { name: "Inactif (Idle)", value: "idle" },
                { name: "Ne pas déranger (DND)", value: "dnd" },
                { name: "Invisible", value: "invisible" }
            ]
        }
    ],

    async run(bot, interaction) {
        const texte = interaction.options.getString("texte");
        const typeStr = interaction.options.getString("type") || "Playing";
        const status = interaction.options.getString("statut") || "online";

        let activityType = Discord.ActivityType.Playing;
        if (typeStr === "Listening") activityType = Discord.ActivityType.Listening;
        if (typeStr === "Watching") activityType = Discord.ActivityType.Watching;
        if (typeStr === "Competing") activityType = Discord.ActivityType.Competing;

        try {
            bot.user.setPresence({
                activities: [{ name: texte, type: activityType }],
                status: status
            });

            await interaction.reply({
                content: `✅ Statut mis à jour avec succès !\n**Activité :** ${typeStr} **${texte}**\n**Présence :** ${status}`,
                flags: Discord.MessageFlags.Ephemeral
            });
        } catch (err) {
            console.error("Erreur lors du changement de statut :", err);
            await interaction.reply({
                content: "❌ Une erreur est survenue lors de la mise à jour du statut.",
                flags: Discord.MessageFlags.Ephemeral
            });
        }
    }
};