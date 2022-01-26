const { DataTypes } = require("sequelize");
const db = require("../db");

const Posts = db.define("posts", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  make: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  model: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  username: {
    type: DataTypes.TEXT,
    allowNull: false
  },
});

module.exports = Posts;