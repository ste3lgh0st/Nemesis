const Discord = require("discord.js");

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

// Fonction utilitaire pour envoyer les données au Google Sheet
async function envoyerAuGoogleSheet(nomDiscord, { texteAbsence, sanctionIntitule }) {
    if (!WEBHOOK_SHEET_URL || !nomDiscord) return;
    try {
        await fetch(WEBHOOK_SHEET_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nomDiscord: nomDiscord,
                texteAbsence: texteAbsence || null,
                sanctionIntitule: sanctionIntitule || null
            })
        });
    } catch (err) {
        console.error("Erreur d'envoi vers Google Sheet :", err);
    }
}

async function getTargetMember(guild, input) {
    if (!input) return null;
    const cleanInput = input.trim();
    
    const userIdMatch = cleanInput.match(/\d{17,19}/);
    if (userIdMatch) {
        try {
            return await guild.members.fetch(userIdMatch[0]);
        } catch (e) {
            // Membre introuvable par ID
        }
    }

    try {
        const members = await guild.members.search({ query: cleanInput, limit: 1 });
        return members.first() || null;
    } catch (err) {
        console.error("Erreur recherche membre :", err);
        return null;
    }
}

module.exports = async (bot, interaction) => {

    // --- 1. GESTION DES COMMANDES SLASH ---
    if (interaction.isCommand() || interaction.isChatInputCommand() || interaction.type === Discord.InteractionType.ApplicationCommand) {
        try {
            const command = bot.commands?.get(interaction.commandName) || require(`../Commandes/${interaction.commandName}`);
            if (command) await command.run(bot, interaction, interaction.options);
        } catch (err) {
            console.error(`Erreur lors de l'exécution de la commande ${interaction.commandName}:`, err);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: "Une erreur est survenue lors de l'exécution de cette commande.", 
                    flags: Discord.MessageFlags.Ephemeral 
                });
            }
        }
        return;
    }

    // --- 2. GESTION DES BOUTONS ---
    if (interaction.isButton()) {
        if (interaction.customId === "btn_absence") {
            const modal = new Discord.ModalBuilder()
                .setCustomId("modal_absence")
                .setTitle("Déclaration d'absence");

            const inputDebut = new Discord.TextInputBuilder()
                .setCustomId("input_date_debut")
                .setLabel("Date de début")
                .setPlaceholder("Ex: 15/08/2026")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const inputFin = new Discord.TextInputBuilder()
                .setCustomId("input_date_fin")
                .setLabel("Date de fin")
                .setPlaceholder("Ex: 20/08/2026")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const inputMotif = new Discord.TextInputBuilder()
                .setCustomId("input_motif")
                .setLabel("Motif de l'absence")
                .setPlaceholder("Raison de ton absence...")
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(inputDebut),
                new Discord.ActionRowBuilder().addComponents(inputFin),
                new Discord.ActionRowBuilder().addComponents(inputMotif)
            );

            await interaction.showModal(modal);
        } 
        else if (interaction.customId === "action_depot" || interaction.customId === "action_retrait") {
            const actionType = interaction.customId === "action_depot" ? "depot" : "retrait";

            const selectMenu = new Discord.StringSelectMenuBuilder()
                .setCustomId(`select_coffre_${actionType}`)
                .setPlaceholder("Choisissez le coffre concerné...")
                .addOptions([
                    { label: "Coffre application", description: "Accéder au coffre Application", value: "appli" },
                    { label: "Coffre lead", description: "Accéder au coffre Lead", value: "lead" }
                ]);

            const row = new Discord.ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({
                content: "Veuillez sélectionner le coffre :",
                components: [row],
                flags: Discord.MessageFlags.Ephemeral
            });
        } 
        else if (interaction.customId.startsWith("warn_lvl_")) {
            const level = interaction.customId.replace("warn_lvl_", "");

            const modal = new Discord.ModalBuilder()
                .setCustomId(`modal_avertissement_${level}`)
                .setTitle(`Avertissement (Niveau ${level})`);

            const inputMembre = new Discord.TextInputBuilder()
                .setCustomId("input_membre")
                .setLabel("Membre visé (mention, pseudo ou ID)")
                .setPlaceholder("Ex: @Nom, nonop ou ID Discord")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const inputMotif = new Discord.TextInputBuilder()
                .setCustomId("input_motif")
                .setLabel("Motif")
                .setPlaceholder("Indiquez le motif de l'avertissement...")
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(inputMembre),
                new Discord.ActionRowBuilder().addComponents(inputMotif)
            );

            await interaction.showModal(modal);
        }
        return;
    }

    // --- 3. GESTION DES MENUS DÉROULANTS ---
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId.startsWith("select_coffre_")) {
            const actionType = interaction.customId.replace("select_coffre_", "");
            const coffreChoisi = interaction.values[0];

            const modalTitle = actionType === "depot" ? "Dépôt dans le coffre" : "Retrait du coffre";

            const modal = new Discord.ModalBuilder()
                .setCustomId(`modal_${actionType}_${coffreChoisi}`)
                .setTitle(modalTitle);

            const inputObjet = new Discord.TextInputBuilder()
                .setCustomId("input_objet")
                .setLabel("Nom de l'objet (ou plusieurs séparés)")
                .setPlaceholder("Ex: Pistolet, Munitions")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const inputQuantite = new Discord.TextInputBuilder()
                .setCustomId("input_quantite")
                .setLabel("Quantité (ex: 2, 50)")
                .setPlaceholder("Ex: 2, 50 ou 1, 100 si plusieurs")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(inputObjet),
                new Discord.ActionRowBuilder().addComponents(inputQuantite)
            );

            await interaction.showModal(modal);
        }
        return;
    }

    // --- 4. GESTION DES SOUMISSIONS DE MODALS ---
    if (interaction.type === Discord.InteractionType.ModalSubmit) {
        const emetteurMention = interaction.user.toString();
        const today = new Date();
        const dateFormatted = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

        // MODAL ABSENCE
        if (interaction.customId === "modal_absence") {
            await interaction.deferReply();

            const dateDebut = interaction.fields.getTextInputValue("input_date_debut");
            const dateFin = interaction.fields.getTextInputValue("input_date_fin");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const nomDiscord = interaction.member?.displayName || interaction.user.username;
            const texteAbsenceStr = `Du ${dateDebut} au ${dateFin}`;

            await envoyerAuGoogleSheet(nomDiscord, { texteAbsence: texteAbsenceStr });

            const template = `${interaction.user}\nDate de début : ${dateDebut}\nDate de fin : ${dateFin}\nMotif : ${motif}`;
            await interaction.editReply({ 
                content: template,
                allowedMentions: { parse: ["users", "roles", "everyone"] }
            });
        }

        // MODAL COFFRE (DEPOT / RETRAIT)
        else if (interaction.customId.startsWith("modal_depot_") || interaction.customId.startsWith("modal_retrait_")) {
            try {
                const isDepot = interaction.customId.startsWith("modal_depot_");
                const keyCoffre = interaction.customId.replace(isDepot ? "modal_depot_" : "modal_retrait_", "");
                const nomCoffre = keyCoffre === "appli" ? "Coffre application" : "Coffre lead";

                const objetsRaw = interaction.fields.getTextInputValue("input_objet");
                const quantitesRaw = interaction.fields.getTextInputValue("input_quantite");

                const listeObjets = objetsRaw.split(",").map(item => item.trim());
                const listeQuantites = quantitesRaw.split(",").map(item => item.trim());

                if (!bot.inventaire) bot.inventaire = { appli: {}, lead: {} };
                if (!bot.inventaire[keyCoffre]) bot.inventaire[keyCoffre] = {};

                let texteObjets = "";
                for (let i = 0; i < listeObjets.length; i++) {
                    let nomObjet = listeObjets[i];
                    if (!nomObjet) continue;

                    let qteRaw = listeQuantites[i] || listeQuantites[0] || "1";
                    let qteNum = parseInt(qteRaw) || 1;

                    if (!bot.inventaire[keyCoffre][nomObjet]) {
                        bot.inventaire[keyCoffre][nomObjet] = 0;
                    }

                    if (isDepot) {
                        bot.inventaire[keyCoffre][nomObjet] += qteNum;
                    } else {
                        bot.inventaire[keyCoffre][nomObjet] -= qteNum;
                        if (bot.inventaire[keyCoffre][nomObjet] <= 0) {
                            delete bot.inventaire[keyCoffre][nomObjet];
                        }
                    }

                    texteObjets += `- ${i + 1}. x${qteNum} ${nomObjet}\n`;
                }

                let intituleAction = isDepot ? "Déposé par" : "Retiré par";
                let messageFinal = `**__${nomCoffre}__** (${isDepot ? "Dépôt" : "Retrait"})\n\n${texteObjets}\n${intituleAction} ${emetteurMention}`;

                await interaction.reply({ 
                    content: messageFinal,
                    allowedMentions: { parse: ["users", "roles", "everyone"] }
                });
            } catch (err) {
                console.error("Erreur coffre :", err);
                if (!interaction.replied) {
                    await interaction.reply({ content: "Une erreur est survenue lors de la mise à jour du coffre.", flags: Discord.MessageFlags.Ephemeral });
                }
            }
        }

        // MODAL AVERTISSEMENTS (WARN)
        else if (interaction.customId.startsWith("modal_avertissement_")) {
            const level = interaction.customId.replace("modal_avertissement_", "");
            const membreInput = interaction.fields.getTextInputValue("input_membre");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const targetMember = await getTargetMember(interaction.guild, membreInput);
            let memberMention = targetMember ? targetMember.toString() : membreInput;
            let nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

            if (targetMember) {
                const roleId = ROLES_WARN[level];
                if (roleId) await targetMember.roles.add(roleId).catch(err => console.error("Erreur ajout rôle avertissement :", err));
            }

            let intituleSanction = level === "1" ? "1er avertissement" : level === "2" ? "2ème avertissement" : "Dernier avertissement";
            await envoyerAuGoogleSheet(nomCible, { sanctionIntitule: intituleSanction });

            let decisionTexte = "";
            if (level === "1") decisionTexte = "☒ Premier avertissement\n☐ Deuxième avertissement \n☐ Dernier avertissement avant sanction";
            else if (level === "2") decisionTexte = "☐ Premier avertissement\n☒ Deuxième avertissement \n☐ Dernier avertissement avant sanction";
            else decisionTexte = "☐ Premier avertissement\n☐ Deuxième avertissement \n☒ Dernier avertissement avant sanction";

            const template = `# AVERTISSEMENT \n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\nAu sein de cette Famille, chaque décision est prise avec réflexion. Aujourd'hui, nous choisissons de vous laisser une occasion de prouver votre valeur.\n\nConsidérez cette décision comme une faveur, non comme une faiblesse.\n\nLe moindre nouvel écart entraînera des mesures plus sévères.\n\n**Décision :**\n${decisionTexte}\n\n**Cordialement,**\n<@&1508046852027842600>`;

            await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
        }

        // MODAL MISE EN GARDE
        else if (interaction.customId === "modal_mise_en_garde") {
            const membreInput = interaction.fields.getTextInputValue("input_membre");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const targetMember = await getTargetMember(interaction.guild, membreInput);
            let memberMention = targetMember ? targetMember.toString() : membreInput;
            let nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

            if (targetMember && ROLE_MEG) {
                await targetMember.roles.add(ROLE_MEG).catch(err => console.error("Erreur ajout rôle MEG :", err));
            }

            await envoyerAuGoogleSheet(nomCible, { sanctionIntitule: "Mise en garde" });

            const template = `# MISE EN GARDE \n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Raison / Rappel :**\n${motif}\n\nLa discipline est le pilier de notre Famille. Ceci est un pré-avertissement formel afin de vous rappeler les règles de The Olympius Syndicate.\n\nPrenez ce rappel au sérieux pour éviter tout avertissement officiel (warn) ou sanction plus lourde.\n\n**Cordialement,**\n<@&1508046852027842600>`;

            await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
        }

        // MODAL CONVOCATION
        else if (interaction.customId === "modal_convocation") {
            const membreInput = interaction.fields.getTextInputValue("input_membre");
            const heure = interaction.fields.getTextInputValue("input_heure");
            const lieu = interaction.fields.getTextInputValue("input_lieu");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const targetMember = await getTargetMember(interaction.guild, membreInput);
            let memberMention = targetMember ? targetMember.toString() : membreInput;
            let nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

            if (targetMember && ROLE_CONVOCATION) {
                await targetMember.roles.add(ROLE_CONVOCATION).catch(err => console.error("Erreur ajout rôle convocation :", err));
            }

            await envoyerAuGoogleSheet(nomCible, { sanctionIntitule: "Convoqué" });

            const template = `# CONVOCATION\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Convoqué par :** ${emetteurMention}\n\n**Date de la convocation :** ${dateFormatted}\n\n**Heure :** ${heure}\n\n**Lieu :** ${lieu}\n\n**Motif :**\n${motif}\n\nLa Direction de **The Olympius Syndicate** exige votre présence.\n\nVotre présence est obligatoire.\n\nToute absence injustifiée sera interprétée comme un manque de respect envers la Famille.\n\n**Cordialement,**\n<@&1508046852027842600>`;

            await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
        }

        // MODAL SANCTION
        else if (interaction.customId === "modal_sanction") {
            const membreInput = interaction.fields.getTextInputValue("input_membre");
            const duree = interaction.fields.getTextInputValue("input_duree");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const targetMember = await getTargetMember(interaction.guild, membreInput);
            let memberMention = targetMember ? targetMember.toString() : membreInput;
            let nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

            await envoyerAuGoogleSheet(nomCible, { sanctionIntitule: `Sanction (${duree})` });

            const template = `# SANCTION DISCIPLINAIRE\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\n**Durée de la sanction :**\n${duree}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu son jugement.\n\nVos actes ont porté atteinte à la discipline et à l'honneur de notre Famille.\n\nLa sanction prend effet immédiatement pour la durée indiquée ci-dessus.\n\nRespectez cette décision et montrez que vous méritez encore votre place parmi nous.\n\n**Cordialement,**\n<@&1508046852027842600>`;

            await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
        }

        // MODAL MORT RP
        else if (interaction.customId === "modal_mort_rp") {
            const membreInput = interaction.fields.getTextInputValue("input_membre");
            let dateHeure = "";
            try {
                dateHeure = interaction.fields.getTextInputValue("input_date_heure");
            } catch {
                dateHeure = interaction.fields.getTextInputValue("input_date");
            }
            const motif = interaction.fields.getTextInputValue("input_motif");

            const targetMember = await getTargetMember(interaction.guild, membreInput);
            let memberMention = targetMember ? targetMember.toString() : membreInput;
            let nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

            if (targetMember && ROLE_MORT_RP) {
                await targetMember.roles.add(ROLE_MORT_RP).catch(err => console.error("Erreur ajout rôle mort RP :", err));
            }

            await envoyerAuGoogleSheet(nomCible, { sanctionIntitule: "Mort RP" });

            const template = `# ÉXÉCUTION OFFICIELLE\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Exécuté par :** ${emetteurMention}\n\n**Date et Heure du décès :** ${dateHeure}\n\n**Motif :**\n${motif}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu son jugement.\n\nVos actes ont porté atteinte à la discipline et à l'honneur de notre Famille.\n\nQue la mort de notre membre serve d'exemple aux autres.\n\n**Cordialement,**\n<@&1508046852027842600>`;

            await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
        }

        // MODAL BLACKLIST
        else if (interaction.customId === "modal_blacklist") {
            const membreInput = interaction.fields.getTextInputValue("input_membre");
            const dureeInput = interaction.fields.getTextInputValue("input_duree").trim();
            const motif = interaction.fields.getTextInputValue("input_motif");

            const targetMember = await getTargetMember(interaction.guild, membreInput);
            let memberMention = targetMember ? targetMember.toString() : membreInput;
            let nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

            if (targetMember && ROLE_BLACKLIST) {
                await targetMember.roles.add(ROLE_BLACKLIST).catch(err => console.error("Erreur ajout rôle blacklist :", err));
            }

            await envoyerAuGoogleSheet(nomCible, { sanctionIntitule: "Blacklist" });

            let dureeTexte = "";
            if (dureeInput.toLowerCase() === "permanente" || dureeInput.toLowerCase() === "perm") {
                dureeTexte = "☒ Permanente\n☐ Temporaire :";
            } else {
                dureeTexte = `☐ Permanente\n☒ Temporaire : ${dureeInput}`;
            }

            const template = `# BLACKLIST\n\n## MAFIA The Olympius Syndicate\n\n**Nom de la personne :** ${memberMention}\n\n**Inscription décidée par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\n**Durée :**\n${dureeTexte}\n\nPar décision de la Direction, vous êtes inscrit sur la **Blacklist officielle de The Olympius Syndicate**.\n\nCette mesure vous interdit toute réintégration ou toute collaboration avec notre Famille pendant la durée indiquée.\n\nLa confiance ne se réclame pas. Elle se mérite.\n\nVotre dossier restera archivé au sein de nos registres.\n\n**Cordialement,**\n<@&1508046852027842600>`;

            await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
        }

        // MODAL PROMOTION
        else if (interaction.customId === "modal_promotion") {
            const membreInput = interaction.fields.getTextInputValue("input_membre");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const targetMember = await getTargetMember(interaction.guild, membreInput);
            let memberMention = targetMember ? targetMember.toString() : membreInput;

            const template = `# PROMOTION\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu sa décision.\n\nVos actions ont fait honneur à notre Famille.\n\nVotre fidélité nous prouve aujourd'hui que vous êtes capable du meilleur.\n\nHonorez cette promotion et continuez à vous montrer digne de votre place parmi nous.\n\n**Cordialement,**\n<@&1508046852027842600>`;

            await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
        }

        // MODAL PRIME
        else if (interaction.customId === "modal_prime") {
            const membreInput = interaction.fields.getTextInputValue("input_membre");
            const motif = interaction.fields.getTextInputValue("input_motif");

            const targetMember = await getTargetMember(interaction.guild, membreInput);
            let memberMention = targetMember ? targetMember.toString() : membreInput;

            const template = `# PRIME DE RÉCOMPENSE\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Accordée par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\nLa Direction de **The Olympius Syndicate** tient à saluer vos récents efforts.\n\nVos services et votre loyauté envers la Famille méritent d'être récompensés à leur juste valeur.\n\nContinuez sur cette voie.\n\n**Cordialement,**\n<@&1508046852027842600>`;

            await interaction.reply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
        }
    }
};