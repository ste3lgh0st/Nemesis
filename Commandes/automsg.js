const Discord = require("discord.js");

module.exports = {
    name: "automsg",
    description: "Active ou désactive le message automatique de 17h",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,
    options: [
        {
            type: Discord.ApplicationCommandOptionType.Boolean,
            name: "etat",
            description: "True pour activer, False pour désactiver",
            required: true
        }
    ],

    async run(bot, message, args) {
        let etat = args.getBoolean("etat");
        bot.autoMsgEnabled = etat;

        if (etat) {
            await message.reply({ content: "Le message automatique de 17h a été **activé**.", ephemeral: true });
        } else {
            await message.reply({ content: "Le message automatique de 17h a été **désactivé**.", ephemeral: true });
        }
    }
};