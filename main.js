const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { Player } = require("discord-player");
const { DefaultExtractors } = require("@discord-player/extractor");
const http = require("http");

const loadCommands = require("./Loaders/loadCommands.js");
const loadEvents = require("./Loaders/loadEvents.js");
const loadSlashCommands = require("./Loaders/loadSlashCommands.js");
const config = require("./config");

// Serveur HTTP Keep-Alive (Pour hébergeurs web comme Render, Replit, etc.)
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bot Nemesis en ligne !");
}).listen(PORT, () => {
    console.log(`🟢 Serveur Web Keep-Alive en écoute sur le port ${PORT}`);
});

// Instance du Client Discord
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

bot.commands = new Collection();
bot.color = "#0309e2";
bot.function = {
    createId: require("./Fonctions/createId")
};

// Anti-Crash System
process.on("unhandledRejection", (reason) => {
    console.error("⚠️ [Anti-Crash] Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
    console.error("⚠️ [Anti-Crash] Uncaught Exception:", err);
});

async function startBot() {
    try {
        console.log("--- DÉMARRAGE DU BOT ---");

        // 1. Initialisation de discord-player
        try {
            const player = new Player(bot);
            bot.player = player;
            await player.extractors.loadMulti(DefaultExtractors);
            console.log("🎵 Extracteurs audio chargés avec succès.");
        } catch (e) {
            console.error("⚠️ Erreur lors du chargement des extracteurs audio :", e.message);
        }

        // 2. Chargement des commandes et des événements
        await loadCommands(bot);
        await loadEvents(bot);

        // 3. Récupération du Token
        const token = process.env.TOKEN || config.token;
        if (!token) {
            throw new Error("TOKEN manquant dans les variables d'environnement ou config.js");
        }

        // 4. Connexion à Discord
        console.log("Connexion à l'API Discord...");
        await bot.login(token.trim());

        // 5. Enregistrement des Slash Commands
        await loadSlashCommands(bot);

    } catch (err) {
        console.error("🔴 ERREUR CRITIQUE AU LANCEMENT :", err);
    }
}

startBot();