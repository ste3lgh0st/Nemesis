const Discord = require("discord.js");

module.exports = {
    name: "help",
    description: "Affiche la liste des commandes disponibles",
    category: "Informations",
    dm: true,
    options: [
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: "commande",
            description: "Obtenir des infos sur une commande précise",
            required: false
        }
    ],

    async run(bot, interaction) {
        const commandName = interaction.options.getString("commande");

        // Si l'utilisateur demande une commande spécifique
        if (commandName) {
            const cmd = bot.commands.get(commandName.toLowerCase()) || bot.commands.find(c => c.data?.name === commandName.toLowerCase());

            if (!cmd) {
                return interaction.reply({ content: "❌ Cette commande n'existe pas.", flags: Discord.MessageFlags.Ephemeral });
            }

            const name = cmd.name || cmd.data?.name;
            const description = cmd.description || cmd.data?.description;
            const category = cmd.category || "Aucune";

            const embedDetail = new Discord.EmbedBuilder()
                .setColor("#2b2d31")
                .setTitle(`📌 Commande /${name}`)
                .addFields(
                    { name: "Description", value: description || "Pas de description" },
                    { name: "Catégorie", value: category, inline: true }
                )
                .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [embedDetail] });
        }

        // Récupération et groupement de toutes les commandes par catégorie
        const categories = new Map();

        bot.commands.forEach((cmd) => {
            const category = cmd.category || "Non classé";
            const name = cmd.name || cmd.data?.name;
            const description = cmd.description || cmd.data?.description || "Pas de description";

            if (!name) return;

            if (!categories.has(category)) {
                categories.set(category, []);
            }
            categories.get(category).push({ name, description });
        });

        // Embed d'accueil principal
        const mainEmbed = new Discord.EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("📖 Menu d'aide")
            .setDescription("Séléctionne une catégorie dans le menu ci-dessous pour voir les commandes disponibles.")
            .setFooter({ text: `Total : ${bot.commands.size} commandes`, iconURL: bot.user.displayAvatarURL() });

        // Création du Select Menu
        const selectMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId("help_menu")
            .setPlaceholder("Choisis une catégorie...");

        categories.forEach((_, categoryName) => {
            selectMenu.addOptions({
                label: categoryName,
                value: categoryName,
                description: `Commandes liées à ${categoryName}`
            });
        });

        const row = new Discord.ActionRowBuilder().addComponents(selectMenu);

        const response = await interaction.reply({
            embeds: [mainEmbed],
            components: [row],
            fetchReply: true
        });

        // Collecteur pour la sélection du menu
        const collector = response.createMessageComponentCollector({
            componentType: Discord.ComponentType.StringSelect,
            time: 60000
        });

        collector.on("collect", async (i) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: "❌ Tu ne peux pas utiliser ce menu.", flags: Discord.MessageFlags.Ephemeral });
            }

            const selectedCategory = i.values[0];
            const cmds = categories.get(selectedCategory);

            const categoryEmbed = new Discord.EmbedBuilder()
                .setColor("#2b2d31")
                .setTitle(`📂 Catégorie : ${selectedCategory}`)
                .setDescription(cmds.map(c => `• **/${c.name}** : ${c.description}`).join("\n"))
                .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            await i.update({ embeds: [categoryEmbed] });
        });

        collector.on("end", () => {
            row.components[0].setDisabled(true);
            interaction.editReply({ components: [row] }).catch(() => {});
        });
    }
};