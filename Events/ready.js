const Discord = require("discord.js");
const cron = require("node-cron");
const loadSlashCommands = require("../Loaders/loadSlashCommands");

module.exports = async (bot) => {
    console.log(`${bot.user.tag} est bien en ligne !`);

    bot.inventaire = {
        appli: {},
        lead: {}
    };

    await loadSlashCommands(bot);

    bot.autoMsgEnabled = true;

    const CHANNEL_ID = "1529063456764854282";

    cron.schedule("0 17 * * *", async () => {
        if (!bot.autoMsgEnabled) return;

        try {
            const channel = await bot.channels.fetch(CHANNEL_ID);
            if (channel) {
                const messageTexte = `Bonjour <@&1472563147834392718>,\n\nLe conseil aura lieu à **21h00.** \n\nToute personne **présente** au conseil devra rester disponible pour prendre son service à son issue.\nIl est **inutile** d'y assister si vous n'avez pas l'intention de rester en service par la suite.\nLes consignes de la soirée y seront transmises.\n\nFréquence radio actuelle : **10.01**`;

                await channel.send({ content: messageTexte });
            }
        } catch (error) {
            console.error(error);
        }
    }, {
        timezone: "Europe/Paris"
    });
};