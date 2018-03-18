module.exports = {
  // 1. MongoDB
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost/smartcampus',

  // 2. JWT - Use environment variable in production!
  JWT_SECRET: process.env.JWT_SECRET || 'super secret',

  // 3. Express Server Port
  PORT: process.env.PORT || 3000
};