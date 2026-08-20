const fs = require("fs");
const path = require("path");

module.exports = async (bot) => {
    const commandsPath = path.join(__dirname, "../Commandes");

    if (!fs.existsSync(commandsPath)) {
        console.warn("⚠️ [Attention] Le dossier ./Commandes n'existe pas !");
        return;
    }
    
    const getCommandFiles = (dir) => {
        let files = [];
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            if (item.isDirectory()) {
                files = files.concat(getCommandFiles(path.join(dir, item.name)));
            } else if (item.name.endsWith(".js")) {
                files.push(path.join(dir, item.name));
            }
        }
        return files;
    };

    const commandFiles = getCommandFiles(commandsPath);

    for (const filePath of commandFiles) {
        try {
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);

            if (!command.name || typeof command.name !== "string") {
                console.warn(`⚠️ [Attention] La commande dans ${path.basename(filePath)} n'a pas de propriété 'name' valide !`);
                continue;
            }

            if (typeof command.run !== "function") {
                console.warn(`⚠️ [Attention] La commande dans ${path.basename(filePath)} n'a pas de fonction 'run' !`);
                continue;
            }

            bot.commands.set(command.name, command);
            console.log(`Commande ${command.name} (${path.basename(filePath)}) chargée avec succès`);
        } catch (error) {
            console.error(`❌ Erreur lors du chargement de ${path.basename(filePath)} :`, error);
        }
    }
};