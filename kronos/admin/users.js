class KronosUsers {
  /**
   * @type {import('../index')}
   */
  #client;

  constructor(client) {
    this.#client = client;
  }

  /**
   * @returns {Promise<{
   *  data: import('../types').KronosUser[],
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
   * }>}
   */
  async search({
    query,
    perpage = 50,
    page = 1,
    sortColumn = "created_at",
    sortDirection = "desc",
  }) {
    return await this.#client.fetch(
      "get",
      `/api/admin/users?query=${encodeURIComponent(
        query
      )}&perpage=${perpage}&page=${page}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`
    );
  }
}

module.exports = KronosUsers;
