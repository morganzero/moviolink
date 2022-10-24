const { MessageEmbed } = require("discord.js");
const { SUPPORT_ROLE, kronosKey } = require("../../config");

const Kronos = require("../../kronos");
const kronos = new Kronos(kronosKey);

module.exports = {
  /**
   * @param {import('discord.js').CommandInteraction} interaction
   */
  async execute(interaction) {
    const user = interaction.options.getUser("receiver", false);
    const inviteKey = await kronos.Admin.InviteKeys.generate();
    const messageContent = {
      embeds: [
        new MessageEmbed()
          .setTitle("You've got an invite to Movio")
          .setDescription("Click on the invitation URL below start your order")
          .addField(
            "Your personal invite key",
            `https://dash.movio.pro/app/accept-invite/${inviteKey.key.key}/create-account`
          ),
      ],
    };
    if (user) {
      try {
        await user.send(messageContent);
        await interaction.reply({
          ephemeral: true,
          content: "Personal invite has been sent!",
        });
      } catch (err) {
        await interaction.reply("Unable to send personal invite");
      }
    } else {
      interaction.reply(messageContent);
    }
  },
};
