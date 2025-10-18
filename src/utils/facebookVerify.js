const fetch = require("node-fetch");

/**
 * Verify Facebook access token and return basic profile info
 * Uses Graph API: https://graph.facebook.com/me?fields=id,name,email,picture&access_token={token}
 * @param {string} token
 * @returns {Promise<{ email, name, picture, facebookId }>}
 */
async function verifyFacebookToken(token) {
  try {
    const url = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Invalid Facebook token");
    }
    const data = await res.json();
    return {
      email: data.email,
      name: data.name,
      picture: data.picture?.data?.url,
      facebookId: data.id,
      emailVerified: !!data.email,
    };
  } catch (err) {
    throw new Error("Invalid Facebook token");
  }
}

module.exports = { verifyFacebookToken };
