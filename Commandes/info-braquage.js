const Discord = require("discord.js");

module.exports = {
    name: "info-braquage",
    description: "Affiche le panneau d'information sur les règles de braquage",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    async run(bot, message) {
        // Embed récapitulatif des règles de braquage
        const embed = new Discord.EmbedBuilder()
            .setTitle("💰 RÈGLES ET INFORMATIONS BRAQUAGES")
            .setColor("#FFD700") // Couleur Or/Jaune
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
            .setFooter({ text: "MAFIA The Olympius Syndicate", iconURL: message.guild.iconURL() })
            .setTimestamp();

        // Envoi du message avec la mention + l'embed
        await message.channel.send({
            content: "__Voici les infos pour les braquages__ <@&1472563147834392718>",
            embeds: [embed],
            allowedMentions: { parse: ["roles"] }
        });

        // Confirmation éphémère si exécuté via Slash Command
        if (message.isChatInputCommand && message.isChatInputCommand()) {
            await message.reply({ content: "Panneau des braquages envoyé avec succès !", flags: Discord.MessageFlags.Ephemeral });
        }
    }
};