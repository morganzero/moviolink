const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { DISCORD_TOKEN } = require("./config");

const commands = [
  new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link your movio account!"),
  new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Link your movio account!")
    .addStringOption((option) =>
      option.setName("input").setDescription("Debug")
    )
    .setDefaultPermission(false),
  new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Generate an invite")
    .addUserOption((option) =>
      option.setDescription("User to DM").setName("receiver").setRequired(false)
    )
    .setDefaultPermission(false),
  new SlashCommandBuilder()
    .setName("account")
    .setDescription("Get information about your Movio account"),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(DISCORD_TOKEN);

rest
  .put(
    Routes.applicationCommands(
      Buffer.from(DISCORD_TOKEN.split(".")[0], "base64").toString()
    ),
    { body: commands }
  )
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
