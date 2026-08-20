const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");
const { exec } = require("child_process");

const OWNER_ID = "1202502660469817394"; 

module.exports = {
    name: "push",
    description: "Effectue un git add, commit, push et redémarre le bot",
    category: "Owner",
    dm: false,
    slash: new SlashCommandBuilder()
        .setName("push")
        .setDescription("Effectue un git add, commit, push et redémarre le bot")
        .addStringOption(opt =>
            opt.setName("message")
               .setDescription("Message de commit Git")
               .setRequired(false)
        ),

    async run(bot, interaction) {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: "❌ Seul le propriétaire du bot peut utiliser cette commande.",
                flags: MessageFlags.Ephemeral
            });
        }

        const commitMessage = interaction.options.getString("message") || "Update auto via Discord";

        await interaction.reply({ content: "🔄 Exécution du Git Push en cours..." });

        const gitCommand = `git add . && git commit -m "${commitMessage.replace(/"/g, '\\"')}" && git push`;

        exec(gitCommand, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Erreur Git: ${error}`);
                return interaction.editReply({
                    content: `❌ **Erreur lors du Git Push :**\n\`\`\`bash\n${error.message.slice(0, 1000)}\n\`\`\``
                });
            }

            const embedSuccess = new EmbedBuilder()
                .setColor("#57F287")
                .setTitle("✅ Git Push Réussi !")
                .addFields(
                    { name: "Message de commit", value: commitMessage },
                    { name: "Console Git", value: `\`\`\`bash\n${(stdout || stderr || "Succès").slice(0, 1000)}\n\`\`\`` }
                )
                .setFooter({ text: "Redémarrage du bot en cours..." });

            await interaction.editReply({ content: null, embeds: [embedSuccess] });

            setTimeout(() => {
                console.log("Redémarrage demandé via /push...");
                process.exit(0);
            }, 2000);
        });
    }
};