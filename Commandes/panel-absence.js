const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "panel-absence",
  description: "Affiche le bouton pour poser une absence",
  permission: PermissionFlagsBits.ManageMessages,
  dm: false,

  async run(bot, message) {
    if (message.deletable) {
      await message.delete().catch(() => {});
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_absence")
        .setLabel("Poser une absence")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("📅")
    );

    await message.channel.send({
      content: "Cliquez sur le bouton ci-dessous pour déclarer une absence :",
      components: [row]
    });
  }
};