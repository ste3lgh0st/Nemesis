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
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags 
} = require("discord.js");
async function getTargetMember(guild, input) {
    if (!input || !guild) return null;
    const cleanInput = input.replace(/[<@!>]/g, "").trim();

    if (/^\d{17,19}$/.test(cleanInput)) {
        try {
            return await guild.members.fetch(cleanInput);
        } catch {
        }
    }

    try {
        const members = await guild.members.fetch({ query: cleanInput, limit: 1 });
        return members.first() || null;
    } catch {
        return null;
    }
}

function createCustomModal(customId, title, fields) {
    const modal = new ModalBuilder()
        .setCustomId(customId)
        .setTitle(title);

    const rows = fields.map(field => {
        const input = new TextInputBuilder()
            .setCustomId(field.id)
            .setLabel(field.label)
            .setStyle(field.style || TextInputStyle.Short)
            .setPlaceholder(field.placeholder || "")
            .setRequired(field.required ?? true);

        if (field.value) input.setValue(field.value);

        return new ActionRowBuilder().addComponents(input);
    });

    modal.addComponents(rows);
    return modal;
}

async function updateHierarchyRole(targetMember, gradeInput, hierarchie) {
    if (!targetMember || !gradeInput || !hierarchie?.roles) return gradeInput;

    const nouveauGradeObj = hierarchie.roles.find(
        r => r.nom.toLowerCase() === gradeInput.trim().toLowerCase()
    );

    if (nouveauGradeObj) {
        const idsHierarchie = hierarchie.roles.map(r => r.id);
        const rolesARetirer = targetMember.roles.cache.filter(r => idsHierarchie.includes(r.id));
        
        if (rolesARetirer.size > 0) {
            await targetMember.roles.remove(rolesARetirer).catch(err => 
                console.error("Erreur lors du retrait des anciens rôles hiérarchiques :", err)
            );
        }

        await targetMember.roles.add(nouveauGradeObj.id).catch(err => 
            console.error("Erreur lors de l'ajout du nouveau rôle hiérarchique :", err)
        );

        return `<@&${nouveauGradeObj.id}>`;
    }

    return gradeInput;
}

