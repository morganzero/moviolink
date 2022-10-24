const axios = require("axios").default;
const admin = require("./admin");

class Kronos {
  #apiKey;
  Admin;

  constructor(apiKey) {
    this.#apiKey = apiKey;
    this.Admin = new admin(this);
  }

  async fetch(method, path) {
    const { data } = await axios({
      url: "https://dash.movio.pro" + path,
      method,
      headers: {
        Authorization: `Bearer ${this.#apiKey}`,
      },
    });
    return data
  }
}

module.exports = Kronos;
