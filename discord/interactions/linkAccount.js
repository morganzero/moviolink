const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const jwt = require("jsonwebtoken");
const { baseurl } = require("../../config.json");

module.exports = {
  type: "button",
  customId: "linkaccount",
  /**
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async execute(interaction) {
    interaction.reply({
      ephemeral: true,
      embeds: [
        new MessageEmbed()
          .setTitle("Do you have a Movio account?")
          .setDescription(
            `Movio account holders have the ability to link their account to Discord
            
            Linking your account allows me and my humans give you the best experience with Movio

            *Link expires <t:${Math.floor(Date.now() / 1000) + 60 * 5}:R>*`
          ),
      ],
      components: [
        new MessageActionRow().addComponents([
          new MessageButton()
            .setURL(
              `${baseurl}/?key=` +
                jwt.sign(
                  {
                    discordId: interaction.user.id,
                    exp: Math.floor(Date.now() / 1000) + 60 * 5,
                  },
                  "u57CtRCXQkB6g4"
                )
            )
            .setLabel("Link account")
            .setEmoji("🔗")
            .setStyle("LINK"),
        ]),
      ],
    });
  },
};
