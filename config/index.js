module.exports = {
  // MongoDB (use mlab test database by default)
  MONGO_URI: process.env.MONGO_URI || 'mongodb://root:root@ds115219.mlab.com:15219/smartcampus',

  // JWT - Use environment variable in production!
  JWT_SECRET: process.env.JWT_SECRET || 'super secret',

  // Express Server Port
  PORT: process.env.PORT || 3000
};