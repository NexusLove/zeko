const fs = require("fs");
const Discord = require("discord.js");
const colors = require('colors');
require('dotenv').load();
const client = new Discord.Client({
	disableEveryone:true,
	disabledEvents: ['TYPING_START','CHANNEL_PINS_UPDATE','USER_NOTE_UPDATE','RELATIONSHIP_ADD','RELATIONSHIP_REMOVE'],
	messageCacheLifetime:86400,
	messageSweepInterval:600,
	messageCacheMaxSize:100
});  
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

require('./modules/functions.js')(client);
require('./modules/web_rehost')
require('./modules/quote.js').init(client);
/* Loading */
fs.readdir('./events/', (err, files) => {
	if (err) console.error(err);
	console.log(`[core] Loading ${files.length} events.`);
	files.forEach(file => {
	  if(file.split(".").slice(-1)[0] !== "js") return; //has to be .js file *cough* folder that doesnt exist *cough*
	  const eventName = file.split(".")[0];
	  	try {
		  const event = require(`./events/${file}`);
		  if(!event || typeof event !== 'function') {
			  return console.warn(`[core] \x1b[33mWarning: ${file} is not setup correctly!\x1b[0m`);
		  }
		  client.on(eventName, event.bind(null, client));
		  delete require.cache[require.resolve(`./events/${file}`)];
	  	}catch(err) {
		  console.error(`[core] \x1b[31mEvent ${file} had an error:\n    ${err.stack}\x1b[0m`);
	  	}
	});
});

fs.readdir('./commands/', (err, files) => {
	if (err) console.error(err);
	console.log(`[core] Loading ${files.length} commands.`);
	files.forEach(f => {
		fs.stat(`./commands/${f}`, (err, stat) => {
			if(f.split(".").slice(-1)[0] !== "js") return;
			if(f.startsWith("_")) return;
			try {
				let props = require(`./commands/${f}`);
				if(!props.help || !props.config) return console.warn(`[core] \x1b[33mWarning: ${f} has no config or help value. \x1b[0m`);
				props.help.description = props.help.description||'[No description provided]'
				if(props.init) props.init(client);
				props.help.aliases.forEach(alias => {
					client.aliases.set(alias, props.help.name);
				});
				client.commands.set(props.help.name, props);
			}catch(err) {
				console.error(`[core] \x1b[31mCommand ${f} had an error:\n    ${err.stack}\x1b[0m`);
			}
		});
	});
});
client.moduleManager = require('./modules/ModuleHandler.js');
client.moduleManager.init(client);
fs.readdir('./modules/', (err, files) => {
	if (err) console.error(err);
	console.log(`[core] Checking for modules to load..`);
	files.forEach(f => {
		fs.stat(`./modules/${f}`, (err, stat) => {
			if(f.split(".").slice(-1)[0] !== "js") return;
			if(f.startsWith("_")) return;
			try {
				let props = require(`./modules/${f}`);
				if(!props.config) return; //not a custom module
				props.config.name = f.split(".")[0];
				if(props.config.command) {
					if(props.init) props.init(client);
					client.moduleManager.registerCustomCommandModule(props);
				}
			}catch(err) {
				console.error(`[core] \x1b[31mModule ${f} had an error:\n    ${err.stack}\x1b[0m`);
			}
		});
	});
});
/* end of loading */

client.login(process.env.TOKEN);
