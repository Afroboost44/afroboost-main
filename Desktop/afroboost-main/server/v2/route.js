const express = require('express');
const v2_router = express.Router();
const controller = require('./controller');
const util = require('util');

module.exports = (connection) => {
    const query = util.promisify(connection.query).bind(connection);
    v2_router.get('/get-users', (req, res) => controller.getUsers(req, res, query));
    v2_router.delete('/delete-user/:id', (req, res) => controller.deleteUser(req, res, query));
    v2_router.delete('/delete-message/:id', (req, res) => controller.deleteMessage(req, res, query));

    return v2_router;
};