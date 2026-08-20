const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { Player } = require("discord-player");
const http = require("http");
const loadCommands = require("./Loaders/loadCommands.js");
const loadEvents = require("./Loaders/loadEvents.js");
const config = require("./config");
const { DefaultExtractors } = require('@discord-player/extractor');

// Serveur HTTP pour maintenir Render actif
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot Nemesis en ligne !");
}).listen(PORT, () => {
    console.log(`🟢 Serveur Web en écoute sur le port ${PORT}`);
});

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ]
});

const player = new Player(bot);
bot.player = player;

bot.commands = new Collection();
bot.color = "#0309e2";
bot.function = {
    createId: require("./Fonctions/createId"),
};

process.on("unhandledRejection", (reason) => {
    console.error(" [Anti-Crash] Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
    console.error(" [Anti-Crash] Uncaught Exception:", err);
});

async function startBot() {
    try {
        console.log("--- DÉMARRAGE DU BOT ---");
        
        await player.extractors.loadMulti(DefaultExtractors);
        console.log("Extracteurs chargés.");
        
        await loadCommands(bot);
        console.log("Commandes chargées.");
        
        await loadEvents(bot);
        console.log("Événements chargés.");

        const token = process.env.TOKEN || config.token;
        if (!token) {
            throw new Error("TOKEN manquant ! Vérifie l'onglet Environment sur Render.");
        }

        console.log("Connexion à Discord en cours...");
        await bot.login(token.trim());
        console.log("🟢 Connexion à Discord réussie !");
    } catch (err) {
        console.error("🔴 ERREUR CRITIQUE AU LANCEMENT :", err);
    }
}

startBot();