
const {Collection} = require('discord.js')
const ModuleManager = require('./ModuleManager.js');
const EventManager = require('./EventManager.js');
const Logger = require('../logger.js');
const path = require('path')

const {settings: config} = require('../database');
module.exports = (client) => {
    //collection of commands, events, and aliases
    client.commandGroups = [];
    client.commands = new Collection();
    client.events = new Collection();
    client.aliases = new Collection();

    //load internal modules
    client.Logger = Logger.Logger;
    client.moduleManager =  new ModuleManager(client)
    client.eventManager = new EventManager(client)
    client.permissions = require('../PermissionHelper')

    client.eventManager.emitter = patchEmitter(client)

    //load variables
    client.config = config;
    client.prefix = process.env.PREFIX||">"
    client.rootDir = path.resolve(__dirname,"../../../"); //push root dir into path

    client.utils = require('../utils.js')(client)

}
//patch client events, so we can intercept any events 
const events = require('events');
const eventEmitter = new events.EventEmitter();

function patchEmitter(emitter) {
	const oldEmit = emitter.emit;
  
	emitter.emit = function() {
        const args = Array.prototype.slice.call(arguments);
		const name = args.shift();
		//console.log(require('util').inspect(arguments[1],{depth:0}))
        if(!["raw","debug"].includes(name)) {
            emitter.eventManager.event(name,args)
        }
		oldEmit.apply(emitter, arguments);
    }
    return eventEmitter    
}