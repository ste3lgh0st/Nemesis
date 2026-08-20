const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { useMainPlayer } = require("discord-player");

module.exports = {
    name: "play",
    description: "Joue une musique dans un salon vocal",
    category: "Musique",
    dm: false,
    slash: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Joue une musique dans un salon vocal")
        .addStringOption(opt =>
            opt.setName("recherche")
               .setDescription("Nom ou lien de la musique")
               .setRequired(true)
        ),

    async run(bot, interaction) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.reply({ 
                content: "❌ Tu dois être dans un salon vocal !", 
                flags: MessageFlags.Ephemeral 
            });
        }

        const query = interaction.options.getString("recherche");
        await interaction.deferReply();

        try {
            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    metadata: interaction.channel
                }
            });

            return interaction.followUp(`🎶 **${track.title}** a été ajouté à la file !`);
        } catch (e) {
            console.error(e);
            return interaction.followUp(`❌ Impossible de lire cette musique : ${e.message}`);
        }
    }
};