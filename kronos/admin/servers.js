const { extend } = require("@dojnaz/whmcs/lib/utils");

class KronosServer {
  /**
   * @type {Number}
   */
  id;
  /**
   * @type {String}
   */
  display_name;
  /**
   * @type {String}
   */
  server_type;
  /**
   * @type {'Plex invites'|'Container'}
   */
  owner_name;
  /**
   * @type {Number}
   */
  owner_id;
  /**
   * @type {String}
   */
  node_alias;
  /**
   * @type {Number}
   */
  node_id;
  /**
   * @type {String}
   */
  product_name;
  /**
   * @type {String}
   */
  url;
  /**
   * @type {String}
   */
  created_at;
  /**
   * @type {Number}
   */
  container_id;

  /**
   * @type {import('../index')}
   */
  #client;

  constructor(client, data) {
    this.#client = client;
    extend(this, data);
    this.container_id = this.id;
    if (this.server_type == 'Plex invites') {
      this.container_id = parseInt(this.url.split('/')[6])
    }
  }

  /**
   * @returns {{
   *  success: Boolean,
   *  status: 'not a container'|'running'
   * }}
   */
  async status() {
    return await this.#client.fetch(
      "get",
      `/api/admin/servers/server/${this.container_id}/status`
    );
  }
}

class KronosServers {
  /**
   * @type {import('../index')}
   */
  #client;

  constructor(client) {
    this.#client = client;
  }

  /**
   * @returns {Promise<{
   *  data: KronosServer[],
   *  links: {
   *    first: String,
   *    last: String,
   *    prev: String,
   *    next: String
   *  },
   *  meta: {
   *    current_page: Number,
   *    from: Number,
   *    last_page: Number,
   *    links: {
   *      url: String,
   *      label: String,
   *      active: Boolean
   *    }[],
   *    path: String,
   *    per_page: String,
   *    to: Number,
   *    total: Number
   *  }
   * }}>}
   */
  async search({
    query,
    perpage = 50,
    page = 1,
    sortColumn = "created_at",
    sortDirection = "desc",
  }) {
    const response = await this.#client.fetch(
      "get",
      `/api/admin/servers/all?query=${encodeURIComponent(
        query
      )}&perpage=${perpage}&page=${page}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`
    );
    response.data = response.data.map(
      (server) => new KronosServer(this.#client, server)
    );
    console.log(response);
    return response;
  }
}

module.exports = KronosServers;
