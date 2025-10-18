// eslint-disable-next-line import/newline-after-import
const { OAuth2Client } = require("google-auth-library");
const config = require("../config/config");

const client = new OAuth2Client(config.google.clientId);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.google.clientId,
    });
    const payload = ticket.getPayload();

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      googleId: payload.sub,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    throw new Error("Invalid Google token");
  }
}

module.exports = { verifyGoogleToken };
