// Script will install all constraints for database
// Installs by default. Run with 'drop' arg to drop schema.
const dropSchema = process.argv[2] == 'drop';

// Get Neode instance
const Neode = require('../models').Neode;

var query;

if (dropSchema) {
  process.stdout.write("Dropping database schema...");
  query = Neode.schema.drop();
} else {
  process.stdout.write("Installing database schema...");
  query = Neode.schema.install();
}

query
  .then(() => {
    console.log("Success");
    process.exit();
  })
  .catch(err => {
    console.log("Failed\n");
    console.log(err);
    process.exit(1);
  });
