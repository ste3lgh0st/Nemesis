const { Events, ActivityType } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    async run(bot) {
        console.log(`🟢 ${bot.user.tag} est bien connecté et prêt !`);

        if (bot.user) {
            bot.user.setPresence({
                activities: [{ name: "The Olympius Syndicate", type: ActivityType.Watching }],
                status: "online"
            });
        }

        bot.inventaire = {
            appli: {},
            lead: {}
        };

        bot.autoMsgEnabled = true;

        const setmsgconseilCmd = bot.commands?.get("setmsgconseil");
        if (setmsgconseilCmd && typeof setmsgconseilCmd.initCron === "function") {
            try {
                setmsgconseilCmd.initCron(bot);
                console.log("⏰ Tâche automatisée du conseil initialisée avec succès.");
            } catch (err) {
                console.error("❌ Erreur lors de l'initialisation du cron du conseil :", err);
            }
        }
    }
};