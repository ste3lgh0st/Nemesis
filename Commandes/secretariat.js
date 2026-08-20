const { 
    SlashCommandBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder,
    MessageFlags
} = require("discord.js");

module.exports = {
    name: "secretariat",
    description: "Gérer les actions administratives (convocation, sanction, promotion, annulations...)",
    category: "Gestion",
    dm: false,
    slash: new SlashCommandBuilder()
        .setName("secretariat")
        .setDescription("Gérer les actions administratives (convocation, sanction, promotion, annulations...)")
        .addStringOption(opt =>
            opt.setName("action")
               .setDescription("Choisissez l'action administrative à effectuer")
               .setRequired(true)
               .addChoices(
                   // --- Actions standard ---
                   { name: "📩 Convocation", value: "convocation" },
                   { name: "⚠️ Avertissement / Sanction", value: "sanction" },
                   { name: "⛔ Blacklist", value: "blacklist" },
                   { name: "📜 Mise en garde", value: "meg" },
                   { name: "📈 Promotion", value: "promotion" },
                   { name: "📉 Rétrogradation", value: "retrogradation" },
                   { name: "💰 Prime", value: "prime" },
                   { name: "💀 Mort RP", value: "mort_rp" },
                   // --- Actions inverses / Annulations ---
                   { name: "❌ Annulation Convocation", value: "unconvocation" },
                   { name: "🟢 Retrait Sanction / Unwarn", value: "unsanction" },
                   { name: "✅ Retrait Blacklist (Unblacklist)", value: "unblacklist" },
                   { name: "🗑️ Retrait MEG (Unmeg)", value: "unmeg" },
                   { name: "🔄 Annulation Promotion", value: "unpromotion" },
                   { name: "🔄 Annulation Rétrogradation", value: "unretrogradation" },
                   { name: "💸 Annulation / Retrait Prime", value: "unprime" }
               )
        ),

    async run(bot, interaction) {
        const action = interaction.options.getString("action");

        switch (action) {

            // ==========================================
            // ACTIONS STANDARD
            // ==========================================

            case "convocation": {
                const modal = new ModalBuilder().setCustomId("modal_convocation").setTitle("Convocation Officielle");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Membre convoqué").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_emetteur").setLabel("Émis par").setValue(interaction.user.tag).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_heure").setLabel("Heure / Date").setPlaceholder("Ex: 10/08 à 21h00").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_lieu").setLabel("Lieu").setPlaceholder("Ex: Bureau").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motif").setLabel("Motif").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            case "blacklist": {
                const modal = new ModalBuilder().setCustomId("modal_blacklist").setTitle("Avis de Blacklist");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Membre visé").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_emetteur").setLabel("Émis par").setValue(interaction.user.tag).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_duree").setLabel("Durée").setPlaceholder("Ex: Indéfinie / 30 jours").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motif").setLabel("Motif").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            case "meg": {
                const modal = new ModalBuilder().setCustomId("modal_mise_en_garde").setTitle("Mise en Garde Formelle");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Membre visé").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_rappel").setLabel("Rappel").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            case "sanction": {
                const modal = new ModalBuilder().setCustomId("modal_sanction").setTitle("Sanction Disciplinaire");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Membre sanctionné").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_emetteur").setLabel("Émis par").setValue(interaction.user.tag).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_contenu").setLabel("Contenu de la sanction").setPlaceholder("Ex : Interdiction d'armes").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motif").setLabel("Motif").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            case "promotion": {
                const modal = new ModalBuilder().setCustomId("modal_promotion").setTitle("Promotion Officielle");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Membre promu").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_grade").setLabel("Nouveau Grade").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_emetteur").setLabel("Émis par").setValue(interaction.user.tag).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motif").setLabel("Motif").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            case "retrogradation": {
                const modal = new ModalBuilder().setCustomId("modal_retrogradation").setTitle("Rétrogradation Officielle");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Membre concerné").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_grade").setLabel("Nouveau Grade").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_emetteur").setLabel("Émis par").setValue(interaction.user.tag).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motif").setLabel("Motif").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            case "prime": {
                const modal = new ModalBuilder().setCustomId("modal_prime").setTitle("Attribution de Prime");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Bénéficiaire").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_emetteur").setLabel("Émis par").setValue(interaction.user.tag).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motif").setLabel("Motif").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            case "mort_rp": {
                const modal = new ModalBuilder().setCustomId("modal_mort_rp").setTitle("Avis d'Exécution Officielle");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Membre décédé").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_emetteur").setLabel("Exécuté par").setValue(interaction.user.tag).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_date_heure").setLabel("Date & Heure").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motif").setLabel("Motif").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            // ==========================================
            // ACTIONS INVERSES / ANNULATIONS
            // ==========================================

            case "unconvocation": {
                const modal = new ModalBuilder().setCustomId("modal_unconvocation").setTitle("Annulation de Convocation");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Membre concerné").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_emetteur").setLabel("Annulé par").setValue(interaction.user.tag).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motif").setLabel("Raison de l'annulation").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            case "unsanction": {
                const modal = new ModalBuilder().setCustomId("modal_unsanction").setTitle("Retrait de Sanction / Unwarn");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Membre concerné").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_emetteur").setLabel("Retiré par").setValue(interaction.user.tag).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motif").setLabel("Motif du retrait").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            case "unblacklist": {
                const modal = new ModalBuilder().setCustomId("modal_unblacklist").setTitle("Retrait de Blacklist");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Membre débanni/réintégré").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_emetteur").setLabel("Décidé par").setValue(interaction.user.tag).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motif").setLabel("Motif du retrait").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            case "unmeg": {
                const modal = new ModalBuilder().setCustomId("modal_unmeg").setTitle("Retrait de Mise en Garde");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Membre concerné").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_emetteur").setLabel("Retiré par").setValue(interaction.user.tag).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motif").setLabel("Motif du retrait").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            case "unpromotion": {
                const modal = new ModalBuilder().setCustomId("modal_unpromotion").setTitle("Annulation de Promotion");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Membre concerné").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_emetteur").setLabel("Annulé par").setValue(interaction.user.tag).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motif").setLabel("Motif de l'annulation").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            case "unretrogradation": {
                const modal = new ModalBuilder().setCustomId("modal_unretrogradation").setTitle("Annulation de Rétrogradation");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Membre concerné").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_emetteur").setLabel("Annulé par").setValue(interaction.user.tag).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motif").setLabel("Motif de l'annulation").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            case "unprime": {
                const modal = new ModalBuilder().setCustomId("modal_unprime").setTitle("Annulation / Retrait de Prime");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_membre").setLabel("Membre concerné").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_emetteur").setLabel("Annulé par").setValue(interaction.user.tag).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motif").setLabel("Motif du retrait").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return await interaction.showModal(modal);
            }

            default:
                return interaction.reply({ content: "❌ Action non reconnue.", flags: MessageFlags.Ephemeral });
        }
    }
};