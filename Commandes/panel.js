const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    StringSelectMenuBuilder,
    ApplicationCommandOptionType, 
    PermissionFlagsBits 
} = require("discord.js");

module.exports = {
    name: "panel",
    description: "Affiche un panel de gestion",
    category: "Gestion",
    permission: PermissionFlagsBits.ManageMessages,
    dm: false,
    options: [
        {
            name: "type",
            description: "Choisissez le type de panel à afficher",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "📅 Panel Absence", value: "absence" },
                { name: "🔫 Panel Braquage", value: "braquage" }
            ]
        }
    ],

    async run(bot, interaction, args) {
        // Détermination du choix (Slash command ou argument classique)
        let choice = interaction.options?.getString("type") || args?.[0]?.toLowerCase();

        // 1. Si aucun choix n'est fourni (ex: commande exécutée par message sans arguments)
        if (!choice) {
            const selectMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("select_panel_type")
                    .setPlaceholder("Choisissez le panel à afficher...")
                    .addOptions([
                        {
                            label: "Panel Absence",
                            description: "Affiche le bouton pour poser une absence",
                            value: "absence",
                            emoji: "📅"
                        },
                        {
                            label: "Panel Braquage",
                            description: "Affiche le panel de déclaration de braquage",
                            value: "braquage",
                            emoji: "🔫"
                        }
                    ])
            );

            const replyMsg = await (interaction.reply ? 
                interaction.reply({ content: "Veuillez sélectionner un panel :", components: [selectMenu], fetchReply: true }) : 
                interaction.channel.send({ content: "Veuillez sélectionner un panel :", components: [selectMenu] })
            );

            // Écouteur pour la sélection
            const filter = i => i.user.id === (interaction.user?.id || interaction.author?.id);
            const collector = replyMsg.createMessageComponentCollector({ filter, time: 30000 });

            collector.on("collect", async i => {
                choice = i.values[0];
                await i.deferUpdate();
                await envoyerPanel(bot, i, choice);
                await replyMsg.delete().catch(() => {});
            });

            return;
        }

        // 2. Envoi direct du panel choisi
        await envoyerPanel(bot, interaction, choice);
    }
};

// Fonction interne d'envoi du panel
async function envoyerPanel(bot, interaction, choice) {
    const channel = interaction.channel;

    if (choice === "absence") {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("btn_absence")
                .setLabel("Poser une absence")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("📅")
        );

        if (interaction.isRepliable && !interaction.replied) {
            await interaction.reply({
                content: "Cliquez sur le bouton ci-dessous pour déclarer une absence :",
                components: [row]
            });
        } else {
            await channel.send({
                content: "Cliquez sur le bouton ci-dessous pour déclarer une absence :",
                components: [row]
            });
        }

    } else if (choice === "braquage") {
        const guild = interaction.guild;

        const embed = new EmbedBuilder()
            .setColor("#FFFFFF")
            .setTitle("🔫 DÉCLARATION DE BRAQUAGE")
            .setDescription("Cliquez sur le bouton correspondant au type de braquage effectué pour en faire la déclaration officielle.")
            .setFooter({ 
                text: "MAFIA The Olympius Syndicate", 
                iconURL: guild ? guild.iconURL({ dynamic: true }) : null 
            });

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("btn_braquage_atm")
                .setLabel("ATM")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("btn_braquage_conteneur")
                .setLabel("Conteneur")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("btn_braquage_superette")
                .setLabel("Supérette")
                .setStyle(ButtonStyle.Success)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("btn_braquage_fleeca")
                .setLabel("Fleeca")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("btn_braquage_bijouterie")
                .setLabel("Bijouterie")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("btn_braquage_banque_centrale")
                .setLabel("Banque Centrale")
                .setStyle(ButtonStyle.Primary)
        );

        if (interaction.isRepliable && !interaction.replied) {
            await interaction.reply({
                embeds: [embed],
                components: [row1, row2]
            });
        } else {
            await channel.send({
                embeds: [embed],
                components: [row1, row2]
            });
        }
    }
}