const db = require('../db');

const UsersModel = require('./users');
const PostsModel = require('./posts');
const CommentsModel = require('./comments');

module.exports = {
    dbConnection: db,
    models: {
        UsersModel,
        PostsModel,
        CommentsModel
    }
};

UsersModel.hasMany(PostsModel);
UsersModel.hasMany(CommentsModel);

PostsModel.belongsTo(UsersModel);
PostsModel.hasMany(CommentsModel);

CommentsModel.belongsTo(PostsModel);