module.exports = {
  labels: ["User"],

  "googleId": {
    type: 'string',
    unique: true
  },
  "email": {
    type: 'string',
    unique: true
  },
  "firstName": "string",
  "lastName": "string",
  "locale": "string",
  "name": "string",
  "picture":{
    type: "string",
    uri: {
      scheme: ["http", "https"]
    }
  },
  "createdAt": "localdatetime",
  "updatedAt": "localdatetime",

  posted: {
    type: "node",
    target: "Event",
    relationship: "POSTED",
    direction: "out"
  }

};
