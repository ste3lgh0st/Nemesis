const Discord = require("discord.js");

const ROLE_MEG = "1508213003743531199";

module.exports = {
    name: "unmeg",
    description: "Retire la Mise en Garde d'un membre",
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
            description: "Raison du retrait de la mise en garde",
            required: false
        }
    ],

    async run(bot, interaction) {
        const user = interaction.options.getUser("membre");
        const motif = interaction.options.getString("motif") || "Comportement exemplaire suite au rappel";
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: "❌ Membre introuvable sur le serveur.", flags: Discord.MessageFlags.Ephemeral });
        }

        if (member.roles.cache.has(ROLE_MEG)) {
            await member.roles.remove(ROLE_MEG).catch(err => console.error("Erreur retrait MEG :", err));
        }

        const template = `# LEVÉE DE LA MISE EN GARDE\n\n## MAFIA The Olympius Syndicate\n\n**Membre :** ${member}\n\n**Décision prise par :** ${interaction.user}\n\n**Raison :**\n${motif}\n\nVotre comportement récent montre que vous avez pris en compte nos avertissements. La mise en garde est levée.\n\n**Cordialement,**\n<@&1508046852027842600>`;

        await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
    }
};