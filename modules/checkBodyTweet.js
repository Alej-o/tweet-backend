function checkBodyTweet(body, keys) {
  if (!body || typeof body !== 'object') return false;

  for (const field of keys) {
      if (
          !body[field] ||
          typeof body[field] !== 'string' ||
          body[field].length > 280
      ) {
          return false;
      }

      if (field === "content" && !/#.+/.test(body[field])) {
          return false;
      }
  }

  return true;
}

module.exports = { checkBodyTweet };