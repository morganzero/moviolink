const { SUPPORT_ROLE, kronosKey } = require("../../config");
const { formatMessage } = require("../../utils");
const whmcs = require("../../whmcsAPI");
const Kronos = new (require("../../kronos"))(kronosKey);

const linkAccount = require("../interactions/linkAccount");
const db = require("../../db");
const { MessageEmbed } = require("discord.js");

module.exports = {
  /**
   * @param {import('discord.js').CommandInteraction} interaction
   */
  async execute(interaction) {
    const user = db.find((user) => user.discordId == interaction.user.id);
    if (!user || !user.movioClient) return linkAccount.execute(interaction);

    const whmcsUser = await whmcs.client.getClientsDetails({
      clientid: user.movioClient,
    });
    const kronosUser = (
      await Kronos.Admin.Users.search({
        query: user.movioClient,
      })
    ).data.find((kronosUser) => kronosUser.whmcs_id == user.movioClient);
    const kronosServers = await Kronos.Admin.Servers.search({
      query: kronosUser.name,
      perpage: 100,
    });
    await interaction.deferReply();

    interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setTitle("Your account")
          .setDescription(`Active Services: ${kronosServers.meta.total}`)
          .addFields(
            await Promise.all(
              kronosServers.data.map(async (server) => ({
                name: server.display_name,
                value: formatMessage(`
                  ${
                    (await server.status()).status == "running"
                      ? "🟢 Healthy"
                      : "🔴 Unhealthy"
                  }
                  ID: \`${server.id}\`
                  [Dashboard](https://dash.movio.pro/app/dashboard/${server.id})
                `),
                inline: true,
              }))
            )
          ),
      ],
    });
  },
};
