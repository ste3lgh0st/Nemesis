const fs = require("fs");

module.exports = async (bot) => {
    const files = fs.readdirSync("./Events").filter(f => f.endsWith(".js"));

    for (const file of files) {
        const event = require(`../Events/${file}`);
        const eventName = event.name || file.replace(".js", "");

        if (typeof event === "function") {
            bot.on(eventName, event.bind(null, bot));
        } else if (event && typeof event.run === "function") {
            if (event.once) {
                bot.once(eventName, (...args) => event.run(bot, ...args));
            } else {
                bot.on(eventName, (...args) => event.run(bot, ...args));
            }
        }

        console.log(`Événement ${file} chargé avec succès`);
    }
};