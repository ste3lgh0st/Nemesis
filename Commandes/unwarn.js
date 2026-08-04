const Discord = require("discord.js");

const ROLES_WARN = {
    1: "1472563147834392712", 
    2: "1472563147423482060", 
    3: "1472563147423482059"  
};

module.exports = {
    name: "unwarn",
    description: "Retire un avertissement à un membre",
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
            type: Discord.ApplicationCommandOptionType.Integer,
            name: "niveau",
            description: "Le niveau d'avertissement à retirer (1, 2 ou 3)",
            required: true,
            choices: [
                { name: "Warn 1", value: 1 },
                { name: "Warn 2", value: 2 },
                { name: "Warn 3 (Dernier)", value: 3 }
            ]
        },
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: "motif",
            description: "Raison du retrait du warn",
            required: false
        }
    ],

    async run(bot, interaction) {
        const user = interaction.options.getUser("membre");
        const level = interaction.options.getInteger("niveau");
        const motif = interaction.options.getString("motif") || "Rattrapage / Seconde chance accordée";
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: "❌ Membre introuvable sur le serveur.", flags: Discord.MessageFlags.Ephemeral });
        }

        const roleId = ROLES_WARN[level];
        if (roleId && member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId).catch(err => console.error("Erreur retrait warn :", err));
        }

        const template = `# RETRAIT D'AVERTISSEMENT\n\n## MAFIA The Olympius Syndicate\n\n**Membre :** ${member}\n\n**Décision prise par :** ${interaction.user}\n\n**Avertissement retiré :** Warn Niveau ${level}\n\n**Raison :**\n${motif}\n\nLa Direction a choisi de revoir sa position. Profitez de cette décision pour prouver votre sérieux au sein de la Famille.\n\n**Cordialement,**\n<@&1508046852027842600>`;

        await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
    }
};