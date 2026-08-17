const fs = require("fs");

module.exports = bot => {
    const files = fs.readdirSync("./Commandes").filter(f => f.endsWith(".js"));

    for (const file of files) {
        try {
            const command = require(`../Commandes/${file}`);

            if (!command.name || typeof command.name !== "string") {
                console.warn(`⚠️ [Attention] La commande dans le fichier ${file} n'a pas de propriété 'name' valide !`);
                continue;
            }

            bot.commands.set(command.name, command);
            console.log(`Commande ${file} chargée avec succès`);
        } catch (error) {
            console.error(`❌ Erreur lors de la lecture du fichier ${file} :`, error);
        }
    }
};