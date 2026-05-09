const { DataTypes } = require("sequelize");
const sequelize = require("../db/index");

const BlogPost = sequelize.define(
  "BlogPost",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    coverImageUrl: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue("coverImageUrl");
        if (!rawValue || rawValue.startsWith("http")) return rawValue;
        
        // This is a bit tricky since we don't have the 'req' object here.
        // We can use a standard approach or handle it in the controller/frontend.
        // For portability, let's keep it relative and have the frontend handle it, 
        // OR use a global setting.
        return rawValue;
      }
    },
    tags: {
      type: DataTypes.TEXT,
      defaultValue: "[]",
      get() {
        const rawValue = this.getDataValue("tags");
        try {
          return rawValue ? JSON.parse(rawValue) : [];
        } catch (e) {
          return [];
        }
      },
      set(val) {
        this.setDataValue("tags", JSON.stringify(val));
      },
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isDraft: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    generatedByAI: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "BlogPost", // MATCH PRISMA
  }
);

module.exports = BlogPost;
