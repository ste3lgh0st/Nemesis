const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
    name: "resume",
    description: "Reprendre la lecture de la musique",
    category: "Musique",
    dm: false,
    slash: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Reprendre la lecture de la musique"),

    async run(bot, interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue) {
            return interaction.reply({ 
                content: "❌ Aucune musique dans la file d'attente.", 
                flags: MessageFlags.Ephemeral 
            });
        }

        queue.node.setPaused(false);
        return interaction.reply("▶️ Reprise de la musique.");
    }
};