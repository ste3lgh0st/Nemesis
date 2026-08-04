const Discord = require("discord.js");

const ROLE_BLACKLIST = "1529047916126142555";

module.exports = {
    name: "unblacklist",
    description: "Retire un membre de la Blacklist officielle",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,
    options: [
        {
            type: Discord.ApplicationCommandOptionType.User,
            name: "membre",
            description: "Le membre concerné",
            required: true
        },
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: "motif",
            description: "Raison du retrait de la blacklist",
            required: false
        }
    ],

    async run(bot, interaction) {
        const user = interaction.options.getUser("membre");
        const motif = interaction.options.getString("motif") || "Fin de peine / Accord de réintégration";
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: "❌ Membre introuvable sur le serveur.", flags: Discord.MessageFlags.Ephemeral });
        }

        if (member.roles.cache.has(ROLE_BLACKLIST)) {
            await member.roles.remove(ROLE_BLACKLIST).catch(err => console.error("Erreur retrait Blacklist :", err));
        }

        const template = `# RETRAIT DE LA BLACKLIST\n\n## MAFIA The Olympius Syndicate\n\n**Personne concernée :** ${member}\n\n**Décision prise par :** ${interaction.user}\n\n**Raison :**\n${motif}\n\nPar décision de la Direction, vous n'êtes plus inscrit sur la Blacklist de **The Olympius Syndicate**.\n\n**Cordialement,**\n<@&1508046852027842600>`;

        await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
    }
};