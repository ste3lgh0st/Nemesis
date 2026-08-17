const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    name: "pause",
    description: "Met en pause la musique en cours de lecture.",
    category: "Musique",

    async run(bot, interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ 
                content: '❌ Aucune musique en cours de lecture.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        queue.node.setPaused(true);
        return interaction.reply('⏸️ Musique mise en pause.');
    }
};