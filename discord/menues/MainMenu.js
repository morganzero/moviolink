const { MessageEmbed, MessageActionRow } = require("discord.js");
const { ButtonComponent } = require("@discordjs/builders");
const db = require("../../db");

/**
 * @param {import('discord.js').User} user
 * @returns {import('discord.js').MessagePayload}
 */
module.exports = (user) => {
  const dbUser = db.find((_user) => _user.discordId == user.id);
  const hasLink = dbUser && dbUser.movioClient;
  const linkButton = [];
  if (!hasLink) {
    linkButton.push(
      new ButtonComponent()
        .setCustomId("linkaccount")
        .setLabel("Link account")
        .setEmoji({ name: "🔗" })
        .setStyle(3)
    );
  }
  return {
    embeds: [
      new MessageEmbed().setTitle(`Welcome to Movio, ${user.username} 👋`)
        .setDescription(`
        I'm ${user.client.user.username} and here to help you with your onboarding.


        ${hasLink ? "" : "🔗 Are you already a customer? Link your account to get tailored help"}

        📋 Unsure what product suits you? Answer some quick questions to figure that out

        ❓ In need of support? Create a ticket!

        📖 Looking for information? Browse our wiki!
      `),
    ],
    components: [
      new MessageActionRow().addComponents([
        ...linkButton,
        new ButtonComponent()
          .setCustomId("helpmepick")
          .setLabel("Help me pick")
          .setEmoji({ name: "📋" })
          .setStyle(3),
        new ButtonComponent()
          .setCustomId("createticket")
          .setLabel("Create a ticket")
          .setEmoji({ name: "❓" })
          .setStyle(3),
        new ButtonComponent()
          .setURL("https://wiki.movio.pro")
          .setLabel("Wiki")
          .setEmoji({ name: "📖" })
          .setStyle(5),
      ]),
    ],
  };
};
