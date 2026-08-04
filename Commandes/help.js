const Discord = require("discord.js");

module.exports = {
    name: "help",
    description: "Affiche la liste de toutes les commandes disponibles du bot",
    permission: Discord.PermissionFlagsBits.SendMessages,
    dm: false,

    async run(bot, interaction) {
        const template = `# GUIDE DES COMMANDES DE GESTION

## MAFIA The Olympius Syndicate

Bienvenue dans le centre de commande de la Direction. Voici l'ensemble des fonctionnalités et commandes disponibles pour la gestion du syndicat :

---

### 👑 **Gestion RP & Hiérarchie**
- \`/promotion\` : Émet une annonce de promotion officielle et met à jour le grade sur Discord et Google Sheet.
- \`/retrogradation\` : Émet une annonce de rétrogradation et ajuste le grade du membre.
- \`/info-membre [membre]\` : Consulte la fiche RP complète d'un membre (grade actuel, sanctions actives, statut d'absence).

---

### ⚠️ **Discipline & Sanctions**
- \`/warn\` *(ou via bouton)* : Attribue un avertissement (Warn 1, 2 ou 3) avec mise à jour du rôle et du registre.
- \`/mise-en-garde\` : Émet un pré-avertissement formel (MEG).
- \`/convocation\` : Convoque un membre avec date, heure et lieu.
- \`/sanction\` : Applique une sanction disciplinaire temporaire.
- \`/mort-rp\` : Enregistre l'exécution et le décès RP d'un membre.
- \`/blacklist\` : Inscrit un individu sur la blacklist officielle et attribue le rôle dédié.

---

### 🟢 **Levée de Sanctions (Un-Sanctions)**
- \`/unwarn [membre] [niveau]\` : Retire un niveau d'avertissement spécifique à un membre.
- \`/unmeg [membre]\` : Retire la Mise en Garde d'un membre.
- \`/unblacklist [membre]\` : Retire un joueur de la blacklist officielle et supprime le rôle.

---

### 📦 **Absences & Inventaire (Boutons / Panneaux)**
- **Panneau d'Absence** : Permet aux membres de soumettre une absence avec enregistrement automatique dans le registre Google Sheet.
- **Gestion des Coffres** : Permet de déclarer un dépôt ou un retrait dans le coffre Lead ou Application.

---

**Cordialement,**
<@1202502660469817394>`;

        await interaction.reply({
            content: template,
            allowedMentions: { parse: ["roles"] },
            flags: Discord.MessageFlags.Ephemeral
        });
    }
};