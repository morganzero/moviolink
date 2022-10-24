const { Client, Intents } = require("discord.js");

const axios = require("axios").default;
const FormData = require("form-data");
const WHMCS = require("./whmcsAPI");
const jwt = require("jsonwebtoken");
const express = require("express");
const config = require("./config");
const { client_id, client_secret } = {
  client_id: config.whmcs.client_id,
  client_secret: config.whmcs.client_secret,
};
const path = require("path");
const util = require("util");
const db = require("./db");

const app = express();
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
  ws: {
    properties: {
      $browser: "Discord iOS",
    },
  },
});
client.evalContext = { db };

require("./sync")(client);

app.get("/", (req, res) => {
  res.redirect(
    `https://movio.pro/client/oauth/authorize.php?client_id=${
      config.whmcs.client_id
    }&redirect_uri=https://${
      req.hostname
    }/callback&response_type=code&scope=openid%20profile%20email&state=${encodeURIComponent(
      req.hostname + " " + req.query.key
    )}`
  );
});

app.get(
  "/callback",
  (req, _res, next) => {
    jwt.verify(req.query.state.split(" ")[1], "u57CtRCXQkB6g4");
    next();
  },
  async (req, res) => {
    const key = jwt.verify(req.query.state.split(" ")[1], "u57CtRCXQkB6g4");
    if (!req.query.code) {
      res.status(400).json({
        success: false,
        message: "Missing `code` query",
      });
      return;
    }
    const jsonData = {
      grant_type: "authorization_code",
      client_id,
      client_secret,
      redirect_uri: `https://${
        decodeURIComponent(req.query.state).split(" ")[0]
      }/callback`,
      code: req.query.code,
    };
    const data = new FormData();
    for (let key in jsonData) {
      data.append(key, jsonData[key]);
    }
    const response = await axios({
      method: "POST",
      url: "https://movio.pro/client/oauth/token.php",
      data,
      headers: {
        ...data.getHeaders(),
      },
    }).catch((err) => {
      if (
        err &&
        err.response &&
        err.response.data &&
        typeof err.response.data == "object"
      ) {
        res.json({
          success: false,
          message:
            err.response.data.error_description ||
            err.response.data.error ||
            err.response.data.message ||
            "An unknown error has occured",
        });
      } else {
        res.json({
          success: false,
          message: "An unknown error has occured",
        });
        console.error(err);
      }
    });
    if (!response) return;
    console.log(response.data);
    const userData = await axios({
      method: "GET",
      url:
        "https://movio.pro/client/oauth/userinfo.php?access_token=" +
        response.data.access_token,
    }).catch((err) => {
      res.json({
        success: false,
        message: "Unable to retrieve user data",
      });
      console.error(err);
    });
    if (!userData) return;
    const clientDetails = await WHMCS.client
      .getClientsDetails({
        email: userData.data.email,
      })
      .catch((err) => {
        res.json({
          success: false,
          message: "Unable to fetch user details",
        });
        console.error(err);
      });
    if (!clientDetails) return;
    console.log(clientDetails);
    const user = db.find((user) => user.discordId == key.discordId);
    if (user) {
      user.nextCheck = 0;
      user.movioClient = clientDetails.client_id;
    } else {
      db.push({
        discordId: key.discordId,
        movioClient: clientDetails.client_id,
        nextCheck: 0,
      });
    }
    res.json("Your account has been linked successfully!");
  }
);

client.once("ready", async () => {
  if (!client.application.owner) await client.application.fetch();
  try {
    const command = (await client.application.commands.fetch()).find(
      (command) => command.name == "admin"
    );
    for (let i = 0; i < client.guilds.cache.size; i++) {
      await command.permissions.set({
        guild: client.guilds.cache.at(i),
        permissions: config.superusers.map((user) => ({
          id: user,
          type: "USER",
          permission: true,
        })),
      });
    }
  } catch (err) {}
  try {
    const command = (await client.application.commands.fetch()).find(
      (command) => command.name == "invite"
    );
    for (let i = 0; i < client.guilds.cache.size; i++) {
      await command.permissions.set({
        guild: client.guilds.cache.at(i),
        permissions: [
          {
            id: config.role,
            type: "ROLE",
            permission: true,
          },
        ],
      });
    }
  } catch (err) {}
  console.log("Ready!");
});

const fs = require("fs");
client.evalContext.eventHandlers = [];
fs.readdirSync(path.join(__dirname, "discord/events")).forEach((name) => {
  try {
    const event = require(path.join(__dirname, "discord/events", name));
    client.on(event.eventName, event.handler);
    client.evalContext.eventHandlers.push(event);
  } catch (err) {
    console.log(err);
  }
});
client.evalContext.eventHandlers.emit = function (name, ...args) {
  client.evalContext.eventHandlers
    .find((event) => event.eventName == name)
    .handler(...args);
};
client.evalContext.emit = client.evalContext.eventHandlers.emit;

const interactions = fs
  .readdirSync(path.join(__dirname, "discord/interactions"))
  .map((name) => {
    try {
      const interaction = require(path.join(
        __dirname,
        "discord/interactions",
        name
      ));
      return {
        type: interaction.type,
        customId: interaction.customId,
        execute: interaction.execute,
      };
    } catch (err) {
      console.log(err);
    }
  });

const commands = fs
  .readdirSync(path.join(__dirname, "discord/commands"))
  .map((name) => {
    try {
      const command = require(path.join(__dirname, "discord/commands", name));
      return {
        name: name.split(".")[0],
        execute: command.execute,
      };
    } catch (err) {
      console.log(err);
    }
  })
  .filter((a) => a);

console.log(commands);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  const button = interactions.find(
    (_interaction) =>
      (_interaction.customId == interaction.customId ||
        _interaction.customId == interaction.customId.split(".")[0]) &&
      _interaction.type == "button"
  );
  if (!button) return;
  button.execute(interaction);
});

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = commands.find((cmd) => cmd.name === interaction.commandName);
  if (!command) {
    await interaction.reply({
      ephemeral: true,
      content: "Unsure how to handle this command",
    });
    return;
  }
  const timeBefore = Date.now();
  Promise.resolve(command.execute(interaction)).finally(() => {
    console.log(`[${command.name}] took ${Date.now() - timeBefore}ms`);
  });
});

client.login(config.DISCORD_TOKEN);

app.listen(process.env.SERVER_PORT || 58572);
