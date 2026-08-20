const fs = require("fs");
const path = require("path");

module.exports = async (bot) => {
    const eventsPath = path.join(__dirname, "../Events");

    if (!fs.existsSync(eventsPath)) {
        console.warn("⚠️ [Attention] Le dossier ./Events n'existe pas !");
        return;
    }

    const files = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));
    let loadedCount = 0;

    for (const file of files) {
        const filePath = path.join(eventsPath, file);

        try {
            delete require.cache[require.resolve(filePath)];
            const event = require(filePath);

            const eventName = event.name || file.replace(".js", "");

            if (typeof event === "function") {
                bot.on(eventName, (...args) => event(bot, ...args));
                loadedCount++;
                console.log(`✅ Événement chargé (fonction) : ${file} (${eventName})`);
            } else if (event && typeof event.run === "function") {
                if (event.once) {
                    bot.once(eventName, (...args) => event.run(bot, ...args));
                } else {
                    bot.on(eventName, (...args) => event.run(bot, ...args));
                }
                loadedCount++;
                console.log(`✅ Événement chargé (${event.once ? "once" : "on"}) : ${file} (${eventName})`);
            } else {
                console.warn(`⚠️ [Attention] L'événement ${file} ne possède ni fonction directe ni méthode 'run' !`);
            }
        } catch (error) {
            console.error(`❌ Erreur lors du chargement de l'événement ${file} :`, error);
        }
    }

    console.log(`🚀 Chargement terminé : ${loadedCount}/${files.length} événement(s) prêt(s).`);
};