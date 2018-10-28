module.exports = {
    labels: ["Comment"],

    "body": "string",
    "createdAt": "localdatetime",
    "updatedAt": "localdatetime",

    commented_on: {
        type: "node",
        target: "Event",
        relationship: "HAS_COMMENT",
        direction: "in",
        eager: true
    },

    comment_by: {
        type: "node",
        target: "User",
        relationship: "COMMENTED",
        direction: "in",
        eager: true
    }
}