const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

// Identifiants des Rôles & Constantes
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
    if (!fs.existsSync(INVENTORY_FILE)) {
        fs.writeFileSync(INVENTORY_FILE, JSON.stringify({ appli: 0, lead: 0 }, null, 4));
    }
    try {
        return JSON.parse(fs.readFileSync(INVENTORY_FILE, "utf-8"));
    } catch (e) {
        return { appli: 0, lead: 0 };
    }
}

function saveInventory(data) {
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(data, null, 4));
}

module.exports = async (bot, interaction) => {

    // ==========================================
    // 1. GESTION DES COMMANDES SLASH
    // ==========================================
    if (interaction.type === Discord.InteractionType.ApplicationCommand) {
        const command = bot.commands.get(interaction.commandName);
        if (command) {
            try {
                await command.run(bot, interaction);
            } catch (err) {
                console.error(`Erreur lors de l'exécution de ${interaction.commandName}:`, err);
                const replyOptions = { content: "❌ Une erreur est survenue lors de l'exécution de la commande.", flags: Discord.MessageFlags.Ephemeral };
                if (interaction.replied || interaction.deferred) await interaction.followUp(replyOptions);
                else await interaction.reply(replyOptions);
            }
        }
        return;
    }

    // ==========================================
    // 2. GESTION DES BOUTONS (Ouverture des Modals)
    // ==========================================
    if (interaction.isButton()) {

        // --- Avertissements (Warns) ---
        if (interaction.customId.startsWith("warn_lvl_")) {
            const level = interaction.customId.replace("warn_lvl_", "");
            const modal = new Discord.ModalBuilder()
                .setCustomId(`modal_warn_${level}`)
                .setTitle(`Avertissement - Niveau ${level}`);

            const inputMembre = new Discord.TextInputBuilder()
                .setCustomId("input_membre")
                .setLabel("Membre visé (Mention ou ID)")
                .setPlaceholder("Ex: @Nom ou 123456789012345678")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const inputMotif = new Discord.TextInputBuilder()
                .setCustomId("input_motif")
                .setLabel("Motif de l'avertissement")
                .setPlaceholder("Indiquez la raison exacte...")
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(inputMembre),
                new Discord.ActionRowBuilder().addComponents(inputMotif)
            );
            return await interaction.showModal(modal);
        }

        // --- Coffre (Dépôt / Retrait) ---
        if (interaction.customId === "action_depot" || interaction.customId === "action_retrait") {
            const isDepot = interaction.customId === "action_depot";
            const modal = new Discord.ModalBuilder()
                .setCustomId(isDepot ? "modal_coffre_depot" : "modal_coffre_retrait")
                .setTitle(isDepot ? "Dépôt dans le Coffre" : "Retrait du Coffre");

            const inputAppli = new Discord.TextInputBuilder()
                .setCustomId("input_appli")
                .setLabel("Quantité Appli")
                .setPlaceholder("Ex: 50 (mettre 0 si aucun)")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const inputLead = new Discord.TextInputBuilder()
                .setCustomId("input_lead")
                .setLabel("Quantité Lead")
                .setPlaceholder("Ex: 100 (mettre 0 si aucun)")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(inputAppli),
                new Discord.ActionRowBuilder().addComponents(inputLead)
            );
            return await interaction.showModal(modal);
        }

        // --- Absence ---
        if (interaction.customId === "btn_absence") {
            const modal = new Discord.ModalBuilder()
                .setCustomId("modal_absence")
                .setTitle("Déclaration d'Absence");

            const inputDebut = new Discord.TextInputBuilder()
                .setCustomId("input_debut")
                .setLabel("Date de début")
                .setPlaceholder("Ex: 10/08/2026")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const inputFin = new Discord.TextInputBuilder()
                .setCustomId("input_fin")
                .setLabel("Date de fin (ou durée)")
                .setPlaceholder("Ex: 15/08/2026")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const inputMotif = new Discord.TextInputBuilder()
                .setCustomId("input_motif")
                .setLabel("Motif de l'absence")
                .setPlaceholder("Raison de votre absence...")
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(inputDebut),
                new Discord.ActionRowBuilder().addComponents(inputFin),
                new Discord.ActionRowBuilder().addComponents(inputMotif)
            );
            return await interaction.showModal(modal);
        }

        // --- Braquages ---
        if (interaction.customId.startsWith("btn_braquage_")) {
            const rawType = interaction.customId.replace("btn_braquage_", "");
            const typeBraquage = rawType.replace(/_/g, " ").toUpperCase();

            const modal = new Discord.ModalBuilder()
                .setCustomId(`modal_braquage_${rawType}`)
                .setTitle(`Déclaration : ${typeBraquage}`);

            const inputEquipage = new Discord.TextInputBuilder()
                .setCustomId("input_equipage")
                .setLabel("Membres présents")
                .setPlaceholder("Ex: Nom1, Nom2, Nom3")
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setRequired(true);

            const inputGains = new Discord.TextInputBuilder()
                .setCustomId("input_gains")
                .setLabel("Butin / Gains obtenus")
                .setPlaceholder("Ex: $50,000, 200x argent sale...")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const inputRemarques = new Discord.TextInputBuilder()
                .setCustomId("input_remarques")
                .setLabel("Remarques / Bilan")
                .setPlaceholder("Pertes, arrestations, déroulement...")
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setRequired(false);

            modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(inputEquipage),
                new Discord.ActionRowBuilder().addComponents(inputGains),
                new Discord.ActionRowBuilder().addComponents(inputRemarques)
            );
            return await interaction.showModal(modal);
        }

        // --- Patrouille ---
        if (interaction.customId === "btn_start_patrouille") {
            const modal = new Discord.ModalBuilder()
                .setCustomId("modal_patrouille")
                .setTitle("Prise de Patrouille");

            const inputEquipage = new Discord.TextInputBuilder()
                .setCustomId("input_equipage")
                .setLabel("Équipage (Membres)")
                .setPlaceholder("Ex: @Nom1, @Nom2")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const inputVehicule = new Discord.TextInputBuilder()
                .setCustomId("input_vehicule")
                .setLabel("Véhicule utilisé")
                .setPlaceholder("Ex: Granger 3600LX - Immatriculation")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const inputHeure = new Discord.TextInputBuilder()
                .setCustomId("input_heure")
                .setLabel("Heure de début")
                .setPlaceholder("Ex: 21h30")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(inputEquipage),
                new Discord.ActionRowBuilder().addComponents(inputVehicule),
                new Discord.ActionRowBuilder().addComponents(inputHeure)
            );
            return await interaction.showModal(modal);
        }

        // --- Ronde ---
        if (interaction.customId === "btn_start_ronde") {
            const modal = new Discord.ModalBuilder()
                .setCustomId("modal_ronde")
                .setTitle("Prise de Ronde Villa");

            const inputPresents = new Discord.TextInputBuilder()
                .setCustomId("input_presents")
                .setLabel("Membres présents")
                .setPlaceholder("Ex: @Nom1, @Nom2")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const inputZones = new Discord.TextInputBuilder()
                .setCustomId("input_zones")
                .setLabel("Sections / Zones contrôlées")
                .setPlaceholder("Ex: Entrée principale, Héliport, Coffre")
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(inputPresents),
                new Discord.ActionRowBuilder().addComponents(inputZones)
            );
            return await interaction.showModal(modal);
        }
    }

    // ==========================================
    // 3. GESTION DE LA SOUMISSION DES MODALS
    // ==========================================
    if (interaction.type === Discord.InteractionType.ModalSubmit) {

        // --- BLACKLIST ---
        if (interaction.customId === "modal_blacklist") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const duree = interaction.fields.getTextInputValue("input_duree");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# AVIS DE BLACKLIST\n\n## MAFIA The Olympius Syndicate\n\n**Membre visé :** ${membre}\n**Émis par :** ${emetteur}\n**Durée :** ${duree}\n\n**Motif :**\n${motif}\n\n**Cordialement,**\n<@&1508046852027842600>`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- CONVOCATION ---
        if (interaction.customId === "modal_convocation") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const heure = interaction.fields.getTextInputValue("input_heure");
            const lieu = interaction.fields.getTextInputValue("input_lieu");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# CONVOCATION OFFICIELLE\n\n## MAFIA The Olympius Syndicate\n\n**Membre convoqué :** ${membre}\n**Émis par :** ${emetteur}\n**Heure / Date :** ${heure}\n**Lieu :** ${lieu}\n\n**Motif :**\n${motif}\n\nVotre présence est obligatoire.\n\n**Cordialement,**\n<@&1508046852027842600>`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- MISE EN GARDE ---
        if (interaction.customId === "modal_mise_en_garde") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# MISE EN GARDE FORMELLE\n\n## MAFIA The Olympius Syndicate\n\n**Membre visé :** ${membre}\n**Émis par :** ${interaction.user}\n\n**Motif / Rappel :**\n${motif}\n\nCeci constitue une mise en garde formelle. Tout manquement futur entraînera des sanctions disciplinaires severes.\n\n**Cordialement,**\n<@&1508046852027842600>`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- MORT RP ---
        if (interaction.customId === "modal_mort_rp") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const dateHeure = interaction.fields.getTextInputValue("input_date_heure");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# 💀 AVIS D'EXÉCUTION OFFICIELLE (MORT RP)\n\n## MAFIA The Olympius Syndicate\n\n**Membre décédé :** ${membre}\n**Exécuté par :** ${emetteur}\n**Date & Heure :** ${dateHeure}\n\n**Motif :**\n${motif}\n\nQue son âme repose en paix.\n\n**Cordialement,**\n<@&1508046852027842600>`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- PRIME ---
        if (interaction.customId === "modal_prime") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# ATTRIBUTION DE PRIME\n\n## MAFIA The Olympius Syndicate\n\n**Bénéficiaire :** ${membre}\n**Émis par :** ${emetteur}\n\n**Motif :**\n${motif}\n\nFélicitations pour votre investissement au sein de la Famille.\n\n**Cordialement,**\n<@&1508046852027842600>`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- PROMOTION ---
        if (interaction.customId === "modal_promotion") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const grade = interaction.fields.getTextInputValue("input_grade");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# PROMOTION OFFICIELLE\n\n## MAFIA The Olympius Syndicate\n\n**Membre promu :** ${membre}\n**Nouveau Grade :** ${grade}\n**Émis par :** ${emetteur}\n\n**Motif :**\n${motif}\n\nLa Direction vous félicite pour vos d’efforts et votre loyauté.\n\n**Cordialement,**\n<@&1508046852027842600>`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- RÉTROGRADATION ---
        if (interaction.customId === "modal_retrogradation") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const grade = interaction.fields.getTextInputValue("input_grade");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# RÉTROGRADATION OFFICIELLE\n\n## MAFIA The Olympius Syndicate\n\n**Membre concerné :** ${membre}\n**Nouveau Grade :** ${grade}\n**Décision prise par :** ${interaction.user}\n\n**Motif :**\n${motif}\n\n**Cordialement,**\n<@&1508046852027842600>`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- SANCTION ---
        if (interaction.customId === "modal_sanction") {
            const membre = interaction.fields.getTextInputValue("input_membre");
            const emetteur = interaction.fields.getTextInputValue("input_emetteur");
            const duree = interaction.fields.getTextInputValue("input_duree");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# SANCTION DISCIPLINAIRE\n\n## MAFIA The Olympius Syndicate\n\n**Membre sanctionné :** ${membre}\n**Émis par :** ${emetteur}\n**Durée :** ${duree}\n\n**Motif :**\n${motif}\n\n**Cordialement,**\n<@&1508046852027842600>`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- WARNS ---
        if (interaction.customId.startsWith("modal_warn_")) {
            const level = parseInt(interaction.customId.replace("modal_warn_", ""));
            const membre = interaction.fields.getTextInputValue("input_membre");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const template = `# AVERTISSEMENT DISCIPLINAIRE (WARN ${level})\n\n## MAFIA The Olympius Syndicate\n\n**Membre sanctionné :** ${membre}\n**Émis par :** ${interaction.user}\n**Niveau :** Warn ${level}/3\n\n**Motif :**\n${motif}\n\n**Cordialement,**\n<@&1508046852027842600>`;
            return await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles"] } });
        }

        // --- COFFRE (Dépôt / Retrait) ---
        if (interaction.customId === "modal_coffre_depot" || interaction.customId === "modal_coffre_retrait") {
            const isDepot = interaction.customId === "modal_coffre_depot";
            const qteAppli = parseInt(interaction.fields.getTextInputValue("input_appli")) || 0;
            const qteLead = parseInt(interaction.fields.getTextInputValue("input_lead")) || 0;

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

        // --- PATROUILLE ---
        if (interaction.customId === "modal_patrouille") {
            const equipage = interaction.fields.getTextInputValue("input_equipage");
            const vehicule = interaction.fields.getTextInputValue("input_vehicule");
            const heure = interaction.fields.getTextInputValue("input_heure");

            const template = `# PRISE DE PATROUILLE\n\n**Heure de début :** ${heure}\n**Équipage :** ${equipage}\n**Véhicule :** ${vehicule}\n\n*Patrouille en cours sur le secteur.*`;
            return await interaction.reply({ content: template });
        }

        // --- RONDE VILLA ---
        if (interaction.customId === "modal_ronde") {
            const presents = interaction.fields.getTextInputValue("input_presents");
            const zones = interaction.fields.getTextInputValue("input_zones");

            const template = `# PRISE DE RONDE - VILLA\n\n**Membres en ronde :** ${presents}\n**Zones contrôlées :**\n${zones}\n\n*Sécurité de la Villa assurée.*`;
            return await interaction.reply({ content: template });
        }

        // --- BRAQUAGES (Connexion automatique à Google Apps Script) ---
        if (interaction.customId.startsWith("modal_braquage_")) {
            await interaction.deferReply();

            const rawHeistType = interaction.customId.replace("modal_braquage_", "");
            const titleType = rawHeistType.replace(/_/g, " ").toUpperCase();
            
            const equipageInput = interaction.fields.getTextInputValue("input_equipage");
            const gains = interaction.fields.getTextInputValue("input_gains");
            const remarques = interaction.fields.getTextInputValue("input_remarques") || "Aucune remarque particulière.";

            // Découpage de la liste des braqueurs
            const braqueursList = equipageInput.split(/[\/,]/).map(b => b.trim()).filter(Boolean);

            let syncStatus = "⚠️ Synchronisation Sheet ignorée (URL non configurée)";

            if (GOOGLE_SCRIPT_URL) {
                try {
                    const fetch = globalThis.fetch || require("node-fetch");
                    const response = await fetch(GOOGLE_SCRIPT_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            action: "heist",
                            heistType: rawHeistType,
                            braqueurs: braqueursList
                        })
                    });
            
                    const resData = await response.json();
                    if (resData.status === "success") {
                        syncStatus = "✅ Braquage comptabilisé sur Google Sheets !";
                    } else {
                        syncStatus = `⚠️ ${resData.message || "Erreur de comptabilisation"}`;
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