const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, MessageFlags } = require("discord.js");

const ROLE_MAFIEUX_ID = "1472563147834392718";

module.exports = {
    name: "info-braquage",
    description: "Affiche le panneau d'information sur les règles de braquage",
    category: "Information",
    permission: PermissionFlagsBits.Administrator,
    dm: false,
    slash: new SlashCommandBuilder()
        .setName("info-braquage")
        .setDescription("Affiche le panneau d'information sur les règles de braquage")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async run(bot, interaction) {
        const embed = new EmbedBuilder()
            .setTitle("💰 RÈGLES ET INFORMATIONS BRAQUAGES")
            .setColor(bot.color || "#0309e2")
            .setDescription(
                "- **__Supérettes__**\n" +
                "   - 1 à 4 braqueurs\n" +
                "   - 2 policiers minimum\n" +
                "   - 3 braquages maximum/jours.\n" +
                "   - Attendre **OBLIGATOIREMENT** 10 min l'arrivée des FDO avant de partir.\n\n" +

                "- **__Fleeca__**\n" +
                "   - 2 à 5 braqueurs\n" +
                "   - 4 policiers minimum\n" +
                "   - 1 braquage maximum/jours\n" +
                "   - 3 otages mini.\n\n" +

                "- **__Banque Centrale__**\n" +
                "   - 8 braqueurs minimum\n" +
                "   - 8 policiers minimum\n" +
                "   - Groupe officiel obligatoire\n" +
                "   - 1 braquage/semaine maximum\n" +
                "   - 6 otages minimum\n\n" +

                "- **__Bijouterie__**\n" +
                "   - 4 à 8 braqueurs\n" +
                "   - 6 policiers minimum\n" +
                "   - 1 braquage/jour\n" +
                "   - 5 otages minimum"
            )
            .setFooter({ text: "MAFIA The Olympius Syndicate", iconURL: interaction.guild?.iconURL() })
            .setTimestamp();

        if (interaction.channel) {
            await interaction.channel.send({
                content: `__Voici les infos pour les braquages__ <@&${ROLE_MAFIEUX_ID}>`,
                embeds: [embed],
                allowedMentions: { roles: [ROLE_MAFIEUX_ID] }
            });
        }

        if (interaction.isRepliable && interaction.isRepliable()) {
            await interaction.reply({ content: "Panneau des braquages envoyé avec succès !", flags: MessageFlags.Ephemeral });
        }
    }
};