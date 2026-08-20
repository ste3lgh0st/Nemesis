const { EmbedBuilder, Events } = require("discord.js");

module.exports = (bot) => {

    // Helper pour récupérer le salon de logs configuré
    function getLogChannel(guild) {
        if (!guild || !bot.db) return null;
        const channelId = bot.db.get(`logs_${guild.id}`);
        if (!channelId) return null;
        return guild.channels.cache.get(channelId) || null;
    }

    // Helper pour envoyer le log en toute sécurité
    async function sendLog(guild, embed) {
        const channel = getLogChannel(guild);
        if (channel) {
            await channel.send({ 
                embeds: [embed],
                allowedMentions: { parse: [] } // Évite tout ping involontaire dans le salon de logs
            }).catch(() => {});
        }
    }

    // =========================================================
    // 1. MESSAGES
    // =========================================================

    // Message Supprimé
    bot.on(Events.MessageDelete, async (message) => {
        if (message.partial) {
            try {
                await message.fetch();
            } catch {
                // Le message n'a pas pu être récupéré depuis l'API/cache
            }
        }

        if (!message.guild || message.author?.bot) return;

        let content = message.content ? message.content.substring(0, 1024) : null;
        if (!content && message.attachments.size > 0) {
            content = `*📷 [Pièce jointe / Image] (${message.attachments.first()?.url})*`;
        } else if (!content) {
            content = "*Aucun contenu texte (embed ou composant)*";
        }

        const embed = new EmbedBuilder()
            .setColor("#e74c3c")
            .setTitle("🗑️ Message supprimé")
            .addFields(
                { name: "Auteur", value: `${message.author} (\`${message.author.id}\`)`, inline: true },
                { name: "Salon", value: `${message.channel}`, inline: true },
                { name: "Contenu", value: content }
            )
            .setTimestamp()
            .setFooter({ text: `ID Message : ${message.id}` });

        await sendLog(message.guild, embed);
    });

    // Message Modifié
    bot.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
        if (oldMessage.partial) {
            try {
                await oldMessage.fetch();
            } catch {
                return;
            }
        }
        if (newMessage.partial) {
            try {
                await newMessage.fetch();
            } catch {
                return;
            }
        }

        if (!oldMessage.guild || oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        const oldContent = oldMessage.content ? oldMessage.content.substring(0, 1024) : "*Inconnu / Aucun*";
        const newContent = newMessage.content ? newMessage.content.substring(0, 1024) : "*Inconnu / Aucun*";

        const embed = new EmbedBuilder()
            .setColor("#f1c40f")
            .setTitle("✏️ Message modifié")
            .addFields(
                { name: "Auteur", value: `${oldMessage.author} (\`${oldMessage.author.id}\`)`, inline: true },
                { name: "Salon", value: `${oldMessage.channel}`, inline: true },
                { name: "Ancien contenu", value: oldContent },
                { name: "Nouveau contenu", value: newContent }
            )
            .setTimestamp()
            .setFooter({ text: `ID Message : ${newMessage.id}` });

        await sendLog(oldMessage.guild, embed);
    });

    // =========================================================
    // 2. MEMBRES ET RÔLES
    // =========================================================

    // Membre Rejoint
    bot.on(Events.GuildMemberAdd, async (member) => {
        const embed = new EmbedBuilder()
            .setColor("#2ecc71")
            .setTitle("📥 Membre rejoint")
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "Membre", value: `${member} (\`${member.id}\`)` },
                { name: "Compte créé le", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` }
            )
            .setTimestamp();

        await sendLog(member.guild, embed);
    });

    // Membre Quitté
    bot.on(Events.GuildMemberRemove, async (member) => {
        const embed = new EmbedBuilder()
            .setColor("#95a5a6")
            .setTitle("📤 Membre quitté")
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "Membre", value: `${member.user.tag} (\`${member.id}\`)` },
                { name: "Rejoint le", value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "*Inconnu*" }
            )
            .setTimestamp();

        await sendLog(member.guild, embed);
    });

    // Mise à jour Membre (Pseudo / Rôles)
    bot.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
        // Changement de Pseudo
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

        // Ajout / Retrait de rôles
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

    bot.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        const guild = newState.guild || oldState.guild;
        const member = newState.member || oldState.member;

        if (!guild || !member) return;

        // Connexion
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

        // Déconnexion
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

        // Déplacement
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

    bot.on(Events.GuildBanAdd, async (ban) => {
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

    bot.on(Events.GuildBanRemove, async (ban) => {
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