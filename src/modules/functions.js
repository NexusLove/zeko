const {inspect} = require('util');
const {Collection} = require('discord.js')
const ModuleManager = require('./loaders/ModuleManager.js');
const Logger = require('./logger.js');
const path = require('path')

const {settings: config} = require('./database');
module.exports = (client) => {
    //collection of commands, events, and aliases
    client.commands = new Collection();
    client.events = new Collection();
    client.aliases = new Collection();

    //load internal modules
    client.Logger = Logger.Logger;
    client.moduleManager =  new ModuleManager(client)

    //load variables
    client.config = config;
    client.rootDir = path.resolve(__dirname,"../"); //push root dir into path

    //extra functions
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