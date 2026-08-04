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

const COLUMN_MAPPING = {
    'pacific': 'D',
    'bijouterie': 'E',
    'flecca': 'F',
    'superette': 'G',
    'conteneur': 'H',
    'atm': 'I'
};

async function updateHeistStats(sheets, spreadsheetId, participants, heistType) {
    const colLetter = COLUMN_MAPPING[heistType.toLowerCase()];
    if (!colLetter) return;

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'B5:B34', 
        });

        const rows = response.data.values || [];

        for (const member of participants) {
            const rowIndex = rows.findIndex(row => 
                row[0] && row[0].trim().toLowerCase() === member.displayName.trim().toLowerCase()
            );

            if (rowIndex !== -1) {
                const actualRow = 5 + rowIndex;
                const cellRange = `${colLetter}${actualRow}`;

                const cellData = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range: cellRange,
                });

                const currentValue = parseInt(cellData.data.values?.[0]?.[0] || '0', 10);
                
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: cellRange,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [[currentValue + 1]]
                    }
                });
            }
        }
    } catch (err) {
        console.error("Erreur lors de la mise à jour Google Sheets :", err);
    }
}
async function envoyerAuGoogleSheet(nomDiscord, { texteAbsence, sanctionIntitule, grade = "Recrue" }) {
    if (!WEBHOOK_SHEET_URL || !nomDiscord) return;
    try {
        await fetch(WEBHOOK_SHEET_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nomDiscord: nomDiscord,
                grade: grade,
                texteAbsence: texteAbsence || null,
                sanctionIntitule: sanctionIntitule || null
            })
        });
    } catch (err) {
        console.error("Erreur d'envoi vers Google Sheet :", err);
    }
}

async function envoyerBlacklistAuSheet({ nomPrenom, duree, date, lienDiscord, raison }) {
    if (!WEBHOOK_SHEET_URL) return;
    try {
        await fetch(WEBHOOK_SHEET_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "blacklist",
                nomPrenom: nomPrenom,
                neLe: "//",
                sexe: "Homme",
                taille: "//",
                duree: duree,
                date: date,
                lienDiscord: lienDiscord,
                raison: raison
            })
        });
    } catch (err) {
        console.error("Erreur d'envoi Blacklist vers Sheet :", err);
    }
}

async function getTargetMember(guild, input) {
    if (!input) return null;
    const cleanInput = input.trim();
    
    const userIdMatch = cleanInput.match(/\d{17,19}/);
    if (userIdMatch) {
        try {
            return await guild.members.fetch(userIdMatch[0]);
        } catch (e) {}
    }

    try {
        const members = await guild.members.search({ query: cleanInput, limit: 1 });
        return members.first() || null;
    } catch (err) {
        console.error("Erreur recherche membre :", err);
        return null;
    }
}

async function getTargetMember(guild, input) {
    if (!input) return null;
    const cleanInput = input.trim();
    
    const userIdMatch = cleanInput.match(/\d{17,19}/);
    if (userIdMatch) {
        try {
            return await guild.members.fetch(userIdMatch[0]);
        } catch (e) {}
    }

    const cachedMember = guild.members.cache.find(m => 
        m.displayName.toLowerCase() === cleanInput.toLowerCase() ||
        m.user.username.toLowerCase() === cleanInput.toLowerCase()
    );
    if (cachedMember) return cachedMember;

    try {
        const members = await guild.members.search({ query: cleanInput, limit: 1 });
        return members.first() || null;
    } catch (err) {
        console.error("Erreur recherche membre :", err);
        return null;
    }
}

