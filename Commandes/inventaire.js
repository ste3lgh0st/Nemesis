const Discord = require("discord.js");

module.exports = {
    name: "inventaire",
    description: "Affiche le contenu actuel d'un coffre",
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
        if (!bot.inventaire) {
            bot.inventaire = { appli: {}, lead: {} };
        }

        let stocks = bot.inventaire[typeCoffre];
        let nomCoffre = typeCoffre === "appli" ? "Coffre Application" : "Coffre Lead";

        let listeObjets = Object.keys(stocks);

        if (listeObjets.length === 0) {
            return await message.reply({ content: `Le **${nomCoffre}** est actuellement vide.`, ephemeral: true });
        }

        let texte = `**__Contenu du ${nomCoffre}__**\n\n`;
        let index = 1;
        for (let objet in stocks) {
            texte += `- ${index}. x${stocks[objet]} ${objet}\n`;
            index++;
        }

        const embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(`Inventaire - ${nomCoffre}`)
            .setDescription(texte);

        await message.reply({ embeds: [embed] });
    }
};