const Discord = require("discord.js");

module.exports = {
    name: Discord.Events.ClientReady,
    once: true,
    async run(bot) {
        console.log(`🟢 ${bot.user.tag} est bien connecté et prêt !`);

        bot.inventaire = {
            appli: {},
            lead: {}
        };

        bot.autoMsgEnabled = true;

        const setmsgconseilCmd = bot.commands.get("setmsgconseil");
        if (setmsgconseilCmd && typeof setmsgconseilCmd.initCron === "function") {
            setmsgconseilCmd.initCron(bot);
            console.log("⏰ Tâche automatisée du conseil initialisée.");
        }
    }
};