const { 
    Events, 
    InteractionType, 
    MessageFlags, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder 
} = require("discord.js");
const fs = require("fs");
const path = require("path");

// Identifiants des Rôles & Constantes
const ROLE_STAFF = "<@&1508046852027842600>";
const ROLE_MEG = "1508213003743531199";
const ROLE_BLACKLIST = "1529047916126142555";
const ROLES_WARN = {
    1: "1472563147834392712",
    2: "1472563147423482060",
    3: "1472563147423482059"
};

const INVENTORY_FILE = path.join(__dirname, "../inventaire.json");
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxcY2k-IGuvz1vD5SsRFLov-la8ntiEOO-qxW2cwcHpZyo6U0LUsRTqNABmgKMKJDhS/exec";

// Fonctions utilitaires pour l'inventaire
function getInventory() {
    try {
        if (!fs.existsSync(INVENTORY_FILE)) {
            fs.writeFileSync(INVENTORY_FILE, JSON.stringify({ appli: 0, lead: 0 }, null, 4));
        }
        return JSON.parse(fs.readFileSync(INVENTORY_FILE, "utf-8"));
    } catch (e) {
        console.error("Erreur lecture/création inventaire :", e);
        return { appli: 0, lead: 0 };
    }
}

function saveInventory(data) {
    try {
        fs.writeFileSync(INVENTORY_FILE, JSON.stringify(data, null, 4));
    } catch (e) {
        console.error("Erreur sauvegarde inventaire :", e);
    }
}

