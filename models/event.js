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

  has_comment: {
    type: "node",
    target: "Comment",
    relationship: "HAS_COMMENT",
    direction: "out"
  },

  posted_by: {
    type: "node",
    target: "User",
    relationship: "POSTED",
    direction: "in",
    eager: true
  },

  liked_by: {
    type: "nodes",
    target: "User",
    relationship: "LIKES",
    direction: "in",
    eager: true
  }

};
