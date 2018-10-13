module.exports = {
  labels: ["Event"],
  
  "title": "string",
  "time": "localdatetime",
  "location": "string",
  "link": {
    type: "string",
    uri: {
        scheme: ["http", "https"]
    }
  },
  "body": "string",
  "picture": {
    type: "string",
    uri: {
        scheme: ["http", "https"]
    }
  },
  "createdAt": "localdatetime",
  "updatedAt": "localdatetime",

  posted_by: {
    type: "node",
    target: "User",
    relationship: "POSTED",
    direction: "in",
    eager: true
  }

};