const handleInteraction = async (bot, interaction) => {

    // ==========================================
    // 1. GESTION DES COMMANDES SLASH
    // ==========================================
    if (interaction.isChatInputCommand() || interaction.type === InteractionType.ApplicationCommand) {
        const command = bot.commands.get(interaction.commandName);
        if (command) {
            try {
                await command.run(bot, interaction);
            } catch (err) {
                console.error(`Erreur lors de l'exécution de ${interaction.commandName}:`, err);
                const replyOptions = { content: "❌ Une erreur est survenue lors de l'exécution de la commande.", flags: MessageFlags.Ephemeral };
                if (interaction.replied || interaction.deferred) await interaction.followUp(replyOptions);
                else await interaction.reply(replyOptions);
            }
        }
        return;
    }

    // ==========================================
    // 2. GESTION DES MENUS DÉROULANTS (Select Menus)
    // ==========================================
    if (interaction.isStringSelectMenu()) {
        // Ignorer l'interaction ici si elle est gérée par un collector dans la commande (ex: panel.js)
        if (interaction.customId === "select_panel_type") {
            return;
        }
    }

    // ==========================================
    // 3. GESTION DES BOUTONS (Ouverture Modals)
    // ==========================================
    if (interaction.isButton()) {

        // --- Avertissements (Warns) ---
        if (interaction.customId.startsWith("warn_lvl_")) {
            const level = interaction.customId.replace("warn_lvl_", "");
            const modal = new ModalBuilder()
                .setCustomId(`modal_warn_${level}`)
                .setTitle(`Avertissement - Niveau ${level}`);

            const inputMembre = new TextInputBuilder()
                .setCustomId("input_membre")
                .setLabel("Membre visé (Mention ou ID)")
                .setPlaceholder("Ex: @Nom ou ID")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const inputMotif = new TextInputBuilder()
                .setCustomId("input_motif")
                .setLabel("Motif de l'avertissement")
                .setPlaceholder("Indiquez la raison exacte")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputMembre),
                new ActionRowBuilder().addComponents(inputMotif)
            );
            return await interaction.showModal(modal);
        }

        // --- Coffre (Dépôt / Retrait) ---
        if (interaction.customId === "action_depot" || interaction.customId === "action_retrait") {
            const isDepot = interaction.customId === "action_depot";
            const modal = new ModalBuilder()
                .setCustomId(isDepot ? "modal_coffre_depot" : "modal_coffre_retrait")
                .setTitle(isDepot ? "Dépôt dans le Coffre" : "Retrait du Coffre");

            const inputAppli = new TextInputBuilder()
                .setCustomId("input_appli")
                .setLabel("Quantité Appli")
                .setPlaceholder("Ex: 50 (mettre 0 si aucun)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const inputLead = new TextInputBuilder()
                .setCustomId("input_lead")
                .setLabel("Quantité Lead")
                .setPlaceholder("Ex: 100 (mettre 0 si aucun)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputAppli),
                new ActionRowBuilder().addComponents(inputLead)
            );
            return await interaction.showModal(modal);
        }

        // --- Absence ---
        if (interaction.customId === "btn_absence") {
            const modal = new ModalBuilder()
                .setCustomId("modal_absence")
                .setTitle("Déclaration d'Absence");

            const inputDebut = new TextInputBuilder()
                .setCustomId("input_debut")
                .setLabel("Date de début")
                .setPlaceholder("Ex: 10/08/2026")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const inputFin = new TextInputBuilder()
                .setCustomId("input_fin")
                .setLabel("Date de fin (ou durée)")
                .setPlaceholder("Ex: 15/08/2026")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const inputMotif = new TextInputBuilder()
                .setCustomId("input_motif")
                .setLabel("Motif de l'absence")
                .setPlaceholder("Raison de votre absence...")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputDebut),
                new ActionRowBuilder().addComponents(inputFin),
                new ActionRowBuilder().addComponents(inputMotif)
            );
            return await interaction.showModal(modal);
        }

        // --- Braquages ---
        if (interaction.customId.startsWith("btn_braquage_")) {
            const rawType = interaction.customId.replace("btn_braquage_", "");
            const typeBraquage = rawType.replace(/_/g, " ").toUpperCase();

            const modal = new ModalBuilder()
                .setCustomId(`modal_braquage_${rawType}`)
                .setTitle(`Déclaration : ${typeBraquage}`);

            const inputEquipage = new TextInputBuilder()
                .setCustomId("input_equipage")
                .setLabel("Membres présents")
                .setPlaceholder("Ex: Nom1, Nom2, Nom3")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const inputGains = new TextInputBuilder()
                .setCustomId("input_gains")
                .setLabel("Butin / Gains obtenus")
                .setPlaceholder("Ex: $50,000, 200x argent sale...")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const inputRemarques = new TextInputBuilder()
                .setCustomId("input_remarques")
                .setLabel("Remarques / Bilan")
                .setPlaceholder("Pertes, arrestations, déroulement...")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputEquipage),
                new ActionRowBuilder().addComponents(inputGains),
                new ActionRowBuilder().addComponents(inputRemarques)
            );
            return await interaction.showModal(modal);
        }
    }

    // ==========================================
    // 4. GESTION SOUMISSION DES MODALS
    // ==========================================
    if (interaction.type === InteractionType.ModalSubmit) {

        // --- BLACKLIST ---
        if (interaction.customId === "modal_blacklist") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const duree = interaction.fields.getTextInputValue("input_duree");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# AVIS DE BLACKLIST\n\n## MAFIA The Olympius Syndicate\n\n**Membre visé :** ${membre}\n**Émis par :** ${emetteur}\n**Durée :** ${duree}\n\n**Motif :**\n${motif}\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- UNBLACKLIST ---
        if (interaction.customId === "modal_unblacklist") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# RETRAIT DE BLACKLIST (UNBLACKLIST)\n\n## MAFIA The Olympius Syndicate\n\n**Membre réintégré :** ${membre}\n**Décidé par :** ${emetteur}\n\n**Motif du retrait :**\n${motif}\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- CONVOCATION ---
        if (interaction.customId === "modal_convocation") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const heure = interaction.fields.getTextInputValue("input_heure");
            const lieu = interaction.fields.getTextInputValue("input_lieu");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# CONVOCATION OFFICIELLE\n\n## MAFIA The Olympius Syndicate\n\n**Membre convoqué :** ${membre}\n**Émis par :** ${emetteur}\n**Heure / Date :** ${heure}\n**Lieu :** ${lieu}\n\n**Motif :**\n${motif}\n\nVotre présence est obligatoire.\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- UNCONVOCATION ---
        if (interaction.customId === "modal_unconvocation") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# ANNULATION DE CONVOCATION\n\n## MAFIA The Olympius Syndicate\n\n**Membre concerné :** ${membre}\n**Annulé par :** ${emetteur}\n\n**Raison de l'annulation :**\n${motif}\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- MISE EN GARDE ---
        if (interaction.customId === "modal_mise_en_garde") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# MISE EN GARDE FORMELLE\n\n## MAFIA The Olympius Syndicate\n\n**Membre visé :** ${membre}\n**Émis par :** ${interaction.user}\n\n**Motif / Rappel :**\n${motif}\n\nCeci constitue une mise en garde formelle. Tout manquement futur entraînera des sanctions disciplinaires sévères.\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- UNMEG ---
        if (interaction.customId === "modal_unmeg") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# RETRAIT DE MISE EN GARDE\n\n## MAFIA The Olympius Syndicate\n\n**Membre concerné :** ${membre}\n**Retiré par :** ${emetteur}\n\n**Motif du retrait :**\n${motif}\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- MORT RP ---
        if (interaction.customId === "modal_mort_rp") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const dateHeure = interaction.fields.getTextInputValue("input_date_heure");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# 💀 AVIS D'EXÉCUTION OFFICIELLE (MORT RP)\n\n## MAFIA The Olympius Syndicate\n\n**Membre décédé :** ${membre}\n**Exécuté par :** ${emetteur}\n**Date & Heure :** ${dateHeure}\n\n**Motif :**\n${motif}\n\nQue son âme repose en paix.\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- PRIME ---
        if (interaction.customId === "modal_prime") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# ATTRIBUTION DE PRIME\n\n## MAFIA The Olympius Syndicate\n\n**Bénéficiaire :** ${membre}\n**Émis par :** ${emetteur}\n\n**Motif :**\n${motif}\n\nFélicitations pour votre investissement au sein de la Famille.\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- UNPRIME ---
        if (interaction.customId === "modal_unprime") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# ANNULATION / RETRAIT DE PRIME\n\n## MAFIA The Olympius Syndicate\n\n**Membre concerné :** ${membre}\n**Annulé par :** ${emetteur}\n\n**Motif du retrait :**\n${motif}\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- PROMOTION ---
        if (interaction.customId === "modal_promotion") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const grade = interaction.fields.getTextInputValue("input_grade");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# PROMOTION OFFICIELLE\n\n## MAFIA The Olympius Syndicate\n\n**Membre promu :** ${membre}\n**Nouveau Grade :** ${grade}\n**Émis par :** ${emetteur}\n\n**Motif :**\n${motif}\n\nLa Direction vous félicite pour vos efforts et votre loyauté.\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- UNPROMOTION ---
        if (interaction.customId === "modal_unpromotion") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# ANNULATION DE PROMOTION\n\n## MAFIA The Olympius Syndicate\n\n**Membre concerné :** ${membre}\n**Annulé par :** ${emetteur}\n\n**Motif de l'annulation :**\n${motif}\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- RÉTROGRADATION ---
        if (interaction.customId === "modal_retrogradation") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const grade = interaction.fields.getTextInputValue("input_grade");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# RÉTROGRADATION OFFICIELLE\n\n## MAFIA The Olympius Syndicate\n\n**Membre concerné :** ${membre}\n**Nouveau Grade :** ${grade}\n**Décision prise par :** ${emetteur}\n\n**Motif :**\n${motif}\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- UNRETROGRADATION ---
        if (interaction.customId === "modal_unretrogradation") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# ANNULATION DE RÉTROGRADATION\n\n## MAFIA The Olympius Syndicate\n\n**Membre concerné :** ${membre}\n**Annulé par :** ${emetteur}\n\n**Motif de l'annulation :**\n${motif}\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- SANCTION ---
        if (interaction.customId === "modal_sanction") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const contenu = interaction.fields.getTextInputValue("input_contenu");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# SANCTION DISCIPLINAIRE\n\n## MAFIA The Olympius Syndicate\n\n**Membre sanctionné :** ${membre}\n**Émis par :** ${emetteur}\n**Sanction :** ${contenu}\n\n**Motif :**\n${motif}\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- UNSANCTION ---
        if (interaction.customId === "modal_unsanction") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# RETRAIT DE SANCTION / UNWARN\n\n## MAFIA The Olympius Syndicate\n\n**Membre concerné :** ${membre}\n**Retiré par :** ${emetteur}\n\n**Motif du retrait :**\n${motif}\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- WARNS ---
        if (interaction.customId.startsWith("modal_warn_")) {
            const level = parseInt(interaction.customId.replace("modal_warn_", ""));
            const membre = interaction.fields.getTextInputValue("input_membre");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# AVERTISSEMENT DISCIPLINAIRE (WARN ${level})\n\n## MAFIA The Olympius Syndicate\n\n**Membre sanctionné :** ${membre}\n**Émis par :** ${interaction.user}\n**Niveau :** Warn ${level}/3\n\n**Motif :**\n${motif}\n\n**Cordialement,**\n${ROLE_STAFF}`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- COFFRE (Dépôt / Retrait) ---
        if (interaction.customId === "modal_coffre_depot" || interaction.customId === "modal_coffre_retrait") {
            const isDepot = interaction.customId === "modal_coffre_depot";
            const qteAppli = Math.max(0, parseInt(interaction.fields.getTextInputValue("input_appli")) || 0);
            const qteLead = Math.max(0, parseInt(interaction.fields.getTextInputValue("input_lead")) || 0);

            const inv = getInventory();
            if (isDepot) {
                inv.appli += qteAppli;
                inv.lead += qteLead;
            } else {
                inv.appli = Math.max(0, inv.appli - qteAppli);
                inv.lead = Math.max(0, inv.lead - qteLead);
            }
            saveInventory(inv);

            const title = isDepot ? "📥 DÉPÔT DANS LE COFFRE" : "📤 RETRAIT DU COFFRE";
            const template = `# ${title}\n\n**Effectué par :** ${interaction.user}\n\n**Mouvements :**\n* **Appli :** ${isDepot ? "+" : "-"}${qteAppli}\n* **Lead :** ${isDepot ? "+" : "-"}${qteLead}\n\n**État actuel du coffre :**\n* **Appli :** ${inv.appli}\n* **Lead :** ${inv.lead}`;
            return await interaction.reply({ content: template });
        }

        // --- ABSENCE ---
        if (interaction.customId === "modal_absence") {
            const debut = interaction.fields.getTextInputValue("input_debut");
            const fin = interaction.fields.getTextInputValue("input_fin");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# DÉCLARATION D'ABSENCE\n\n**Membre :** ${interaction.user}\n**Période :** Du ${debut} au ${fin}\n\n**Motif :**\n${motif}`;
            return await interaction.reply({ content: template });
        }

        // --- BRAQUAGES ---
        if (interaction.customId.startsWith("modal_braquage_")) {
            await interaction.deferReply();

            const rawHeistType = interaction.customId.replace("modal_braquage_", "");
            const titleType = rawHeistType.replace(/_/g, " ").toUpperCase();
            
            const equipageInput = interaction.fields.getTextInputValue("input_equipage");
            const gains = interaction.fields.getTextInputValue("input_gains");
            const remarques = interaction.fields.getTextInputValue("input_remarques") || "Aucune remarque particulière.";

            const braqueursList = equipageInput.split(/[\/,]/).map(b => b.trim()).filter(Boolean);

            let syncStatus = "⚠️ Synchronisation Sheet ignorée (URL non configurée)";

            if (GOOGLE_SCRIPT_URL) {
                try {
                    const response = await fetch(GOOGLE_SCRIPT_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            action: "heist",
                            heistType: rawHeistType,
                            braqueurs: braqueursList
                        }),
                        redirect: "follow"
                    });
            
                    const textData = await response.text();
                    try {
                        const resData = JSON.parse(textData);
                        if (resData.status === "success") {
                            syncStatus = "✅ Braquage comptabilisé sur Google Sheets !";
                        } else {
                            syncStatus = `⚠️ ${resData.message || "Erreur de comptabilisation"}`;
                        }
                    } catch (e) {
                        syncStatus = "⚠️ Données reçues du Script non valides.";
                    }
                } catch (err) {
                    console.error("Erreur WebApp Apps Script:", err);
                    syncStatus = "❌ Échec de la communication avec Google Sheets.";
                }
            }

            const template = `# 🔫 RAPPORT DE BRAQUAGE : ${titleType}\n\n**Équipe :** ${equipageInput}\n**Butin / Gains :** ${gains}\n\n**Bilan / Remarques :**\n${remarques}\n\n*${syncStatus}*`;
            return await interaction.editReply({ content: template });
        }
    }
};

module.exports = handleInteraction;
module.exports.name = Events.InteractionCreate;
module.exports.run = handleInteraction;