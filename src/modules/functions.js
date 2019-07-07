const {inspect} = require('util');
const {Collection} = require('discord.js')
const ModuleManager = require('./ModuleManager.js');
const Logger = require('./logger.js');
module.exports = (client) => {
    client.commands = new Collection();
    client.events = new Collection();
    client.aliases = new Collection();

    client.Logger = Logger.Logger;
    client.moduleManager =  new ModuleManager(client)

    client.clean = (text) => {
        if (typeof text !== 'string')
        text = inspect(text, {depth: 0})
        text = text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203))
        .replace(client.token, "7");
        return text;
    };
}