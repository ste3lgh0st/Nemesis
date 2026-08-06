const Discord = require("discord.js");
const hierarchie = require("../hierarchie.json");

const ROLES_WARN = {
    1: "1472563147834392712", 
    2: "1472563147423482060", 
    3: "1472563147423482059"  
};

const ROLE_MEG = "1508213003743531199";
const ROLE_BLACKLIST = "1529047916126142555";   
const ROLE_CONVOCATION = "1508254552044998748";
const ROLE_MORT_RP = "1508389958006865931";   

const WEBHOOK_SHEET_URL = "https://script.google.com/macros/s/AKfycbxcY2k-IGuvz1vD5SsRFLov-la8ntiEOO-qxW2cwcHpZyo6U0LUsRTqNABmgKMKJDhS/exec";

const { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags 
} = require("discord.js");

module.exports = async (bot, interaction) => {
    try {
        // ==========================================
        // 1. GESTION DES SLASH COMMANDES
        // ==========================================
        if (interaction.isChatInputCommand()) {
            const command = bot.commands.get(interaction.commandName);
            if (!command) return;

            // Exécution de la commande (ex: /coffre)
            await command.run(bot, interaction, interaction.options);
            return;
        }

        // ==========================================
        // 2. GESTION DU BOUTON FIN DE PATROUILLE / RONDE
        // ==========================================
        if (interaction.isButton()) {
            if (interaction.customId === "btn_end_patrouille" || interaction.customId === "btn_end_ronde") {
                await interaction.deferUpdate();

                const isPatrouille = interaction.customId === "btn_end_patrouille";
                const timestampFin = Math.floor(Date.now() / 1000);
                
                let meContent = interaction.message.content;
                meContent = meContent.replace("*En cours...*", `<t:${timestampFin}:f> (<t:${timestampFin}:R>)`);
                meContent = meContent.replace("🟢 **Patrouille Active**", "🔴 **Patrouille Terminée**");
                meContent = meContent.replace("🟢 **Ronde Active**", "🔴 **Ronde Terminée**");

                // Désactivation du bouton
                const disabledRow = new ActionRowBuilder().addComponents(
                    ButtonBuilder.from(interaction.message.components[0].components[0]).setDisabled(true)
                );

                return await interaction.editReply({
                    content: meContent,
                    components: [disabledRow]
                });
            }
        }

        // ==========================================
        // 3. GESTION DE LA SOUMISSION DES MODALS
        // ==========================================
        if (interaction.isModalSubmit()) {
            // ACKNOWLEDGE IMMÉDIAT (Évite "Nemesis n'a pas répondu à temps")
            await interaction.deferReply();

            const emetteurMention = interaction.user.toString();
            const dateFormatted = new Date().toLocaleDateString("fr-FR");

            // --- MODAL MISE EN GARDE ---
            if (interaction.customId === "modal_mise_en_garde") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                if (targetMember && typeof ROLE_MEG !== "undefined" && ROLE_MEG) {
                    targetMember.roles.add(ROLE_MEG).catch(err => console.error("Erreur ajout rôle MEG :", err));
                }

                if (typeof envoyerAuGoogleSheet === "function") {
                    envoyerAuGoogleSheet(nomCible, { sanctionIntitule: "Mise en garde" }).catch(err => console.error("Erreur Sheet MEG :", err));
                }

                const template = `# MISE EN GARDE \n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Raison / Rappel :**\n${motif}\n\nLa discipline est le pilier de notre Famille. Ceci est un pré-avertissement formel afin de vous rappeler les règles de The Olympius Syndicate.\n\nPrenez ce rappel au sérieux pour éviter tout avertissement officiel (warn) ou sanction plus lourde.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            // --- MODAL ABSENCE ---
            if (interaction.customId === "modal_absence") {
                const dateDebut = interaction.fields.getTextInputValue("input_date_debut");
                const dateFin = interaction.fields.getTextInputValue("input_date_fin");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const template = `# DÉCLARATION D'ABSENCE\n\n` +
                    `**Membre :** ${emetteurMention}\n` +
                    `**Période :** Du ${dateDebut} au ${dateFin}\n` +
                    `**Motif :**\n${motif}\n\n` +
                    `*Absence enregistrée par la Direction.*`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users"] } });
            }

            // --- MODAL CONVOCATION ---
            if (interaction.customId === "modal_convocation") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const heure = interaction.fields.getTextInputValue("input_heure");
                const lieu = interaction.fields.getTextInputValue("input_lieu");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                if (targetMember && typeof ROLE_CONVOCATION !== "undefined" && ROLE_CONVOCATION) {
                    targetMember.roles.add(ROLE_CONVOCATION).catch(err => console.error("Erreur ajout rôle convocation :", err));
                }

                if (typeof envoyerAuGoogleSheet === "function") {
                    envoyerAuGoogleSheet(nomCible, { sanctionIntitule: "Convoqué" }).catch(err => console.error("Erreur Sheet Convocation :", err));
                }

                const template = `# CONVOCATION\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Convoqué par :** ${emetteurMention}\n\n**Date de la convocation :** ${dateFormatted}\n\n**Heure :** ${heure}\n\n**Lieu :** ${lieu}\n\n**Motif :**\n${motif}\n\nLa Direction de **The Olympius Syndicate** exige votre présence.\n\nVotre présence est obligatoire.\n\nToute absence injustifiée sera interprétée comme un manque de respect envers la Famille.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            // --- MODAL SANCTION ---
            if (interaction.customId === "modal_sanction") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const duree = interaction.fields.getTextInputValue("input_duree");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                if (typeof envoyerAuGoogleSheet === "function") {
                    envoyerAuGoogleSheet(nomCible, { sanctionIntitule: `Sanction (${duree})` }).catch(err => console.error("Erreur Sheet Sanction :", err));
                }

                const template = `# SANCTION DISCIPLINAIRE\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\n**Durée de la sanction :**\n${duree}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu son jugement.\n\nVos actes ont porté atteinte à la discipline et à l'honneur de notre Famille.\n\nLa sanction prend effet immédiatement pour la durée indiquée ci-dessus.\n\nRespectez cette décision et montrez que vous méritez encore votre place parmi nous.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            // --- MODAL MORT RP ---
            if (interaction.customId === "modal_mort_rp") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                let dateHeure = "";
                try {
                    dateHeure = interaction.fields.getTextInputValue("input_date_heure");
                } catch {
                    try {
                        dateHeure = interaction.fields.getTextInputValue("input_date");
                    } catch {
                        dateHeure = `${dateFormatted} à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
                    }
                }
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                if (targetMember && typeof ROLE_MORT_RP !== "undefined" && ROLE_MORT_RP) {
                    targetMember.roles.add(ROLE_MORT_RP).catch(err => console.error("Erreur ajout rôle Mort RP :", err));
                }

                if (typeof envoyerAuGoogleSheet === "function") {
                    envoyerAuGoogleSheet(nomCible, { sanctionIntitule: "Mort RP" }).catch(err => console.error("Erreur Sheet Mort RP :", err));
                }

                const template = `# EXÉCUTION OFFICIELLE\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Exécuté par :** ${emetteurMention}\n\n**Date et Heure du décès :** ${dateHeure}\n\n**Motif :**\n${motif}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu son jugement.\n\nVos actes ont porté atteinte à la discipline et à l'honneur de notre Famille.\n\nQue la mort de notre membre serve d'exemple aux autres.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            // --- MODAL BLACKLIST ---
            if (interaction.customId === "modal_blacklist") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const dureeInput = interaction.fields.getTextInputValue("input_duree").trim();
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;
                const lienDiscord = targetMember ? `https://discord.com/users/${targetMember.id}` : membreInput;

                if (targetMember && typeof ROLE_BLACKLIST !== "undefined" && ROLE_BLACKLIST) {
                    targetMember.roles.add(ROLE_BLACKLIST).catch(err => console.error("Erreur ajout rôle blacklist :", err));
                }

                if (typeof envoyerBlacklistAuSheet === "function") {
                    envoyerBlacklistAuSheet({
                        nomPrenom: nomCible,
                        duree: dureeInput,
                        date: dateFormatted,
                        lienDiscord: lienDiscord,
                        raison: motif
                    }).catch(err => console.error("Erreur Sheet Blacklist :", err));
                }

                const isPerm = ["permanente", "perm", "indéterminée"].includes(dureeInput.toLowerCase());
                const dureeTexte = isPerm 
                    ? "☒ Indéterminée / Permanente\n☐ Temporaire :"
                    : `☐ Permanente\n☒ Temporaire : ${dureeInput}`;

                const template = `# BLACKLIST\n\n## MAFIA The Olympius Syndicate\n\n**Nom de la personne :** ${memberMention}\n\n**Inscription décidée par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\n**Durée :**\n${dureeTexte}\n\nPar décision de la Direction, vous êtes inscrit sur la **Blacklist officielle de The Olympius Syndicate**.\n\nCette mesure vous interdit toute réintégration ou toute collaboration avec notre Famille pendant la durée indiquée.\n\nLa confiance ne se réclame pas. Elle se mérite.\n\nVotre dossier restera archivé au sein de nos registres.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            // --- MODAL PROMOTION ---
            if (interaction.customId === "modal_promotion") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const gradeInput = interaction.fields.getTextInputValue("input_grade");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                let gradeAffichage = gradeInput;
                if (typeof updateHierarchyRole === "function") {
                    gradeAffichage = await updateHierarchyRole(targetMember, gradeInput, typeof hierarchie !== "undefined" ? hierarchie : null);
                }

                if (typeof envoyerAuGoogleSheet === "function") {
                    envoyerAuGoogleSheet(nomCible, { 
                        grade: gradeInput || "Recrue", 
                        sanctionIntitule: `Promotion : ${gradeInput || "Nouveau Grade"}` 
                    }).catch(err => console.error("Erreur Sheet Promotion :", err));
                }

                const template = `# PROMOTION\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Nouveau Grade :** ${gradeAffichage}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu sa décision.\n\nVos actions ont fait honneur à notre Famille.\n\nVotre fidélité nous prouve aujourd'hui que vous êtes capable du meilleur.\n\nHonorez cette promotion et continuez à vous montrer digne de votre place parmi nous.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            // --- MODAL RÉTROGRADATION ---
            if (interaction.customId === "modal_retrogradation") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const gradeInput = interaction.fields.getTextInputValue("input_grade");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                let gradeAffichage = gradeInput;
                if (typeof updateHierarchyRole === "function") {
                    gradeAffichage = await updateHierarchyRole(targetMember, gradeInput, typeof hierarchie !== "undefined" ? hierarchie : null);
                }

                if (typeof envoyerAuGoogleSheet === "function") {
                    envoyerAuGoogleSheet(nomCible, { 
                        grade: gradeInput || "Recrue", 
                        sanctionIntitule: `Rétrogradation : ${gradeInput || "Ancien Grade"}` 
                    }).catch(err => console.error("Erreur Sheet Rétrogradation :", err));
                }

                const template = `# RÉTROGRADATION\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Nouveau Grade :** ${gradeAffichage}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu sa décision.\n\nVos récents agissements et vos erreurs ne correspondent plus aux exigences de votre rang.\n\nCette rétrogradation est un rappel à l'ordre formel. À vous de faire vos preuves à nouveau si vous souhaitez regagner la confiance de la Famille.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            // --- MODAL PRIME ---
            if (interaction.customId === "modal_prime") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;

                const template = `# PRIME DE RÉCOMPENSE\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Accordée par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\nLa Direction de **The Olympius Syndicate** tient à saluer vos récents efforts.\n\nVos services et votre loyauté envers la Famille méritent d'être récompensés à leur juste valeur.\n\nContinuez sur cette voie.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            // --- MODALS BRAQUAGES ---
            if (interaction.customId.startsWith("modal_braquage_")) {
                const typeBraquage = interaction.customId.replace("modal_braquage_", "");

                const braqueursInput = interaction.fields.getTextInputValue("input_braqueurs");
                const otagesInput = interaction.fields.getTextInputValue("input_otages");
                const lieuInput = interaction.fields.getTextInputValue("input_lieu");
                const autoInput = interaction.fields.getTextInputValue("input_autorisation");
                const gainEtCoffreInput = interaction.fields.getTextInputValue("input_gain_et_coffre");

                let gain = gainEtCoffreInput;
                let transfereCoffre = "Non";

                if (gainEtCoffreInput.includes("|")) {
                    const parts = gainEtCoffreInput.split("|");
                    gain = parts[0].trim();
                    transfereCoffre = parts[1].trim().toLowerCase().includes("oui") ? "Oui" : "Non";
                } else if (gainEtCoffreInput.toLowerCase().endsWith("oui")) {
                    transfereCoffre = "Oui";
                    gain = gainEtCoffreInput.replace(/oui/i, "").trim();
                } else if (gainEtCoffreInput.toLowerCase().endsWith("non")) {
                    transfereCoffre = "Non";
                    gain = gainEtCoffreInput.replace(/non/i, "").trim();
                }

                const listeBraqueursBrute = braqueursInput.split(/[,/]/).map(b => b.trim());
                const braqueursFormates = [];
                const braqueursMembres = [];

                for (const item of listeBraqueursBrute) {
                    if (!item) continue;
                    const member = await getTargetMember(interaction.guild, item);
                    if (member) {
                        braqueursFormates.push(member.toString());
                        braqueursMembres.push(member);
                    } else {
                        braqueursFormates.push(item);
                    }
                }
                const texteBraqueurs = braqueursFormates.join(" / ");

                if (typeof updateHeistStats === 'function' && typeof sheets !== "undefined" && typeof SPREADSHEET_ID !== "undefined") {
                    updateHeistStats(sheets, SPREADSHEET_ID, braqueursMembres, typeBraquage).catch(e => console.error("Erreur Heist Stats :", e));
                }

                if (typeof sendHeistToSheets === "function") {
                    sendHeistToSheets(typeBraquage, braqueursFormates);
                }

                const autoMember = await getTargetMember(interaction.guild, autoInput);
                const autoMention = autoMember ? autoMember.toString() : autoInput;

                const intitules = {
                    atm: "d'ATM",
                    conteneur: "de conteneur",
                    superette: "de supérette",
                    fleeca: "de Fleeca",
                    bijouterie: "de Bijouterie",
                    pacific: "de Banque Centrale",
                    banque_centrale: "de Banque Centrale"
                };
                const intituleTarget = intitules[typeBraquage] || "de braquage";

                const messageFinal = `**__Braquage ${intituleTarget} :__**\n\n` +
                    `Braqueurs : ${texteBraqueurs}\n` +
                    `Nombre d'otages : ${otagesInput}\n` +
                    `Lieu : ${lieuInput}\n` +
                    `Autorisation : ${autoMention}\n` +
                    `Argent sale gagné : ${gain}\n` +
                    `Transféré au coffre : ${transfereCoffre}`;

                return await interaction.editReply({
                    content: messageFinal,
                    allowedMentions: { parse: ["users", "roles"] }
                });
            }

            // --- MODAL PATROUILLE ---
            if (interaction.customId === "modal_patrouille") {
                const leaderInput = interaction.fields.getTextInputValue("input_leader");
                const membresInput = interaction.fields.getTextInputValue("input_membres");
                const modele = interaction.fields.getTextInputValue("input_modele");
                const plaque = interaction.fields.getTextInputValue("input_plaque");

                const leaderTarget = await getTargetMember(interaction.guild, leaderInput);
                const leaderMention = leaderTarget ? leaderTarget.toString() : leaderInput;

                const timestampDebut = Math.floor(Date.now() / 1000);

                const template = `# PRISE DE PATROUILLE\n\n## MAFIA The Olympius Syndicate\n\n**Date et heure de début :** <t:${timestampDebut}:f> (<t:${timestampDebut}:R>)\n**Date et heure de fin :** *En cours...*\n\n**Plus haut gradé :** ${leaderMention}\n**Membres présents :**\n${membresInput}\n\n**Véhicule :** ${modele} *(Plaque : ${plaque})*\n\n**Status :** 🟢 **Patrouille Active**\n\n**Cordialement,**\n<@&1508046852027842600>`;

                const btnFin = new ButtonBuilder()
                    .setCustomId("btn_end_patrouille")
                    .setLabel("Fin de patrouille")
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder().addComponents(btnFin);

                return await interaction.editReply({
                    content: template,
                    components: [row],
                    allowedMentions: { parse: ["users", "roles"] }
                });
            }

            // --- MODAL RONDE ---
            if (interaction.customId === "modal_ronde") {
                const sectionInput = interaction.fields.getTextInputValue("input_section");
                const membresInput = interaction.fields.getTextInputValue("input_membres");

                const timestampDebut = Math.floor(Date.now() / 1000);

                const template = `# PRISE DE RONDE\n\n## MAFIA The Olympius Syndicate\n\n**Date et heure de début :** <t:${timestampDebut}:f> (<t:${timestampDebut}:R>)\n**Date et heure de fin :** *En cours...*\n\n**Section(s) protégée(s) :** ${sectionInput}\n\n**Membres présents :**\n${membresInput}\n\n**Status :** 🟢 **Ronde Active**\n\n**Cordialement,**\n<@&1508046852027842600>`;

                const btnFinRonde = new ButtonBuilder()
                    .setCustomId("btn_end_ronde")
                    .setLabel("Fin de ronde")
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder().addComponents(btnFinRonde);

                return await interaction.editReply({
                    content: template,
                    components: [row],
                    allowedMentions: { parse: ["users", "roles"] }
                });
            }
        }

    } catch (error) {
        console.error("Erreur lors du traitement de l'interaction :", error);

        const errorPayload = { 
            content: "❌ Une erreur est survenue lors de l'exécution de cette action.", 
            flags: MessageFlags.Ephemeral 
        };

        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorPayload);
            } else {
                await interaction.reply(errorPayload);
            }
        } catch {}
    }
};