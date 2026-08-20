const Discord = require("discord.js");
const cron = require("node-cron");

const CHANNEL_ID = "1529063456764854282";
const MESSAGE_CONSEIL = `Bonjour <@&1472563147834392718>,\n\nLe conseil aura lieu à **21h00.** \n\nToute personne **présente** au conseil devra rester disponible suite à celui-ci.\nIl est **inutile** d'y assister si vous n'avez pas l'intention de rester par la suite.\nLes informations de la soirée y seront partagées. Si vous en avez, vous êtes évidemment autorisés, __sans couper la parole de quiconque__, à tenir informer les membres présent au conseil de votre information. \n\nFréquence radio actuelle : **11.44**`;

module.exports = {
    name: "setmsgconseil",
    description: "Active ou désactive le message du conseil automatique de 16h",
    category: "Administration",
    permission: Discord.PermissionFlagsBits.Administrator,
    dm: false,
    slash: new Discord.SlashCommandBuilder()
        .setName("setmsgconseil")
        .setDescription("Active ou désactive le message du conseil automatique de 16h")
        .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator)
        .addBooleanOption(opt =>
            opt.setName("etat")
               .setDescription("True pour activer, False pour désactiver")
               .setRequired(true)
        ),

    initCron(bot) {
        cron.schedule("0 16 * * *", async () => {
            if (!bot.autoMsgEnabled) return;

            try {
                const channel = await bot.channels.fetch(CHANNEL_ID);
                if (channel) {
                    await channel.send({ content: MESSAGE_CONSEIL });
                    console.log("✅ Message de conseil envoyé avec succès.");
                }
            } catch (error) {
                console.error("❌ Erreur lors de l'envoi du message de conseil :", error);
            }
        }, {
            timezone: "Europe/Paris"
        });
    },

    async run(bot, interaction) {
        const etat = interaction.options.getBoolean("etat");
        bot.autoMsgEnabled = etat;

        const statutText = etat ? "**activé**" : "**désactivé**";
        await interaction.reply({ 
            content: `Le message automatique de 16h a été ${statutText}.`, 
            flags: Discord.MessageFlags.Ephemeral 
        });
    }
};