module.exports = async (bot, interaction) => {
    try {
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

        if (interaction.isButton()) {
            if (interaction.customId.startsWith("btn_braquage_")) {
                const typeBraquage = interaction.customId.replace("btn_braquage_", "");

                let titreModal = "Déclaration de Braquage";
                if (typeBraquage === "atm") titreModal = "Braquage d'ATM";
                else if (typeBraquage === "conteneur") titreModal = "Braquage de Conteneur";
                else if (typeBraquage === "superette") titreModal = "Braquage de Supérette";
                else if (typeBraquage === "fleeca") titreModal = "Braquage de Fleeca";
                else if (typeBraquage === "bijouterie") titreModal = "Braquage de Bijouterie";
                else if (typeBraquage === "banque_centrale") titreModal = "Braquage de Banque Centrale";

                const modal = new Discord.ModalBuilder()
                    .setCustomId(`modal_braquage_${typeBraquage}`)
                    .setTitle(titreModal);

                const inputBraqueurs = new Discord.TextInputBuilder()
                    .setCustomId("input_braqueurs")
                    .setLabel("Braqueurs (mentions, pseudos ou IDs)")
                    .setPlaceholder("Ex: @Membre1, @Membre2")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                const inputOtages = new Discord.TextInputBuilder()
                    .setCustomId("input_otages")
                    .setLabel("Nombre d'otages")
                    .setPlaceholder("Ex: 3 (ou 0)")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                const inputLieu = new Discord.TextInputBuilder()
                    .setCustomId("input_lieu")
                    .setLabel("Lieu")
                    .setPlaceholder("Ex: Supérette Vinewood")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                const inputAutorisation = new Discord.TextInputBuilder()
                    .setCustomId("input_autorisation")
                    .setLabel("Autorisation donnée par")
                    .setPlaceholder("Ex: @Leader")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                const inputGain = new Discord.TextInputBuilder()
                    .setCustomId("input_gain_et_coffre")
                    .setLabel("Argent sale gagné & Transféré au coffre")
                    .setPlaceholder("Ex: 150000$ | Oui")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(
                    new Discord.ActionRowBuilder().addComponents(inputBraqueurs),
                    new Discord.ActionRowBuilder().addComponents(inputOtages),
                    new Discord.ActionRowBuilder().addComponents(inputLieu),
                    new Discord.ActionRowBuilder().addComponents(inputAutorisation),
                    new Discord.ActionRowBuilder().addComponents(inputGain)
                );

                return await interaction.showModal(modal);
            }
            else if (interaction.customId === "btn_absence") {
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
            else if (interaction.customId === "btn_start_patrouille") {
                const modal = new Discord.ModalBuilder()
                    .setCustomId("modal_patrouille")
                    .setTitle("Prise de Patrouille");

                const inputLeader = new Discord.TextInputBuilder()
                    .setCustomId("input_leader")
                    .setLabel("Plus haut gradé (mention/ID/pseudo)")
                    .setPlaceholder("Ex: @Leader ou 123456789")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                const inputMembres = new Discord.TextInputBuilder()
                    .setCustomId("input_membres")
                    .setLabel("Membres présents (mentions/pseudos)")
                    .setPlaceholder("Ex: @Membre1, @Membre2")
                    .setStyle(Discord.TextInputStyle.Paragraph)
                    .setRequired(true);

                const inputModele = new Discord.TextInputBuilder()
                    .setCustomId("input_modele")
                    .setLabel("Modèle du véhicule")
                    .setPlaceholder("Ex: Sultan RS, Cognoscenti...")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                const inputPlaque = new Discord.TextInputBuilder()
                    .setCustomId("input_plaque")
                    .setLabel("Plaque d'immatriculation")
                    .setPlaceholder("Ex: OLY-889")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(
                    new Discord.ActionRowBuilder().addComponents(inputLeader),
                    new Discord.ActionRowBuilder().addComponents(inputMembres),
                    new Discord.ActionRowBuilder().addComponents(inputModele),
                    new Discord.ActionRowBuilder().addComponents(inputPlaque)
                );

                await interaction.showModal(modal);
            }
            else if (interaction.customId === "btn_end_patrouille") {
                const timestampFin = Math.floor(Date.now() / 1000);
                let contentOriginal = interaction.message.content;

                let nouveauContenu = contentOriginal
                    .replace(
                        "**Date et heure de fin :** *En cours...*",
                        `**Date et heure de fin :** <t:${timestampFin}:f> (<t:${timestampFin}:R>)`
                    )
                    .replace(
                        "**Status :** 🟢 **Patrouille Active**",
                        "**Status :** 🔴 **Patrouille Terminée**"
                    );

                const btnTermine = new Discord.ButtonBuilder()
                    .setCustomId("btn_patrouille_terminee")
                    .setLabel("Patrouille Terminée")
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setDisabled(true);

                const row = new Discord.ActionRowBuilder().addComponents(btnTermine);

                await interaction.update({
                    content: nouveauContenu,
                    components: [row]
                });
            }
            else if (interaction.customId === "btn_start_ronde") {
                const modal = new Discord.ModalBuilder()
                    .setCustomId("modal_ronde")
                    .setTitle("Prise de Ronde");

                const inputSection = new Discord.TextInputBuilder()
                    .setCustomId("input_section")
                    .setLabel("Section(s) protégée(s) (1, 2, 3 ou 4)")
                    .setPlaceholder("Ex: Section 1 et 2")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                const inputMembres = new Discord.TextInputBuilder()
                    .setCustomId("input_membres")
                    .setLabel("Membres présents (mentions/pseudos)")
                    .setPlaceholder("Ex: @Membre1, @Membre2")
                    .setStyle(Discord.TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(
                    new Discord.ActionRowBuilder().addComponents(inputSection),
                    new Discord.ActionRowBuilder().addComponents(inputMembres)
                );

                await interaction.showModal(modal);
            }
            else if (interaction.customId === "btn_end_ronde") {
                const timestampFin = Math.floor(Date.now() / 1000);
                let contentOriginal = interaction.message.content;

                const nouveauContenu = contentOriginal
                    .replace(
                        "**Date et heure de fin :** *En cours...*",
                        `**Date et heure de fin :** <t:${timestampFin}:f> (<t:${timestampFin}:R>)`
                    )
                    .replace(
                        "**Status :** 🟢 **Ronde Active**",
                        "**Status :** 🔴 **Ronde Terminée**"
                    );

                const btnTermine = new Discord.ButtonBuilder()
                    .setCustomId("btn_ronde_terminee")
                    .setLabel("Ronde Terminée")
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setDisabled(true);

                const row = new Discord.ActionRowBuilder().addComponents(btnTermine);

                await interaction.update({
                    content: nouveauContenu,
                    components: [row]
                });
            }
            return;
        }

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

        if (interaction.type === Discord.InteractionType.ModalSubmit) {
            const emetteurMention = interaction.user.toString();
            const today = new Date();
            const dateFormatted = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

            await interaction.deferReply();

            if (interaction.customId === "modal_absence") {
                const dateDebut = interaction.fields.getTextInputValue("input_date_debut");
                const dateFin = interaction.fields.getTextInputValue("input_date_fin");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const nomDiscord = interaction.member?.displayName || interaction.user.username;
                const texteAbsenceStr = `Du ${dateDebut} au ${dateFin}`;

                envoyerAuGoogleSheet(nomDiscord, { texteAbsence: texteAbsenceStr })
                    .catch(err => console.error("Erreur Google Sheet :", err));

                const template = `${interaction.user}\nDate de début : ${dateDebut}\nDate de fin : ${dateFin}\nMotif : ${motif}`;
                await interaction.editReply({ 
                    content: template,
                    allowedMentions: { parse: ["users", "roles", "everyone"] }
                });
            }

            else if (interaction.customId.startsWith("modal_depot_") || interaction.customId.startsWith("modal_retrait_")) {
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

                await interaction.editReply({ 
                    content: messageFinal,
                    allowedMentions: { parse: ["users", "roles", "everyone"] }
                });
            }

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
                envoyerAuGoogleSheet(nomCible, { sanctionIntitule: intituleSanction })
                    .catch(err => console.error("Erreur Google Sheet :", err));

                const decisionTexte = [
                    `${level === "1" ? "☒" : "☐"} Premier avertissement`,
                    `${level === "2" ? "☒" : "☐"} Deuxième avertissement`,
                    `${level === "3" ? "☒" : "☐"} Dernier avertissement avant sanction`
                ].join("\n");

                const template = `# AVERTISSEMENT \n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\nAu sein de cette Famille, chaque décision est prise avec réflexion. Aujourd'hui, nous choisissons de vous laisser une occasion de prouver votre valeur.\n\nConsidérez cette décision comme une faveur, non comme une faiblesse.\n\nLe moindre nouvel écart entraînera des mesures plus severe.\n\n**Décision :**\n${decisionTexte}\n\n**Cordialement,**\n<@&1508046852027842600>`;

                await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
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

                envoyerAuGoogleSheet(nomCible, { sanctionIntitule: "Mise en garde" })
                    .catch(err => console.error("Erreur Google Sheet :", err));

                const template = `# MISE EN GARDE \n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Raison / Rappel :**\n${motif}\n\nLa discipline est le pilier de notre Famille. Ceci est un pré-avertissement formel afin de vous rappeler les règles de The Olympius Syndicate.\n\nPrenez ce rappel au sérieux pour éviter tout avertissement officiel (warn) ou sanction plus lourde.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
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

                envoyerAuGoogleSheet(nomCible, { sanctionIntitule: "Convoqué" })
                    .catch(err => console.error("Erreur Google Sheet :", err));

                const template = `# CONVOCATION\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Convoqué par :** ${emetteurMention}\n\n**Date de la convocation :** ${dateFormatted}\n\n**Heure :** ${heure}\n\n**Lieu :** ${lieu}\n\n**Motif :**\n${motif}\n\nLa Direction de **The Olympius Syndicate** exige votre présence.\n\nVotre présence est obligatoire.\n\nToute absence injustifiée sera interprétée comme un manque de respect envers la Famille.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            // MODAL SANCTION
            else if (interaction.customId === "modal_sanction") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const duree = interaction.fields.getTextInputValue("input_duree");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                let memberMention = targetMember ? targetMember.toString() : membreInput;
                let nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                envoyerAuGoogleSheet(nomCible, { sanctionIntitule: `Sanction (${duree})` })
                    .catch(err => console.error("Erreur Google Sheet :", err));

                const template = `# SANCTION DISCIPLINAIRE\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\n**Durée de la sanction :**\n${duree}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu son jugement.\n\nVos actes ont porté atteinte à la discipline et à l'honneur de notre Famille.\n\nLa sanction prend effet immédiatement pour la durée indiquée ci-dessus.\n\nRespectez cette décision et montrez que vous méritez encore votre place parmi nous.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
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

                envoyerAuGoogleSheet(nomCible, { sanctionIntitule: "Mort RP" })
                    .catch(err => console.error("Erreur Google Sheet :", err));

                const template = `# ÉXÉCUTION OFFICIELLE\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Exécuté par :** ${emetteurMention}\n\n**Date et Heure du décès :** ${dateHeure}\n\n**Motif :**\n${motif}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu son jugement.\n\nVos actes ont porté atteinte à la discipline et à l'honneur de notre Famille.\n\nQue la mort de notre membre serve d'exemple aux autres.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            // MODAL BLACKLIST
            else if (interaction.customId === "modal_blacklist") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const dureeInput = interaction.fields.getTextInputValue("input_duree").trim();
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                let memberMention = targetMember ? targetMember.toString() : membreInput;
                let nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;
                let lienDiscord = targetMember ? `https://discord.com/users/${targetMember.id}` : membreInput;

                if (targetMember && ROLE_BLACKLIST) {
                    await targetMember.roles.add(ROLE_BLACKLIST).catch(err => console.error("Erreur ajout rôle blacklist :", err));
                }

                envoyerBlacklistAuSheet({
                    nomPrenom: nomCible,
                    duree: dureeInput,
                    date: dateFormatted,
                    lienDiscord: lienDiscord,
                    raison: motif
                }).catch(err => console.error("Erreur Google Sheet Blacklist :", err));

                let dureeTexte = (dureeInput.toLowerCase() === "permanente" || dureeInput.toLowerCase() === "perm" || dureeInput.toLowerCase() === "indéterminée")
                    ? "☒ Indéterminée / Permanente\n☐ Temporaire :"
                    : `☐ Permanente\n☒ Temporaire : ${dureeInput}`;

                const template = `# BLACKLIST\n\n## MAFIA The Olympius Syndicate\n\n**Nom de la personne :** ${memberMention}\n\n**Inscription décidée par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\n**Durée :**\n${dureeTexte}\n\nPar décision de la Direction, vous êtes inscrit sur la **Blacklist officielle de The Olympius Syndicate**.\n\nCette mesure vous interdit toute réintégration ou toute collaboration avec notre Famille pendant la durée indiquée.\n\nLa confiance ne se réclame pas. Elle se mérite.\n\nVotre dossier restera archivé au sein de nos registres.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            // MODAL PROMOTION
            else if (interaction.customId === "modal_promotion") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const gradeInput = interaction.fields.getTextInputValue("input_grade");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                let memberMention = targetMember ? targetMember.toString() : membreInput;
                let nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                let gradeAffichage = gradeInput;

                if (targetMember && gradeInput) {
                    const nouveauGradeObj = hierarchie.roles.find(
                        r => r.nom.toLowerCase() === gradeInput.trim().toLowerCase()
                    );

                    if (nouveauGradeObj) {
                        gradeAffichage = `<@&${nouveauGradeObj.id}>`;

                        const idsHierarchie = hierarchie.roles.map(r => r.id);

                        const rolesARetirer = targetMember.roles.cache.filter(r => idsHierarchie.includes(r.id));
                        if (rolesARetirer.size > 0) {
                            await targetMember.roles.remove(rolesARetirer).catch(err => console.error("Erreur retrait anciens rôles hiérarchie :", err));
                        }

                        await targetMember.roles.add(nouveauGradeObj.id).catch(err => console.error("Erreur ajout nouveau rôle hiérarchie :", err));
                    }
                }

                envoyerAuGoogleSheet(nomCible, { 
                    grade: gradeInput || "Recrue", 
                    sanctionIntitule: `Promotion : ${gradeInput || "Nouveau Grade"}` 
                }).catch(err => console.error("Erreur Google Sheet :", err));

                const template = `# PROMOTION\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Nouveau Grade :** ${gradeAffichage}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu sa décision.\n\nVos actions ont fait honneur à notre Famille.\n\nVotre fidélité nous prouve aujourd'hui que vous êtes capable du meilleur.\n\nHonorez cette promotion et continuez à vous montrer digne de votre place parmi nous.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                await interaction.editReply({ 
                    content: template, 
                    allowedMentions: { parse: ["users", "roles", "everyone"] } 
                });
            }

            // MODAL RÉTROGRADATION
            else if (interaction.customId === "modal_retrogradation") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const gradeInput = interaction.fields.getTextInputValue("input_grade");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                let memberMention = targetMember ? targetMember.toString() : membreInput;
                let nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                let gradeAffichage = gradeInput;

                if (targetMember && gradeInput) {
                    const nouveauGradeObj = hierarchie.roles.find(
                        r => r.nom.toLowerCase() === gradeInput.trim().toLowerCase()
                    );

                    if (nouveauGradeObj) {
                        gradeAffichage = `<@&${nouveauGradeObj.id}>`;

                        const idsHierarchie = hierarchie.roles.map(r => r.id);

                        const rolesARetirer = targetMember.roles.cache.filter(r => idsHierarchie.includes(r.id));
                        if (rolesARetirer.size > 0) {
                            await targetMember.roles.remove(rolesARetirer).catch(err => console.error("Erreur retrait anciens rôles hiérarchie :", err));
                        }

                        await targetMember.roles.add(nouveauGradeObj.id).catch(err => console.error("Erreur ajout nouveau rôle hiérarchie :", err));
                    }
                }

                envoyerAuGoogleSheet(nomCible, { 
                    grade: gradeInput || "Recrue", 
                    sanctionIntitule: `Rétrogradation : ${gradeInput || "Ancien Grade"}` 
                }).catch(err => console.error("Erreur Google Sheet :", err));

                const template = `# RÉTROGRADATION\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Nouveau Grade :** ${gradeAffichage}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu sa décision.\n\nVos récents agissements et vos erreurs ne correspondent plus aux exigences de votre rang.\n\nCette rétrogradation est un rappel à l'ordre formel. À vous de faire vos preuves à nouveau si vous souhaitez regagner la confiance de la Famille.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                await interaction.editReply({ 
                    content: template, 
                    allowedMentions: { parse: ["users", "roles", "everyone"] } 
                });
            }

            // MODAL PRIME
            else if (interaction.customId === "modal_prime") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                let memberMention = targetMember ? targetMember.toString() : membreInput;

                const template = `# PRIME DE RÉCOMPENSE\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Accordée par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\nLa Direction de **The Olympius Syndicate** tient à saluer vos récents efforts.\n\nVos services et votre loyauté envers la Famille méritent d'être récompensés à leur juste valeur.\n\nContinuez sur cette voie.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            // DÉCLENCHEMENT DU MODAL VIA BOUTON
else if (interaction.customId.startsWith("btn_braquage_")) {
    const typeBraquage = interaction.customId.replace("btn_braquage_", "");

    let titreModal = "Déclaration de Braquage";
    if (typeBraquage === "atm") titreModal = "Braquage d'ATM";
    else if (typeBraquage === "conteneur") titreModal = "Braquage de Conteneur";
    else if (typeBraquage === "superette") titreModal = "Braquage de Supérette";
    else if (typeBraquage === "fleeca") titreModal = "Braquage de Fleeca";
    else if (typeBraquage === "bijouterie") titreModal = "Braquage de Bijouterie";
    else if (typeBraquage === "banque_centrale") titreModal = "Braquage de Banque Centrale";

    const modal = new Discord.ModalBuilder()
        .setCustomId(`modal_braquage_${typeBraquage}`)
        .setTitle(titreModal);

    const inputBraqueurs = new Discord.TextInputBuilder()
        .setCustomId("input_braqueurs")
        .setLabel("Braqueurs (mentions, pseudos ou IDs)")
        .setPlaceholder("Ex: @Membre1, @Membre2 ou nonop, alex")
        .setStyle(Discord.TextInputStyle.Short)
        .setRequired(true);

    const inputOtages = new Discord.TextInputBuilder()
        .setCustomId("input_otages")
        .setLabel("Nombre d'otages")
        .setPlaceholder("Ex: 3 (ou 0 si aucun)")
        .setStyle(Discord.TextInputStyle.Short)
        .setRequired(true);

    const inputLieu = new Discord.TextInputBuilder()
        .setCustomId("input_lieu")
        .setLabel("Lieu")
        .setPlaceholder("Ex: Supérette Vinewood / Fleeca Legion Square")
        .setStyle(Discord.TextInputStyle.Short)
        .setRequired(true);

    const inputAutorisation = new Discord.TextInputBuilder()
        .setCustomId("input_autorisation")
        .setLabel("Autorisation donnée par (mention/pseudo)")
        .setPlaceholder("Ex: @Leader ou nonop")
        .setStyle(Discord.TextInputStyle.Short)
        .setRequired(true);

    const inputGain = new Discord.TextInputBuilder()
        .setCustomId("input_gain_et_coffre")
        .setLabel("Argent sale gagné & Transféré au coffre")
        .setPlaceholder("Ex: 150000$ | Oui (ou Non)")
        .setStyle(Discord.TextInputStyle.Short)
        .setRequired(true);

    modal.addComponents(
        new Discord.ActionRowBuilder().addComponents(inputBraqueurs),
        new Discord.ActionRowBuilder().addComponents(inputOtages),
        new Discord.ActionRowBuilder().addComponents(inputLieu),
        new Discord.ActionRowBuilder().addComponents(inputAutorisation),
        new Discord.ActionRowBuilder().addComponents(inputGain)
    );

    // Ne PAS mettre de deferReply() ou deferUpdate() avant cette ligne !
    await interaction.showModal(modal);
}

           // MODAL DÉCLARATION BRAQUAGE
else if (interaction.customId.startsWith("modal_braquage_")) {
    const typeBraquage = interaction.customId.replace("modal_braquage_", "");

    const braqueursInput = interaction.fields.getTextInputValue("input_braqueurs");
    const otagesInput = interaction.fields.getTextInputValue("input_otages");
    const lieuInput = interaction.fields.getTextInputValue("input_lieu");
    const autoInput = interaction.fields.getTextInputValue("input_autorisation");
    const gainEtCoffreInput = interaction.fields.getTextInputValue("input_gain_et_coffre");

    // Traitement du gain et du coffre (Format attendu : "150000$ | Oui" ou séparé par un espace/virgule)
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

    // Formatage des mentions ET récupération des membres pour le Sheet
    const listeBraqueursBrute = braqueursInput.split(/[,/]/).map(b => b.trim());
    let braqueursFormates = [];
    let braqueursMembres = []; // Tableau contenant les objets GuildMember trouvés

    for (const item of listeBraqueursBrute) {
        if (!item) continue;
        const member = await getTargetMember(interaction.guild, item);
        if (member) {
            braqueursFormates.push(member.toString());
            braqueursMembres.push(member); // Ajout pour le Sheet
        } else {
            braqueursFormates.push(item);
        }
    }
    const texteBraqueurs = braqueursFormates.join(" / ");

    // MAJ Google Sheets (incrémentation du nombre de braquages +1)
    if (typeof updateHeistStats === 'function' && typeof sheets !== 'undefined' && typeof SPREADSHEET_ID !== 'undefined') {
        await updateHeistStats(sheets, SPREADSHEET_ID, braqueursMembres, typeBraquage);
    }

    // Formatage de la mention d'autorisation
    const autoMember = await getTargetMember(interaction.guild, autoInput);
    const autoMention = autoMember ? autoMember.toString() : autoInput;

    // Titre selon la cible avec gestion de l'apostrophe pour ATM
    let intituleTarget = "";
    switch (typeBraquage) {
        case "atm": intituleTarget = "d'ATM"; break;
        case "conteneur": intituleTarget = "de conteneur"; break;
        case "superette": intituleTarget = "de supérette"; break;
        case "fleeca": intituleTarget = "de Fleeca"; break;
        case "bijouterie": intituleTarget = "de Bijouterie"; break;
        case "pacific":
        case "banque_centrale": intituleTarget = "de Banque Centrale"; break;
        default: intituleTarget = "de braquage";
    }

    const messageFinal = `**__Braquage ${intituleTarget} :__**\n\n` +
        `Braqueurs : ${texteBraqueurs}\n` +
        `Nombre d'otages : ${otagesInput}\n` +
        `Lieu : ${lieuInput}\n` +
        `Autorisation : ${autoMention}\n` +
        `Argent sale gagné : ${gain}\n` +
        `Transféré au coffre : ${transfereCoffre}`;

    await interaction.editReply({
        content: messageFinal,
        allowedMentions: { parse: ["users", "roles"] }
    });
}

            // MODAL PRISE DE PATROUILLE
            else if (interaction.customId === "modal_patrouille") {
                const leaderInput = interaction.fields.getTextInputValue("input_leader");
                const membresInput = interaction.fields.getTextInputValue("input_membres");
                const modele = interaction.fields.getTextInputValue("input_modele");
                const plaque = interaction.fields.getTextInputValue("input_plaque");

                const leaderTarget = await getTargetMember(interaction.guild, leaderInput);
                const leaderMention = leaderTarget ? leaderTarget.toString() : leaderInput;

                const timestampDebut = Math.floor(Date.now() / 1000);

                const template = `# PRISE DE PATROUILLE\n\n## MAFIA The Olympius Syndicate\n\n**Date et heure de début :** <t:${timestampDebut}:f> (<t:${timestampDebut}:R>)\n**Date et heure de fin :** *En cours...*\n\n**Plus haut gradé :** ${leaderMention}\n**Membres présents :**\n${membresInput}\n\n**Véhicule :** ${modele} *(Plaque : ${plaque})*\n\n**Status :** 🟢 **Patrouille Active**\n\n**Cordialement,**\n<@&1508046852027842600>`;

                const btnFin = new Discord.ButtonBuilder()
                    .setCustomId("btn_end_patrouille")
                    .setLabel("Fin de patrouille")
                    .setStyle(Discord.ButtonStyle.Danger);

                const row = new Discord.ActionRowBuilder().addComponents(btnFin);

                await interaction.editReply({
                    content: template,
                    components: [row],
                    allowedMentions: { parse: ["users", "roles"] }
                });
            }

            // MODAL PRISE DE RONDE
            else if (interaction.customId === "modal_ronde") {
                const sectionInput = interaction.fields.getTextInputValue("input_section");
                const membresInput = interaction.fields.getTextInputValue("input_membres");

                const timestampDebut = Math.floor(Date.now() / 1000);

                const template = `# PRISE DE RONDE\n\n## MAFIA The Olympius Syndicate\n\n**Date et heure de début :** <t:${timestampDebut}:f> (<t:${timestampDebut}:R>)\n**Date et heure de fin :** *En cours...*\n\n**Section(s) protégée(s) :** ${sectionInput}\n\n**Membres présents :**\n${membresInput}\n\n**Status :** 🟢 **Ronde Active**\n\n**Cordialement,**\n<@&1508046852027842600>`;

                const btnFinRonde = new Discord.ButtonBuilder()
                    .setCustomId("btn_end_ronde")
                    .setLabel("Fin de ronde")
                    .setStyle(Discord.ButtonStyle.Danger);

                const row = new Discord.ActionRowBuilder().addComponents(btnFinRonde);

                await interaction.editReply({
                    content: template,
                    components: [row],
                    allowedMentions: { parse: ["users", "roles"] }
                });
            }
            return;
        }

    } catch (error) {
        console.error("Erreur lors du traitement de l'interaction :", error);
        
        const errorPayload = { 
            content: "❌ Une erreur est survenue lors de l'exécution de cette action.", 
            flags: Discord.MessageFlags.Ephemeral 
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorPayload).catch(() => {});
        } else {
            await interaction.reply(errorPayload).catch(() => {});
        }
    }
};