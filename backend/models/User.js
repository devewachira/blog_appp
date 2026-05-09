const { DataTypes } = require("sequelize");
const sequelize = require("../db/index");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileImageUrl: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue("profileImageUrl");
        if (!rawValue || rawValue.startsWith("http")) return rawValue;
        return rawValue;
      }
    },
    bio: {
      type: DataTypes.TEXT,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "member", // member, admin, superadmin
    },
  },
  {
    timestamps: true,
    tableName: "User", // MATCH PRISMA
  }
);

module.exports = User;
