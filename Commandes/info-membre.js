const Discord = require("discord.js");
const hierarchie = require("../hierarchie.json");

const ROLES_WARN = {
    "1472563147834392712": "Warn 1", 
    "1472563147423482060": "Warn 2", 
    "1472563147423482059": "Warn 3 (Dernier)"  
};

const ROLE_MEG = "1508213003743531199";
const ROLE_BLACKLIST = "1529047916126142555";
const ROLE_CONVOCATION = "1508254552044998748";
const ROLE_MORT_RP = "1508389958006865931";

module.exports = {
    name: "info-membre",
    description: "Consulter la fiche RP et les sanctions d'un membre",
    category: "Information",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,
    options: [
        {
            type: Discord.ApplicationCommandOptionType.User,
            name: "membre",
            description: "Le membre à consulter",
            required: true
        }
    ],

    async run(bot, interaction) {
        const user = interaction.options.getUser("membre");
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({
                content: "❌ Impossible de trouver ce membre sur le serveur.",
                flags: Discord.MessageFlags.Ephemeral
            });
        }

        const idsHierarchie = hierarchie.roles.map(r => r.id);
        const roleHierarchie = member.roles.cache.find(r => idsHierarchie.includes(r.id));
        const gradeNom = roleHierarchie ? `<@&${roleHierarchie.id}>` : "Aucun grade attribué";

        const warnsActifs = [];
        for (const [roleId, label] of Object.entries(ROLES_WARN)) {
            if (member.roles.cache.has(roleId)) {
                warnsActifs.push(label);
            }
        }
        const warnsTexte = warnsActifs.length > 0 ? warnsActifs.join(", ") : "Aucun";

        const aMEG = member.roles.cache.has(ROLE_MEG) ? "Oui" : "Non";
        const aBlacklist = member.roles.cache.has(ROLE_BLACKLIST) ? "Oui" : "Non";
        const aConvocation = member.roles.cache.has(ROLE_CONVOCATION) ? "Oui" : "Non";
        const aMortRP = member.roles.cache.has(ROLE_MORT_RP) ? "Oui" : "Non";

        const dateArrivee = member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : "Inconnue";

        const template = `## FICHE MEMBRE\n **__MAFIA The Olympius Syndicate__**\n\n**Membre :** ${member}\n**Pseudo Discord :** ${member.user.tag}\n**Rejoint le serveur :** ${dateArrivee}\n\n**Grade actuel :** ${gradeNom}\n\n**-- Statut des Sanctions --**\n**Avertissements (Warns) :** ${warnsTexte}\n**Mise en garde (MEG) :** ${aMEG}\n**Convocation en cours :** ${aConvocation}\n**Blacklisté :** ${aBlacklist}\n**Mort RP :** ${aMortRP}\n\n**Cordialement,**\n<@&1508046852027842600>`;

        await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
    }
};