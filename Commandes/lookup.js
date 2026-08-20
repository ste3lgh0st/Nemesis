const { PermissionFlagsBits, SlashCommandBuilder, MessageFlags } = require("discord.js");
const hierarchie = require("../hierarchie.json");

const ROLES_WARN = {
    "1472563147834392712": "Warn 1", 
    "1472563147423482060": "Warn 2"
};

const ROLE_MEG = "1508213003743531199";
const ROLE_BLACKLIST = "1529047916126142555";
const ROLE_CONVOCATION = "1508254552044998748";
const ROLE_MORT_RP = "1508389958006865931";
const ROLE_STAFF = "1508046852027842600";

module.exports = {
    name: "lookup",
    description: "Consulter la fiche RP et les sanctions d'un membre",
    category: "Information",
    permission: PermissionFlagsBits.Administrator,
    dm: false,
    slash: new SlashCommandBuilder()
        .setName("lookup")
        .setDescription("Consulter la fiche RP et les sanctions d'un membre")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt =>
            opt.setName("membre")
               .setDescription("Le membre à consulter")
               .setRequired(true)
        ),

    async run(bot, interaction) {
        const user = interaction.options.getUser("membre");
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({
                content: "❌ Impossible de trouver ce membre sur le serveur.",
                flags: MessageFlags.Ephemeral
            });
        }

        const idsHierarchie = new Set(hierarchie.roles.map(r => r.id));
        const roleHierarchie = member.roles.cache.find(r => idsHierarchie.has(r.id));
        const gradeNom = roleHierarchie ? `<@&${roleHierarchie.id}>` : "Aucun grade attribué";

        const warnsActifs = Object.entries(ROLES_WARN)
            .filter(([roleId]) => member.roles.cache.has(roleId))
            .map(([, label]) => label);
        const warnsTexte = warnsActifs.length > 0 ? warnsActifs.join(", ") : "Aucun";

        const aMEG = member.roles.cache.has(ROLE_MEG) ? "Oui" : "Non";
        const aBlacklist = member.roles.cache.has(ROLE_BLACKLIST) ? "Oui" : "Non";
        const aConvocation = member.roles.cache.has(ROLE_CONVOCATION) ? "Oui" : "Non";
        const aMortRP = member.roles.cache.has(ROLE_MORT_RP) ? "Oui" : "Non";

        const dateArrivee = member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Inconnue";

        const template = `## FICHE MEMBRE\n **__MAFIA The Olympius Syndicate__**\n\n**Membre :** ${member}\n**Pseudo Discord :** ${member.user.tag}\n**Rejoint le serveur :** ${dateArrivee}\n\n**Grade actuel :** ${gradeNom}\n\n**-- Statut des Sanctions --**\n**Avertissements (Warns) :** ${warnsTexte}\n**Mise en garde (MEG) :** ${aMEG}\n**Convocation en cours :** ${aConvocation}\n**Blacklisté :** ${aBlacklist}\n**Mort RP :** ${aMortRP}\n\n**Cordialement,**\n<@&${ROLE_STAFF}>`;

        await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
    }
};