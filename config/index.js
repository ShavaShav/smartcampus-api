module.exports = {
  // JWT - Use environment variable in production!
  JWT_SECRET: process.env.JWT_SECRET || 'super secret',

  // Express Server Port
  PORT: process.env.PORT || 3001
};