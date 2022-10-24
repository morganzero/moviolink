const MainMenu = require("../menues/MainMenu");

module.exports = {
  eventName: "guildMemberAdd",
  /**
   * @param {import('discord.js').GuildMember} member
   */
  async handler(member) {
    const dmChannel = await member.createDM();
    await dmChannel.send(MainMenu(member));
  },
};
