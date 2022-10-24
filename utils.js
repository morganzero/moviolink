/**
 * @param {String} input
 * @returns
 */
function formatMessage(input) {
  return input
    .split("\n")
    .map((a) => a.trim())
    .join("\n")
    .trim();
}

module.exports = { formatMessage };
