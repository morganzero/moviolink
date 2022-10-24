const whmcs = require("./whmcsAPI");
const config = require("./config");
const db = require("./db");

/**
 * @type {import('discord.js').Client}
 */
let client;
/**
 * @type {import('discord.js').Guild}
 */
let guild;

async function sync() {
  const user = db
    .sort((a, b) =>
      a.nextCheck > b.nextCheck ? 1 : a.nextCheck < b.nextCheck ? -1 : 0
    )
    .find((user) => user.nextCheck < Date.now());
  if (!user) return;
  try {
    const orders = await whmcs.orders.getOrders({
      userid: user.movioClient,
    });
    if (
      orders.orders &&
      orders.orders.order.find((order) =>
        order.lineitems.lineitem
          .map((lineitem) => lineitem.status == "Active")
          .reduce((a, b) => a || b)
      )
    ) {
      console.log(`[${user.discordId}] Active`);
      const member = await guild.members.fetch(user.discordId);
      if (!member.roles.cache.has(config.role))
        await member.roles.add(config.role);
    } else {
      console.log(`[${user.discordId}] Inactive`);
      const member = await guild.members.fetch(user.discordId);
      if (member.roles.cache.has(config.role))
        await member.roles.remove(config.role);
    }
  } catch (_err) {
    console.log(_err);
  }
  user.nextCheck = Date.now() + 1000 * 60 * 5;
}

module.exports = async (_client) => {
  if (client) return;
  if (config.DISABLE_SYNC) return;
  client = _client;
  guild = await client.guilds.fetch(config.guild);
  setInterval(sync, 2500);
};
