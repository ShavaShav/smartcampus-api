// Export a Neode Instance
const Neode = require("neode");

instance = new Neode.fromEnv();
instance.setEnterprise(process.env.NEO4J_ENTERPRISE == 'true'); // 
instance.with({
  User: require("./user"),
  Event: require("./event")
});

// Export the models as well for convenience
const User = instance.model('User');
const Event = instance.model('Event');

module.exports = { instance, User, Event };
