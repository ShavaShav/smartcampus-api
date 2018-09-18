'use strict';

module.exports = (sequelize, DataTypes) => {
  var Event = sequelize.define('Event', {
    title: DataTypes.STRING,
    time: DataTypes.DATE,
    location: DataTypes.STRING,
    link: DataTypes.STRING,
    body: DataTypes.TEXT
  }, {
    freezeTableName: true,
    tableName: 'Events',
    timestamps: true
  });

  Event.associate = function(models) {
    // associations can be defined here
    Event.belongsTo(models.User, { as: 'author' });
  };

  // Event details to expose in JSON responses
  Event.prototype.toJSON = function(){
    return {
      id: this.id,
      author: this.author.toJSON(),
      title: this.title,
      time: this.time,
      location: this.location,
      link: this.link,
      body: this.body,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    }
  };

  return Event;
};