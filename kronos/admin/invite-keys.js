class KronosInviteKeys {
  /**
   * @type {import('../index')}
   */
  #client;

  constructor(client) {
    this.#client = client;
  }

  /**
   * @returns {Promise<{
   *  success: Boolean,
   *  message: String,
   *  key: {
   *    user_id: Number,
   *    charges: Number,
   *    key: String,
   *    updated_at: String,
   *    created_at: String,
   *    id: Number
   *  },
   *  charges: Number
   * }>}
   */
  async generate() {
    return await this.#client.fetch("put", "/api/admin/invite-keys/generate");
  }
}

module.exports = KronosInviteKeys;
