const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(3276799);
const bot = new Discord.Client({ intents });
const loadCommands = require("./Loaders/loadCommands.js");
const loadEvents = require("./Loaders/loadEvents.js");
const config = require("./config");
const http = require('http');

// Anti-crash logs
process.on('unhandledRejection', (reason, promise) => {
    console.error(' [Anti-Crash] Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err, origin) => {
    console.error(' [Anti-Crash] Uncaught Exception:', err);
});

// Serveur HTTP (Un seul serveur suffit !)
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("Bot Nemesis en ligne !");
}).listen(PORT, () => {
    console.log(`Serveur HTTP en écoute sur le port ${PORT}`);
});

bot.commands = new Discord.Collection();
bot.color = "#0309e2";
bot.function = {
    createId: require("./Fonctions/createId"),
};

bot.login(config.token);
loadCommands(bot);
loadEvents(bot);