const Discord = require("discord.js");

module.exports = {
    name: "setup-patrouille",
    description: "Affiche le panneau de prise de patrouille",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    async run(bot, interaction) {
        const template = `# GESTION DES PATROUILLES\n\n## MAFIA The Olympius Syndicate\n\nCliquez sur le bouton ci-dessous pour démarrer une patrouille officielle.\n\nAssurez-vous de renseigner correctement l'ensemble de l'équipage ainsi que les informations relatives au véhicule.\n\n**Cordialement,**\n<@&1508046852027842600>`;

        const btn = new Discord.ButtonBuilder()
            .setCustomId("btn_start_patrouille")
            .setLabel("Commencer une patrouille")
            .setStyle(Discord.ButtonStyle.Success);

        const row = new Discord.ActionRowBuilder().addComponents(btn);

        await interaction.reply({
            content: "Panneau de patrouille déployé !",
            flags: Discord.MessageFlags.Ephemeral
        });

        await interaction.channel.send({
            content: template,
            components: [row]
        });
    }
};