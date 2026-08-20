const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const { Player } = require("discord-player");
const http = require("http");
const loadCommands = require("./Loaders/loadCommands.js");
const loadEvents = require("./Loaders/loadEvents.js");
const config = require("./config");
const { DefaultExtractors } = require('@discord-player/extractor');

// Serveur HTTP Keep-Alive
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

bot.commands = new Collection();
bot.color = "#0309e2";
bot.function = {
    createId: require("./Fonctions/createId"),
};

// Anti-Crash
process.on("unhandledRejection", (reason) => {
    console.error(" [Anti-Crash] Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
    console.error(" [Anti-Crash] Uncaught Exception:", err);
});

// Événement d'allumage
bot.once("ready", async () => {
    console.log(`🟢 CONNECTÉ SUR DISCORD EN TANT QUE : ${bot.user.tag}`);

    // Initialisation de discord-player une fois connecté
    try {
        const player = new Player(bot);
        bot.player = player;
        await player.extractors.loadMulti(DefaultExtractors);
        console.log("Extracteurs audio chargés.");
    } catch (e) {
        console.error("⚠️ Erreur chargement extracteurs audio :", e.message);
    }

    // Enregistrement des commandes Slash
    const token = process.env.TOKEN || config.token;
    if (bot.commands.size > 0 && token) {
        try {
            const rest = new REST({ version: "10" }).setToken(token.trim());
            const commandsData = bot.commands.map(cmd => cmd.slash ? cmd.slash.toJSON() : cmd);
            await rest.put(Routes.applicationCommands(bot.user.id), { body: commandsData });
            console.log("✅ Commandes Slash enregistrées !");
        } catch (err) {
            console.error("❌ Erreur enregistrement Slash :", err);
        }
    }
});

async function startBot() {
    try {
        console.log("--- DÉMARRAGE DU BOT ---");
        
        await loadCommands(bot);
        await loadEvents(bot);

        const token = process.env.TOKEN || config.token;
        if (!token) {
            throw new Error("TOKEN manquant dans les variables d'environnement.");
        }

        console.log("Tentative de connexion à Discord...");
        await bot.login(token.trim());

    } catch (err) {
        console.error("🔴 ERREUR AU LANCEMENT :", err);
    }
}

startBot();