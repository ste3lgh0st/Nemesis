const fs = require("fs");
const path = require("path");

module.exports = async (bot) => {
    const commandsPath = path.join(__dirname, "../Commandes");

    if (!fs.existsSync(commandsPath)) {
        console.warn("⚠️ [Attention] Le dossier ./Commandes n'existe pas !");
        return;
    }

    // Récupération récursive de tous les fichiers .js
    const getCommandFiles = (dir) => {
        let files = [];
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                files = files.concat(getCommandFiles(fullPath));
            } else if (item.name.endsWith(".js")) {
                files.push(fullPath);
            }
        }
        return files;
    };

    const commandFiles = getCommandFiles(commandsPath);
    let loadedCount = 0;

    for (const filePath of commandFiles) {
        try {
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);

            // Support pour name direct OU command.data.name (SlashCommandBuilder)
            const commandName = command.name || command.data?.name;

            if (!commandName || typeof commandName !== "string") {
                console.warn(`⚠️ [Attention] La commande dans ${path.basename(filePath)} n'a pas de nom valide !`);
                continue;
            }

            if (typeof command.run !== "function") {
                console.warn(`⚠️ [Attention] La commande ${commandName} (${path.basename(filePath)}) n'a pas de fonction 'run' !`);
                continue;
            }

            bot.commands.set(commandName, command);
            loadedCount++;
            console.log(`✅ Commande chargée : ${commandName} (${path.basename(filePath)})`);
        } catch (error) {
            console.error(`❌ Erreur lors du chargement de ${path.basename(filePath)} :`, error);
        }
    }

    console.log(`🚀 Chargement terminé : ${loadedCount}/${commandFiles.length} commande(s) prête(s).`);
};