module.exports = async (client, interaction, dependencies = {}) => {
    const {
        ROLES_WARN = {},
        ROLE_MEG,
        ROLE_CONVOCATION,
        ROLE_MORT_RP,
        ROLE_BLACKLIST,
        hierarchie = { roles: [] },
        envoyerAuGoogleSheet = async () => {},
        envoyerBlacklistAuSheet = async () => {},
        sendHeistToSheets = () => {},
        updateHeistStats,
        sheets,
        SPREADSHEET_ID
    } = dependencies;

    try {
        const emetteurMention = interaction.user.toString();
        const dateFormatted = new Date().toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        if (interaction.isButton()) {
            const { customId } = interaction;


            if (customId.startsWith("btn_warn_") || customId.startsWith("btn_braquage_") || [
                "btn_meg", "btn_convocation", "btn_sanction", 
                "btn_mort_rp", "btn_blacklist", "btn_promotion", 
                "btn_retrogradation", "btn_prime", "btn_patrouille", "btn_ronde"
            ].includes(customId)) {

                let modalId = "";
                let modalTitle = "";
                let fields = [];

                if (customId.startsWith("btn_warn_")) {
                    const level = customId.replace("btn_warn_", "");
                    modalId = `modal_avertissement_${level}`;
                    modalTitle = `Avertissement - Niveau ${level}`;
                    fields = [
                        { id: "input_membre", label: "Membre ciblé (Mention, ID ou Nom)" },
                        { id: "input_motif", label: "Motif de l'avertissement", style: TextInputStyle.Paragraph }
                    ];
                } 
                else if (customId === "btn_meg") {
                    modalId = "modal_mise_en_garde";
                    modalTitle = "Mise en Garde";
                    fields = [
                        { id: "input_membre", label: "Membre ciblé (Mention, ID ou Nom)" },
                        { id: "input_motif", label: "Raison / Rappel à l'ordre", style: TextInputStyle.Paragraph }
                    ];
                }
                else if (customId === "btn_convocation") {
                    modalId = "modal_convocation";
                    modalTitle = "Convocation Officielle";
                    fields = [
                        { id: "input_membre", label: "Membre convoqué" },
                        { id: "input_heure", label: "Heure du rendez-vous" },
                        { id: "input_lieu", label: "Lieu de rendez-vous" },
                        { id: "input_motif", label: "Motif de la convocation", style: TextInputStyle.Paragraph }
                    ];
                }
                else if (customId === "btn_sanction") {
                    modalId = "modal_sanction";
                    modalTitle = "Sanction Disciplinaire";
                    fields = [
                        { id: "input_membre", label: "Membre ciblé" },
                        { id: "input_duree", label: "Durée de la sanction" },
                        { id: "input_motif", label: "Motif de la sanction", style: TextInputStyle.Paragraph }
                    ];
                }
                else if (customId === "btn_mort_rp") {
                    modalId = "modal_mort_rp";
                    modalTitle = "Exécution Officielle (Mort RP)";
                    fields = [
                        { id: "input_membre", label: "Membre exécuté" },
                        { id: "input_date_heure", label: "Date et heure du décès", value: `${dateFormatted} à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` },
                        { id: "input_motif", label: "Motif de l'exécution", style: TextInputStyle.Paragraph }
                    ];
                }
                else if (customId === "btn_blacklist") {
                    modalId = "modal_blacklist";
                    modalTitle = "Inscription Blacklist";
                    fields = [
                        { id: "input_membre", label: "Personne ciblée" },
                        { id: "input_duree", label: "Durée (Permanente / Durée précise)" },
                        { id: "input_motif", label: "Motif du blacklist", style: TextInputStyle.Paragraph }
                    ];
                }
                else if (customId === "btn_promotion") {
                    modalId = "modal_promotion";
                    modalTitle = "Promotion d'un Membre";
                    fields = [
                        { id: "input_membre", label: "Membre promu" },
                        { id: "input_grade", label: "Nouveau Grade attribué" },
                        { id: "input_motif", label: "Motif de la promotion", style: TextInputStyle.Paragraph }
                    ];
                }
                else if (customId === "btn_retrogradation") {
                    modalId = "modal_retrogradation";
                    modalTitle = "Rétrogradation d'un Membre";
                    fields = [
                        { id: "input_membre", label: "Membre rétrogradé" },
                        { id: "input_grade", label: "Nouveau Grade (inférieur)" },
                        { id: "input_motif", label: "Motif de la rétrogradation", style: TextInputStyle.Paragraph }
                    ];
                }
                else if (customId === "btn_prime") {
                    modalId = "modal_prime";
                    modalTitle = "Attribution d'une Prime";
                    fields = [
                        { id: "input_membre", label: "Membre récompensé" },
                        { id: "input_motif", label: "Raison de la récompense", style: TextInputStyle.Paragraph }
                    ];
                }
                else if (customId.startsWith("btn_braquage_")) {
                    const type = customId.replace("btn_braquage_", "");
                    modalId = `modal_braquage_${type}`;
                    modalTitle = `Rapport - Braquage ${type.toUpperCase()}`;
                    fields = [
                        { id: "input_braqueurs", label: "Braqueurs (séparés par une virgule)" },
                        { id: "input_otages", label: "Nombre d'otages" },
                        { id: "input_lieu", label: "Lieu de l'intervention" },
                        { id: "input_autorisation", label: "Accordé par (Mention/Nom)" },
                        { id: "input_gain_et_coffre", label: "Gain obtenu | Coffre (ex: 50000$ | Oui)" }
                    ];
                }
                else if (customId === "btn_patrouille") {
                    modalId = "modal_patrouille";
                    modalTitle = "Prise de Patrouille";
                    fields = [
                        { id: "input_leader", label: "Plus haut gradé présent" },
                        { id: "input_membres", label: "Membres présents", style: TextInputStyle.Paragraph },
                        { id: "input_modele", label: "Modèle du véhicule" },
                        { id: "input_plaque", label: "Immatriculation (Plaque)" }
                    ];
                }
                else if (customId === "btn_ronde") {
                    modalId = "modal_ronde";
                    modalTitle = "Prise de Ronde";
                    fields = [
                        { id: "input_section", label: "Section(s) à surveiller" },
                        { id: "input_membres", label: "Membres présents", style: TextInputStyle.Paragraph }
                    ];
                }

                return await interaction.showModal(createCustomModal(modalId, modalTitle, fields));
            }

            if (customId === "btn_end_patrouille") {
                const timestampFin = Math.floor(Date.now() / 1000);
                let content = interaction.message.content;

                content = content.replace("**Date et heure de fin :** *En cours...*", `**Date et heure de fin :** <t:${timestampFin}:f> (<t:${timestampFin}:R>)`);
                content = content.replace("🟢 **Patrouille Active**", "🔴 **Patrouille Terminée**");

                return await interaction.update({ content, components: [] });
            }

            if (customId === "btn_end_ronde") {
                const timestampFin = Math.floor(Date.now() / 1000);
                let content = interaction.message.content;

                content = content.replace("**Date et heure de fin :** *En cours...*", `**Date et heure de fin :** <t:${timestampFin}:f> (<t:${timestampFin}:R>)`);
                content = content.replace("🟢 **Ronde Active**", "🔴 **Ronde Terminée**");

                return await interaction.update({ content, components: [] });
            }
        }

        if (interaction.isModalSubmit()) {
            await interaction.deferReply();

            if (interaction.customId.startsWith("modal_avertissement_")) {
                const level = interaction.customId.replace("modal_avertissement_", "");
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                if (targetMember && ROLES_WARN[level]) {
                    await targetMember.roles.add(ROLES_WARN[level]).catch(err => console.error("Erreur ajout rôle warn :", err));
                }

                const intituleSanction = level === "1" ? "1er avertissement" : level === "2" ? "2ème avertissement" : "Dernier avertissement";
                envoyerAuGoogleSheet(nomCible, { sanctionIntitule: intituleSanction }).catch(err => console.error("Erreur Sheet Warn :", err));

                const decisionTexte = [
                    `${level === "1" ? "☒" : "☐"} Premier avertissement`,
                    `${level === "2" ? "☒" : "☐"} Deuxième avertissement`,
                    `${level === "3" ? "☒" : "☐"} Dernier avertissement avant sanction`
                ].join("\n");

                const template = `# AVERTISSEMENT \n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\nAu sein de cette Famille, chaque décision est prise avec réflexion. Aujourd'hui, nous choisissons de vous laisser une occasion de prouver votre valeur.\n\nConsidérez cette décision comme une faveur, non comme une faiblesse.\n\nLe moindre nouvel écart entraînera des mesures plus severe.\n\n**Décision :**\n${decisionTexte}\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }


            if (interaction.customId === "modal_mise_en_garde") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                if (targetMember && ROLE_MEG) {
                    await targetMember.roles.add(ROLE_MEG).catch(err => console.error("Erreur ajout rôle MEG :", err));
                }

                envoyerAuGoogleSheet(nomCible, { sanctionIntitule: "Mise en garde" }).catch(err => console.error("Erreur Sheet MEG :", err));

                const template = `# MISE EN GARDE \n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Raison / Rappel :**\n${motif}\n\nLa discipline est le pilier de notre Famille. Ceci est un pré-avertissement formel afin de vous rappeler les règles de The Olympius Syndicate.\n\nPrenez ce rappel au sérieux pour éviter tout avertissement officiel (warn) ou sanction plus lourde.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            if (interaction.customId === "modal_convocation") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const heure = interaction.fields.getTextInputValue("input_heure");
                const lieu = interaction.fields.getTextInputValue("input_lieu");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                if (targetMember && ROLE_CONVOCATION) {
                    await targetMember.roles.add(ROLE_CONVOCATION).catch(err => console.error("Erreur ajout rôle convocation :", err));
                }

                envoyerAuGoogleSheet(nomCible, { sanctionIntitule: "Convoqué" }).catch(err => console.error("Erreur Sheet Convocation :", err));

                const template = `# CONVOCATION\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Convoqué par :** ${emetteurMention}\n\n**Date de la convocation :** ${dateFormatted}\n\n**Heure :** ${heure}\n\n**Lieu :** ${lieu}\n\n**Motif :**\n${motif}\n\nLa Direction de **The Olympius Syndicate** exige votre présence.\n\nVotre présence est obligatoire.\n\nToute absence injustifiée sera interprétée comme un manque de respect envers la Famille.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            if (interaction.customId === "modal_sanction") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const duree = interaction.fields.getTextInputValue("input_duree");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                envoyerAuGoogleSheet(nomCible, { sanctionIntitule: `Sanction (${duree})` }).catch(err => console.error("Erreur Sheet Sanction :", err));

                const template = `# SANCTION DISCIPLINAIRE\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\n**Durée de la sanction :**\n${duree}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu son jugement.\n\nVos actes ont porté atteinte à la discipline et à l'honneur de notre Famille.\n\nLa sanction prend effet immédiatement pour la durée indiquée ci-dessus.\n\nRespectez cette décision et montrez que vous méritez encore votre place parmi nous.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            if (interaction.customId === "modal_mort_rp") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                let dateHeure = "";
                try {
                    dateHeure = interaction.fields.getTextInputValue("input_date_heure");
                } catch {
                    dateHeure = interaction.fields.getTextInputValue("input_date");
                }
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                if (targetMember && ROLE_MORT_RP) {
                    await targetMember.roles.add(ROLE_MORT_RP).catch(err => console.error("Erreur ajout rôle Mort RP :", err));
                }

                envoyerAuGoogleSheet(nomCible, { sanctionIntitule: "Mort RP" }).catch(err => console.error("Erreur Sheet Mort RP :", err));

                const template = `# ÉXÉCUTION OFFICIELLE\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Exécuté par :** ${emetteurMention}\n\n**Date et Heure du décès :** ${dateHeure}\n\n**Motif :**\n${motif}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu son jugement.\n\nVos actes ont porté atteinte à la discipline et à l'honneur de notre Famille.\n\nQue la mort de notre membre serve d'exemple aux autres.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            if (interaction.customId === "modal_blacklist") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const dureeInput = interaction.fields.getTextInputValue("input_duree").trim();
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;
                const lienDiscord = targetMember ? `https://discord.com/users/${targetMember.id}` : membreInput;

                if (targetMember && ROLE_BLACKLIST) {
                    await targetMember.roles.add(ROLE_BLACKLIST).catch(err => console.error("Erreur ajout rôle blacklist :", err));
                }

                envoyerBlacklistAuSheet({
                    nomPrenom: nomCible,
                    duree: dureeInput,
                    date: dateFormatted,
                    lienDiscord: lienDiscord,
                    raison: motif
                }).catch(err => console.error("Erreur Sheet Blacklist :", err));

                const isPerm = ["permanente", "perm", "indéterminée"].includes(dureeInput.toLowerCase());
                const dureeTexte = isPerm 
                    ? "☒ Indéterminée / Permanente\n☐ Temporaire :"
                    : `☐ Permanente\n☒ Temporaire : ${dureeInput}`;

                const template = `# BLACKLIST\n\n## MAFIA The Olympius Syndicate\n\n**Nom de la personne :** ${memberMention}\n\n**Inscription décidée par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\n**Durée :**\n${dureeTexte}\n\nPar décision de la Direction, vous êtes inscrit sur la **Blacklist officielle de The Olympius Syndicate**.\n\nCette mesure vous interdit toute réintégration ou toute collaboration avec notre Famille pendant la durée indiquée.\n\nLa confiance ne se réclame pas. Elle se mérite.\n\nVotre dossier restera archivé au sein de nos registres.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            if (interaction.customId === "modal_promotion") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const gradeInput = interaction.fields.getTextInputValue("input_grade");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                const gradeAffichage = await updateHierarchyRole(targetMember, gradeInput, hierarchie);

                envoyerAuGoogleSheet(nomCible, { 
                    grade: gradeInput || "Recrue", 
                    sanctionIntitule: `Promotion : ${gradeInput || "Nouveau Grade"}` 
                }).catch(err => console.error("Erreur Sheet Promotion :", err));

                const template = `# PROMOTION\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Nouveau Grade :** ${gradeAffichage}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu sa décision.\n\nVos actions ont fait honneur à notre Famille.\n\nVotre fidélité nous prouve aujourd'hui que vous êtes capable du meilleur.\n\nHonorez cette promotion et continuez à vous montrer digne de votre place parmi nous.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            if (interaction.customId === "modal_retrogradation") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const gradeInput = interaction.fields.getTextInputValue("input_grade");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;
                const nomCible = targetMember ? (targetMember.displayName || targetMember.user.username) : membreInput;

                const gradeAffichage = await updateHierarchyRole(targetMember, gradeInput, hierarchie);

                envoyerAuGoogleSheet(nomCible, { 
                    grade: gradeInput || "Recrue", 
                    sanctionIntitule: `Rétrogradation : ${gradeInput || "Ancien Grade"}` 
                }).catch(err => console.error("Erreur Sheet Rétrogradation :", err));

                const template = `# RÉTROGRADATION\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Nouveau Grade :** ${gradeAffichage}\n\n**Émis par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\nAprès délibération, la Direction de **The Olympius Syndicate** a rendu sa décision.\n\nVos récents agissements et vos erreurs ne correspondent plus aux exigences de votre rang.\n\nCette rétrogradation est un rappel à l'ordre formel. À vous de faire vos preuves à nouveau si vous souhaitez regagner la confiance de la Famille.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

            if (interaction.customId === "modal_prime") {
                const membreInput = interaction.fields.getTextInputValue("input_membre");
                const motif = interaction.fields.getTextInputValue("input_motif");

                const targetMember = await getTargetMember(interaction.guild, membreInput);
                const memberMention = targetMember ? targetMember.toString() : membreInput;

                const template = `# PRIME DE RÉCOMPENSE\n\n## MAFIA The Olympius Syndicate\n\n**Nom du membre :** ${memberMention}\n\n**Accordée par :** ${emetteurMention}\n\n**Date :** ${dateFormatted}\n\n**Motif :**\n${motif}\n\nLa Direction de **The Olympius Syndicate** tient à saluer vos récents efforts.\n\nVos services et votre loyauté envers la Famille méritent d'être récompensés à leur juste valeur.\n\nContinuez sur cette voie.\n\n**Cordialement,**\n<@&1508046852027842600>`;

                return await interaction.editReply({ content: template, allowedMentions: { parse: ["users", "roles", "everyone"] } });
            }

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

                if (typeof updateHeistStats === 'function' && sheets && SPREADSHEET_ID) {
                    await updateHeistStats(sheets, SPREADSHEET_ID, braqueursMembres, typeBraquage);
                }

                sendHeistToSheets(typeBraquage, braqueursFormates);

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

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorPayload).catch(() => {});
        } else {
            await interaction.reply(errorPayload).catch(() => {});
        }
    }
};