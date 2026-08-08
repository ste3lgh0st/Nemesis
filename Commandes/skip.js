const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    category: "Musique",
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Passe à la musique suivante'),

    async run(bot, interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ 
                content: '❌ Aucune musique n\'est actuellement jouée.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const currentTrack = queue.currentTrack;
        queue.node.skip();

        return interaction.reply(`⏭️ **${currentTrack.title}** a été passée !`);
    }
};