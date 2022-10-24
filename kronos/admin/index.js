const InviteKeys = require("./invite-keys");
const Servers = require("./Servers");
const Users = require("./users");

class KronosAdmin {
  #client;
  InviteKeys;
  Servers;
  Users;

  constructor(client) {
    this.#client = client;
    this.InviteKeys = new InviteKeys(client);
    this.Servers = new Servers(client);
    this.Users = new Users(client);
  }
}

module.exports = KronosAdmin;
