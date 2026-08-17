const { EmbedBuilder } = require("discord.js");

module.exports = (bot) => {

    // Helper pour récupérer le salon de logs configuré pour ce serveur
    function getLogChannel(guild) {
        if (!guild || !bot.db) return null;
        const channelId = bot.db.get(`logs_${guild.id}`);
        if (!channelId) return null; // Désactivé si aucun salon configuré
        return guild.channels.cache.get(channelId) || null;
    }

    async function sendLog(guild, embed) {
        const channel = getLogChannel(guild);
        if (channel) {
            await channel.send({ embeds: [embed] }).catch(() => {});
        }
    }

    // =========================================================
    // 1. MESSAGES
    // =========================================================

    // Message Supprimé
    bot.on("messageDelete", async (message) => {
        if (!message.guild || message.author?.bot) return;

        const embed = new EmbedBuilder()
            .setColor("#e74c3c")
            .setTitle("🗑️ Message supprimé")
            .addFields(
                { name: "Auteur", value: `${message.author} (\`${message.author.id}\`)`, inline: true },
                { name: "Salon", value: `${message.channel}`, inline: true },
                { name: "Contenu", value: message.content ? message.content.substring(0, 1024) : "*Aucun contenu texte (image ou embed)*" }
            )
            .setTimestamp()
            .setFooter({ text: `ID Message : ${message.id}` });

        await sendLog(message.guild, embed);
    });

    // Message Modifié
    bot.on("messageUpdate", async (oldMessage, newMessage) => {
        if (!oldMessage.guild || oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        const embed = new EmbedBuilder()
            .setColor("#f1c40f")
            .setTitle("✏️ Message modifié")
            .addFields(
                { name: "Auteur", value: `${oldMessage.author} (\`${oldMessage.author.id}\`)`, inline: true },
                { name: "Salon", value: `${oldMessage.channel}`, inline: true },
                { name: "Ancien contenu", value: oldMessage.content ? oldMessage.content.substring(0, 1024) : "*Inconnu*" },
                { name: "Nouveau contenu", value: newMessage.content ? newMessage.content.substring(0, 1024) : "*Inconnu*" }
            )
            .setTimestamp();

        await sendLog(oldMessage.guild, embed);
    });

    // =========================================================
    // 2. MEMBRES ET RÔLES
    // =========================================================

    bot.on("guildMemberAdd", async (member) => {
        const embed = new EmbedBuilder()
            .setColor("#2ecc71")
            .setTitle("📥 Membre rejoint")
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: "Membre", value: `${member} (\`${member.id}\`)` },
                { name: "Compte créé le", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` }
            )
            .setTimestamp();

        await sendLog(member.guild, embed);
    });

    bot.on("guildMemberRemove", async (member) => {
        const embed = new EmbedBuilder()
            .setColor("#95a5a6")
            .setTitle("📤 Membre quitté")
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: "Membre", value: `${member.user.tag} (\`${member.id}\`)` },
                { name: "Rejoint le", value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "*Inconnu*" }
            )
            .setTimestamp();

        await sendLog(member.guild, embed);
    });

    bot.on("guildMemberUpdate", async (oldMember, newMember) => {
        if (oldMember.nickname !== newMember.nickname) {
            const embed = new EmbedBuilder()
                .setColor("#3498db")
                .setTitle("🏷️ Changement de pseudo")
                .addFields(
                    { name: "Membre", value: `${newMember}` },
                    { name: "Ancien pseudo", value: oldMember.nickname || oldMember.user.username, inline: true },
                    { name: "Nouveau pseudo", value: newMember.nickname || newMember.user.username, inline: true }
                )
                .setTimestamp();

            await sendLog(newMember.guild, embed);
        }

        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        if (addedRoles.size > 0) {
            const embed = new EmbedBuilder()
                .setColor("#2ecc71")
                .setTitle("➕ Rôle ajouté")
                .addFields(
                    { name: "Membre", value: `${newMember}` },
                    { name: "Rôle(s) ajouté(s)", value: addedRoles.map(r => r.toString()).join(", ") }
                )
                .setTimestamp();

            await sendLog(newMember.guild, embed);
        }

        if (removedRoles.size > 0) {
            const embed = new EmbedBuilder()
                .setColor("#e74c3c")
                .setTitle("➖ Rôle retiré")
                .addFields(
                    { name: "Membre", value: `${newMember}` },
                    { name: "Rôle(s) retiré(s)", value: removedRoles.map(r => r.toString()).join(", ") }
                )
                .setTimestamp();

            await sendLog(newMember.guild, embed);
        }
    });

    // =========================================================
    // 3. VOCAL
    // =========================================================

    bot.on("voiceStateUpdate", async (oldState, newState) => {
        const guild = newState.guild || oldState.guild;
        const member = newState.member || oldState.member;

        if (!oldState.channelId && newState.channelId) {
            const embed = new EmbedBuilder()
                .setColor("#2ecc71")
                .setTitle("🔊 Connexion Vocale")
                .addFields(
                    { name: "Membre", value: `${member}` },
                    { name: "Salon", value: `<#${newState.channelId}>` }
                )
                .setTimestamp();

            await sendLog(guild, embed);
        }

        if (oldState.channelId && !newState.channelId) {
            const embed = new EmbedBuilder()
                .setColor("#e74c3c")
                .setTitle("🔇 Déconnexion Vocale")
                .addFields(
                    { name: "Membre", value: `${member}` },
                    { name: "Salon quitté", value: `<#${oldState.channelId}>` }
                )
                .setTimestamp();

            await sendLog(guild, embed);
        }

        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            const embed = new EmbedBuilder()
                .setColor("#3498db")
                .setTitle("🔀 Déplacement Vocal")
                .addFields(
                    { name: "Membre", value: `${member}` },
                    { name: "De", value: `<#${oldState.channelId}>`, inline: true },
                    { name: "Vers", value: `<#${newState.channelId}>`, inline: true }
                )
                .setTimestamp();

            await sendLog(guild, embed);
        }
    });

    // =========================================================
    // 4. MODÉRATION
    // =========================================================

    bot.on("guildBanAdd", async (ban) => {
        const embed = new EmbedBuilder()
            .setColor("#8e44ad")
            .setTitle("🔨 Membre Banni")
            .addFields(
                { name: "Membre", value: `${ban.user.tag} (\`${ban.user.id}\`)` },
                { name: "Raison", value: ban.reason || "Aucune raison fournie" }
            )
            .setTimestamp();

        await sendLog(ban.guild, embed);
    });

    bot.on("guildBanRemove", async (ban) => {
        const embed = new EmbedBuilder()
            .setColor("#2ecc71")
            .setTitle("🔓 Membre Débanni")
            .addFields(
                { name: "Membre", value: `${ban.user.tag} (\`${ban.user.id}\`)` }
            )
            .setTimestamp();

        await sendLog(ban.guild, embed);
    });
};