const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, ApplicationCommandOptionType, MessageFlags, SlashCommandBuilder } = require("discord.js");

module.exports = {
    name: "help",
    description: "Affiche la liste des commandes disponibles",
    category: "Informations",
    dm: true,
    slash: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Affiche la liste des commandes disponibles")
        .addStringOption(opt =>
            opt.setName("commande")
               .setDescription("Obtenir des infos sur une commande précise")
               .setRequired(false)
        ),

    async run(bot, interaction) {
        const commandName = interaction.options.getString("commande");

        if (commandName) {
            const cmd = bot.commands.get(commandName.toLowerCase()) || bot.commands.find(c => c.data?.name === commandName.toLowerCase());

            if (!cmd) {
                return interaction.reply({ 
                    content: "❌ Cette commande n'existe pas.", 
                    flags: MessageFlags.Ephemeral 
                });
            }

            const name = cmd.name || cmd.data?.name;
            const description = cmd.description || cmd.data?.description || "Pas de description";
            const category = cmd.category || "Aucune";

            const embedDetail = new EmbedBuilder()
                .setColor(bot.color || "#0309e2")
                .setTitle(`📌 Commande /${name}`)
                .addFields(
                    { name: "Description", value: description },
                    { name: "Catégorie", value: category, inline: true }
                )
                .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [embedDetail] });
        }

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

        const mainEmbed = new EmbedBuilder()
            .setColor(bot.color || "#0309e2")
            .setTitle("📖 Menu d'aide")
            .setDescription("Sélectionne une catégorie dans le menu ci-dessous pour voir les commandes disponibles.")
            .setFooter({ text: `Total : ${bot.commands.size} commandes`, iconURL: bot.user.displayAvatarURL() });

        const options = Array.from(categories.keys()).slice(0, 25).map(categoryName => ({
            label: categoryName.slice(0, 100),
            value: categoryName.slice(0, 100),
            description: `Commandes liées à ${categoryName}`.slice(0, 100)
        }));

        if (options.length === 0) {
            return interaction.reply({ content: "❌ Aucune commande/catégorie disponible.", flags: MessageFlags.Ephemeral });
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("help_menu")
            .setPlaceholder("Choisis une catégorie...")
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const response = await interaction.reply({
            embeds: [mainEmbed],
            components: [row],
            fetchReply: true
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000
        });

        collector.on("collect", async (i) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ 
                    content: "❌ Tu ne peux pas utiliser ce menu.", 
                    flags: MessageFlags.Ephemeral 
                });
            }

            const selectedCategory = i.values[0];
            const cmds = categories.get(selectedCategory);

            if (!cmds) {
                return i.reply({ content: "❌ Catégorie introuvable.", flags: MessageFlags.Ephemeral });
            }

            const categoryEmbed = new EmbedBuilder()
                .setColor(bot.color || "#0309e2")
                .setTitle(`📂 Catégorie : ${selectedCategory}`)
                .setDescription(cmds.map(c => `• **/${c.name}** : ${c.description}`).join("\n"))
                .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            await i.update({ embeds: [categoryEmbed] });
        });

        collector.on("end", async () => {
            selectMenu.setDisabled(true);
            const disabledRow = new ActionRowBuilder().addComponents(selectMenu);
            await interaction.editReply({ components: [disabledRow] }).catch(() => {});
        });
    }
};