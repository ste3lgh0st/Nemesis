const Discord = require("discord.js");
const cron = require("node-cron");

module.exports = {
    name: Discord.Events.ClientReady,
    once: true,
    async run(bot) {
        console.log(`🟢 ${bot.user.tag} est bien connecté et prêt !`);

        bot.inventaire = {
            appli: {},
            lead: {}
        };

        try {
            const loadSlashCommands = require("../Loaders/loadSlashCommands.js");
            if (typeof loadSlashCommands === "function") {
                await loadSlashCommands(bot);
            }
        } catch (e) {
            console.warn("⚠️ Loader loadSlashCommands non trouvé ou ignoré (enregistré dans main.js).");
        }

        bot.autoMsgEnabled = true;

        const CHANNEL_ID = "1529063456764854282";

        cron.schedule("0 16 * * *", async () => {
            if (!bot.autoMsgEnabled) return;

            try {
                const channel = await bot.channels.fetch(CHANNEL_ID);
                if (channel) {
                    const messageTexte = `Bonjour <@&1472563147834392718>,\n\nLe conseil aura lieu à **21h00.** \n\nToute personne **présente** au conseil devra rester disponible suite à celui-ci.\nIl est **inutile** d'y assister si vous n'avez pas l'intention de rester par la suite.\nLes informations de la soirée y seront partagées. Si vous en avez, vous êtes évidemment autorisés, __sans couper la parole de quiconque__, à tenir informer les membres présent au conseil de votre information. \n\nFréquence radio actuelle : **11.44**`;

                    await channel.send({ content: messageTexte });
                }
            } catch (error) {
                console.error("Erreur lors de l'envoi du message cron:", error);
            }
        }, {
            timezone: "Europe/Paris"
        });
    }
};