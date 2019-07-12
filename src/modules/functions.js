const {inspect} = require('util');
const {Collection} = require('discord.js')
const ModuleManager = require('./ModuleManager.js');
const Logger = require('./logger.js');

const {settings: config} = require('./database');
module.exports = (client) => {
    client.commands = new Collection();
    client.events = new Collection();
    client.aliases = new Collection();

    client.Logger = Logger.Logger;
    client.moduleManager =  new ModuleManager(client)

    client.config = config;

    client.clean = (text) => {
        if (typeof text !== 'string')
        text = inspect(text, {depth: 0})
        text = text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203))
        .replace(client.token, "7");
        return text;
    };
    const token_regex = new RegExp(`(${client.token})`,"g")
    client.clean = text => {
        const token_regex = new RegExp(`($)`)

        if (typeof(text) !== "string")
           text = inspect(text,{depth:0})
        return text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203))
        .replace(token_regex,"[token]")
    }
}