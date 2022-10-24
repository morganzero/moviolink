const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { formatMessage } = require("../../utils");
const whmcs = require("../../whmcsAPI");
const jwt = require("jsonwebtoken");
const { makeMarkdown } = new (require("showdown").Converter)();
const { JSDOM } = require("jsdom");
const db = require("../../db");

global.window = new JSDOM("", {}).window;

module.exports = {
  type: "button",
  customId: "helpmepick",
  /**
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async execute(interaction) {
    console.log(interaction.customId);
    if (interaction.customId == "helpmepick") return start(interaction);

    if (interaction.customId.startsWith("helpmepick.play"))
      return play(interaction);
    if (interaction.customId.startsWith("helpmepick.box"))
      return box(interaction);
    if (interaction.customId.startsWith("helpmepick.kapitel"))
      return kapitel(interaction);

    if (interaction.customId.startsWith("helpmepick.selected"))
      return selection(interaction);

    interaction.reply({
      ephemeral: true,
      content: "This hasn't been implemented yet",
    });
  },
};

const { products } = require("../../config.json");
/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function selection(interaction) {
  const product = products.find(
    (product) =>
      product.movioid == interaction.customId.split(".").slice(2).join(".")
  );
  if (!product) {
    return await interaction.update({
      embeds: [
        new MessageEmbed()
          .setTitle("Something went wrong")
          .setDescription(
            "This one is probably our fault.\nPlease report this to us and we will get it fixed ASAP!"
          )
          .setColor("RED"),
      ],
    });
  }
  const wProduct = (await whmcs.products.getProducts({ pid: product.whmcsID }))
    .products.product[0];
  await interaction.update({
    embeds: [
      new MessageEmbed()
        .setTitle(wProduct.name)
        .setDescription(
          formatMessage(`
          Based on your answers, we believe ${
            wProduct.name
          } is the most suitable option for you!

          ${makeMarkdown(
            wProduct.description
              .split("\r\n")
              .join("")
              .split("\r")
              .join("")
              .split("\n")
              .join("")
          )
            .split("<br>")
            .join("")
            .split("\n\n")
            .join("\n")}

            **Pricing**
            ${
              wProduct.pricing.USD.monthly != "-1.00"
                ? `$${wProduct.pricing.USD.monthly} monthly`
                : ""
            }
            ${
              wProduct.pricing.USD.quarterly != "-1.00"
                ? `$${wProduct.pricing.USD.quarterly} quarterly`
                : ""
            }
            ${
              wProduct.pricing.USD.semiannually != "-1.00"
                ? `$${wProduct.pricing.USD.semiannually} semi-annually`
                : ""
            }
            ${
              wProduct.pricing.USD.annually != "-1.00"
                ? `$${wProduct.pricing.USD.annually} annually`
                : ""
            }
        `)
        )
        .setColor("#aa00dd"),
    ],
    components: [],
  });
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function start(interaction) {
  await interaction.update({
    embeds: [
      new MessageEmbed()
        .setTitle("Help me pick")
        .setDescription(
          formatMessage(`
            Which service are you interested in?

            Movio Play: Plex Share. Professionally curated.
            MovioBox: AppBox. Your own Plex-server.
            Kapitel: Audiobooks
          `)
        )
        .setColor("GREEN"),
    ],
    components: [
      new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("helpmepick.play")
          .setLabel("Movio Play")
          .setStyle("SUCCESS"),
        new MessageButton()
          .setCustomId("helpmepick.box")
          .setLabel("MovioBox")
          .setStyle("SUCCESS"),
        new MessageButton()
          .setCustomId("helpmepick.kapitel")
          .setLabel("Kapitel")
          .setStyle("SUCCESS"),
      ]),
    ],
  });
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function play(interaction) {
  if (interaction.customId == "helpmepick.play.ani")
    return await playAni(interaction);
  if (interaction.customId.split(".").length == 3)
    return await playReg(interaction);

  /**
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async function playAni(interaction) {
    await interaction.update({
      embeds: [
        new MessageEmbed()
          .setTitle(`Help me pick - Movio Play Anichiraku`)
          .setDescription(
            formatMessage(`
              Final question!
    
              How many concurrent streams would you like?
            `)
          )
          .setColor("GREEN"),
      ],
      components: [
        new MessageActionRow().addComponents([
          new MessageButton()
            .setCustomId("helpmepick.selected.ani.1")
            .setLabel("1 concurrent stream")
            .setStyle("SUCCESS"),
          new MessageButton()
            .setCustomId("helpmepick.selected.ani.2")
            .setLabel("3 concurrent streams")
            .setStyle("SUCCESS"),
          new MessageButton()
            .setCustomId("helpmepick.selected.ani.3")
            .setLabel("6 concurrent streams")
            .setStyle("SUCCESS"),
        ]),
      ],
    });
  }

  /**
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async function playReg(interaction) {
    await interaction.update({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `Help me pick - Movio Play ${interaction.customId
              .split(".")[2]
              .toUpperCase()}`
          )
          .setDescription(
            formatMessage(`
              Final question!
    
              Would you like access to 4k and DoVi/HDR content?
            `)
          )
          .setColor("GREEN"),
      ],
      components: [
        new MessageActionRow().addComponents([
          new MessageButton()
            .setCustomId(
              `helpmepick.selected.play.${
                interaction.customId.split(".")[2]
              }.plus`
            )
            .setLabel("4k and DoVi/HDR content")
            .setStyle("SUCCESS"),
          new MessageButton()
            .setCustomId(
              `helpmepick.selected.play.${
                interaction.customId.split(".")[2]
              }.regular`
            )
            .setLabel("Regular content")
            .setStyle("SUCCESS"),
        ]),
      ],
    });
  }

  await interaction.update({
    embeds: [
      new MessageEmbed()
        .setTitle("Help me pick - Movio Play")
        .setDescription(
          formatMessage(`
            Play N: Nordic - Our all inclusive option
            Play E: Europe - Regular content
            Play B: North UK/Northern Ireland optimized
            Play S: US/Canada optimized
            Anichiraku: Anime focused
          `)
        )
        .setColor("GREEN"),
    ],
    components: [
      new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("helpmepick.play.n")
          .setLabel("Play N")
          .setStyle("SUCCESS"),
        new MessageButton()
          .setCustomId("helpmepick.play.e")
          .setLabel("Play E")
          .setStyle("SUCCESS"),
        new MessageButton()
          .setCustomId("helpmepick.play.b")
          .setLabel("Play B")
          .setStyle("SUCCESS"),
        new MessageButton()
          .setCustomId("helpmepick.play.s")
          .setLabel("Play S")
          .setStyle("SUCCESS"),
        new MessageButton()
          .setCustomId("helpmepick.play.ani")
          .setLabel("Play Anichiraku")
          .setStyle("SUCCESS"),
      ]),
    ],
  });
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function box(interaction) {
  await interaction.update({
    embeds: [
      new MessageEmbed()
        .setTitle("Help me pick - MovioBox")
        .setDescription(
          formatMessage(`
            Would you like to have access to 4k, DoVi/HDR content?
          `)
        )
        .setColor("GREEN"),
    ],
    components: [
      new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("helpmepick.box.4k")
          .setLabel("4k and DoVi/HDR Content")
          .setStyle("SUCCESS"),
        new MessageButton()
          .setCustomId("helpmepick.box.non4k")
          .setLabel("Regular")
          .setStyle("SUCCESS"),
      ]),
    ],
  });
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function kapitel(interaction) {
  if (interaction.customId.split(".").length == 3)
    return await kapitelReg(interaction);

  /**
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async function kapitelReg(interaction) {
    await interaction.update({
      embeds: [
        new MessageEmbed()
          .setTitle("Help me pick - Kapitel")
          .setDescription(
            formatMessage(`
              How many simultaneous listeners would you like?
            `)
          )
          .setColor("GREEN"),
      ],
      components: [
        new MessageActionRow().addComponents([
          new MessageButton()
            .setCustomId(
              `helpmepick.selected.kapitel.${
                interaction.customId.split(".")[2]
              }.standard`
            )
            .setLabel("2 listeners")
            .setStyle("SUCCESS"),
          new MessageButton()
            .setCustomId(
              `helpmepick.selected.kapitel.${
                interaction.customId.split(".")[2]
              }.plus`
            )
            .setLabel("4 listeners")
            .setStyle("SUCCESS"),
        ]),
      ],
    });
  }

  await interaction.update({
    embeds: [
      new MessageEmbed()
        .setTitle("Help me pick - Kapitel")
        .setDescription(
          formatMessage(`
            What content would you like to have access to?
          `)
        )
        .setColor("GREEN"),
    ],
    components: [
      new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("helpmepick.kapitel.english")
          .setLabel("English")
          .setStyle("PRIMARY")
          .setEmoji("🇺🇸"),
        new MessageButton()
          .setCustomId("helpmepick.kapitel.swedish")
          .setLabel("Swedish")
          .setStyle("PRIMARY")
          .setEmoji("🇸🇪"),
      ]),
      new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("helpmepick.kapitel.all")
          .setLabel("All")
          .setStyle("SUCCESS"),
      ]),
    ],
  });
}
