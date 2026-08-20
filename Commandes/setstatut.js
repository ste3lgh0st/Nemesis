const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    ActivityType, 
    MessageFlags 
} = require("discord.js");

module.exports = {
    name: "setstatus",
    description: "Changer le statut du bot (Présence / Activité)",
    category: "Administration",
    permission: PermissionFlagsBits.Administrator,
    dm: false,
    slash: new SlashCommandBuilder()
        .setName("setstatus")
        .setDescription("Changer le statut du bot (Présence / Activité)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt =>
            opt.setName("texte")
               .setDescription("Le texte du statut à afficher")
               .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("type")
               .setDescription("Le type d'activité")
               .setRequired(false)
               .addChoices(
                   { name: "Joue à (Playing)", value: "Playing" },
                   { name: "Écoute (Listening)", value: "Listening" },
                   { name: "Regarde (Watching)", value: "Watching" },
                   { name: "Participe à (Competing)", value: "Competing" }
               )
        )
        .addStringOption(opt =>
            opt.setName("statut")
               .setDescription("L'état de présence (En ligne, Inactif, etc.)")
               .setRequired(false)
               .addChoices(
                   { name: "En ligne (Online)", value: "online" },
                   { name: "Inactif (Idle)", value: "idle" },
                   { name: "Ne pas déranger (DND)", value: "dnd" },
                   { name: "Invisible", value: "invisible" }
               )
        ),

    async run(bot, interaction) {
        const texte = interaction.options.getString("texte");
        const typeStr = interaction.options.getString("type") || "Playing";
        const status = interaction.options.getString("statut") || "online";

        let activityType = ActivityType.Playing;
        if (typeStr === "Listening") activityType = ActivityType.Listening;
        if (typeStr === "Watching") activityType = ActivityType.Watching;
        if (typeStr === "Competing") activityType = ActivityType.Competing;

        try {
            bot.user.setPresence({
                activities: [{ name: texte, type: activityType }],
                status: status
            });

            await interaction.reply({
                content: `✅ Statut mis à jour avec succès !\n**Activité :** ${typeStr} **${texte}**\n**Présence :** ${status}`,
                flags: MessageFlags.Ephemeral
            });
        } catch (err) {
            console.error("Erreur lors du changement de statut :", err);
            await interaction.reply({
                content: "❌ Une erreur est survenue lors de la mise à jour du statut.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};