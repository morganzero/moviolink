const { ButtonComponent } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow } = require("discord.js");
const { formatMessage } = require("../../utils");

module.exports = {
  type: "button",
  customId: "newcustomer",
  /**
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async execute(interaction) {
    interaction.update({
      embeds: [
        new MessageEmbed().setTitle("Welcome!").setDescription(
          formatMessage(`
            We're glad to have you here!

            📋 Unsure what product suits you? Answer some quick questions to figure that out
            📖 Need help? Check out our wiki
          `)
        ),
      ],
      components: [
        new MessageActionRow().addComponents([
          new ButtonComponent()
            .setCustomId("helpmepick")
            .setLabel("Help me pick")
            .setEmoji({ name: "📋" })
            .setStyle(3),
          new ButtonComponent()
            .setURL("https://wiki.movio.pro")
            .setLabel("Wiki")
            .setEmoji({ name: "📖" })
            .setStyle(5),
        ]),
      ],
    });
  },
};
