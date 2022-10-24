if (!global.movioLinkDB) {
  const fs = require("fs");
  const path = require("path");
  const Observer = require("deep-observer");

  const db = new Observer(
    require("./data"),
    (_db) =>
      fs.writeFileSync(
        path.join(__dirname, "data.json"),
        JSON.stringify(db, null, 2)
      ),
    {
      depth: 6,
    }
  );
  global.movioLinkDB = db;
}

/**
 * @type {{
 *  discordId: String,
 *  movioClient: Number,
 *  nextCheck: Number
 * }[]}
 */
const db = global.movioLinkDB;

module.exports = db;
