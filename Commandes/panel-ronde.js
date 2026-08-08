const Discord = require("discord.js");

module.exports = {
    name: "panel-ronde",
    description: "Affiche le panneau de prise de ronde dans la Villa",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,

    async run(bot, message, args) {
        // Template d'affichage du panneau dans le salon
        const templateSetup = `# 🛡️ PRISE DE RONDE\n\n## MAFIA The Olympius Syndicate\n\nCliquez sur le bouton ci-dessous pour effectuer votre prise de ronde.\n\nRemplissez correctement les sections contrôlées et la liste des membres présents.\n\n**Cordialement,**\n<@&1508046852027842600>`;

        // Bouton interactif pour ouvrir le modal
        const btnStart = new Discord.ButtonBuilder()
            .setCustomId("btn_start_ronde")
            .setLabel("Prendre une ronde")
            .setStyle(Discord.ButtonStyle.Success)
            .setEmoji("🛡️");

        const row = new Discord.ActionRowBuilder().addComponents(btnStart);

        await message.channel.send({
            content: templateSetup,
            components: [row]
        });

        if (message.deletable) await message.delete().catch(() => {});
    }
};