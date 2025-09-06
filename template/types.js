const User = require("@models/userModel");
const Link = require("@models/linkModel").Link;
const express = require("express");

/**
 * @typedef {InstanceType<typeof User>} UserType
 * @typedef {InstanceType<typeof Link>} LinkType
 * @typedef {(req: express.Request & {user:UserType}, res: express.Response) => void} HandlerType
 */

module.exports = {};
