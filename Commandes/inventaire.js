const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

const inventairePath = path.join(__dirname, "../inventaire.json"); // Ajuste le chemin vers inventaire.json si besoin

module.exports = {
    name: "inventaire",
    description: "Affiche le contenu actuel d'un coffre",
    category: "Gestion",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,
    options: [
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: "coffre",
            description: "Sélectionne le coffre à consulter",
            required: true,
            choices: [
                { name: "Coffre application", value: "appli" },
                { name: "Coffre lead", value: "lead" }
            ]
        }
    ],

    async run(bot, message, args) {
        let typeCoffre = args.getString("coffre");

        // 📁 LECTURE DE L'INVENTAIRE DEPUIS LE FICHIER JSON
        let inventaire = { appli: {}, lead: {} };
        if (fs.existsSync(inventairePath)) {
            try {
                inventaire = JSON.parse(fs.readFileSync(inventairePath, "utf8"));
            } catch (err) {
                console.error("Erreur lecture inventaire.json :", err);
            }
        }

        let stocks = inventaire[typeCoffre] || {};
        let nomCoffre = typeCoffre === "appli" ? "Coffre Application" : "Coffre Lead";

        let listeObjets = Object.keys(stocks);

        if (listeObjets.length === 0) {
            return await message.reply({ content: `Le **${nomCoffre}** est actuellement vide.`, flags: Discord.MessageFlags.Ephemeral });
        }

        let texte = `**__Contenu du ${nomCoffre}__**\n\n`;
        let index = 1;
        for (let objet in stocks) {
            texte += `- ${index}. x${stocks[objet]} ${objet}\n`;
            index++;
        }

        const embed = new Discord.EmbedBuilder()
            .setColor(bot.color || "#2b2d31")
            .setTitle(`Inventaire - ${nomCoffre}`)
            .setDescription(texte);

        await message.reply({ embeds: [embed] });
    }
};