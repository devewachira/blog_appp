const User = require("./User");
const BlogPost = require("./BlogPost");
const Comment = require("./Comment");
const ContactMessage = require("./ContactMessage");

// User - BlogPost (1:M)
User.hasMany(BlogPost, { foreignKey: "authorId", as: "posts" });
BlogPost.belongsTo(User, { foreignKey: "authorId", as: "author" });

// User - Comment (1:M)
User.hasMany(Comment, { foreignKey: "authorId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "authorId", as: "author" });

// BlogPost - Comment (1:M)
BlogPost.hasMany(Comment, { foreignKey: "postId", as: "comments", onDelete: "CASCADE" });
Comment.belongsTo(BlogPost, { foreignKey: "postId", as: "post" });

// Comment - Comment (Self-referencing for replies)
Comment.hasMany(Comment, { foreignKey: "parentCommentId", as: "replies", onDelete: "CASCADE" });
Comment.belongsTo(Comment, { foreignKey: "parentCommentId", as: "parentComment" });

module.exports = {
  User,
  BlogPost,
  Comment,
  ContactMessage,
};
