const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");

const inventairePath = path.join(__dirname, "../inventaire.json");

module.exports = {
    name: "inventaire",
    description: "Affiche le contenu actuel d'un coffre",
    category: "Gestion",
    permission: PermissionFlagsBits.Administrator,
    dm: false,
    slash: new SlashCommandBuilder()
        .setName("inventaire")
        .setDescription("Affiche le contenu actuel d'un coffre")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt =>
            opt.setName("coffre")
               .setDescription("Sélectionne le coffre à consulter")
               .setRequired(true)
               .addChoices(
                   { name: "Coffre application", value: "appli" },
                   { name: "Coffre lead", value: "lead" }
               )
        ),

    async run(bot, interaction) {
        const typeCoffre = interaction.options.getString("coffre");

        let inventaire = { appli: {}, lead: {} };
        if (fs.existsSync(inventairePath)) {
            try {
                inventaire = JSON.parse(fs.readFileSync(inventairePath, "utf8"));
            } catch (err) {
                console.error("Erreur lecture inventaire.json :", err);
            }
        }

        const stocks = inventaire[typeCoffre] || {};
        const nomCoffre = typeCoffre === "appli" ? "Coffre Application" : "Coffre Lead";
        const listeObjets = Object.entries(stocks);

        if (listeObjets.length === 0) {
            return await interaction.reply({ 
                content: `Le **${nomCoffre}** est actuellement vide.`, 
                flags: MessageFlags.Ephemeral 
            });
        }

        const texte = listeObjets.map(([objet, quantite], index) => `- ${index + 1}. x${quantite} ${objet}`).join("\n");

        const embed = new EmbedBuilder()
            .setColor(bot.color || "#0309e2")
            .setTitle(`Inventaire - ${nomCoffre}`)
            .setDescription(`**__Contenu du ${nomCoffre}__**\n\n${texte}`);

        await interaction.reply({ embeds: [embed] });
    }
};