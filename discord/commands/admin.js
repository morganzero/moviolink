const { MessageEmbed } = require("discord.js");
const { superusers, kronosKey } = require("../../config");
const util = require("util");
const Kronos = require("../../kronos");
const kronos = new Kronos(kronosKey);
const whmcs = require("../../whmcsAPI");

function evaluate(code, args) {
  return function evaluateEval() {
    const argsStr = Object.keys(args)
      .map((key) => `${key} = this.${key}`)
      .join(",");
    const argsDef = argsStr ? `let ${argsStr};` : "";

    return eval(`${argsDef}${code}`);
  }.call(args);
}

module.exports = {
  /**
   * @param {import('discord.js').CommandInteraction} interaction
   */
  async execute(interaction) {
    if (!superusers.includes(interaction.user.id)) return;
    await interaction.deferReply();
    try {
      const response = await evaluate(interaction.options.getString("input"), {
        ...interaction.client.evalContext,
        interaction,
        kronos,
        whmcs,
      });
      await interaction.editReply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setTitle("Result")
            .setColor("GREEN")
            .setDescription(
              `\`\`\`js\n${util
                .inspect(response, { maxArrayLength: 3 })
                .trim()
                .substring(0, 1900)}\n\`\`\``
            )
            .setFooter({ text: "Admin debug" }),
        ],
      });
    } catch (err) {
      await interaction.editReply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setTitle("Error")
            .setColor("RED")
            .setDescription(
              `\`\`\`js\n${util
                .inspect(err, { maxArrayLength: 5 })
                .trim()
                .substring(0, 1900)}\n\`\`\``
            )
            .setFooter({ text: "Admin debug" }),
        ],
      });
    }
  },
};
