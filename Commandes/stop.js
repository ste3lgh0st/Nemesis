const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    category: "Musique",
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Arrête la musique et vide la file'),

    async run(bot, interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue) {
            return interaction.reply({ 
                content: '❌ Le bot n\'est pas en train de jouer dans ce serveur.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        queue.delete();
        return interaction.reply('⏹️ Musique arrêtée et file d\'attente vidée !');
    }
};