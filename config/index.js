module.exports = {
  // JWT - Use environment variable in production!
  JWT_SECRET: process.env.JWT_SECRET || 'super secret',

  // Google ClientID, used to verify google tokens from front end. Defaulted to a spare gmail account for localhost development
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "277515368324-maqaj6vn8kkm1kvvbl1sq0v8tca6agfr.apps.googleusercontent.com",

  // Express Server
  PORT: process.env.PORT || 3001,
  HOST: process.env.HOST || 'localhost',
};