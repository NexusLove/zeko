const {loadCommands,loadEvents,loadModules} = require('./modules/loader')
const {log,warn,error} = require('./modules/logger');
const Discord = require("discord.js");
require('dotenv').load();
const client = new Discord.Client({
	disableEveryone:true,
	disabledEvents: ['TYPING_START','CHANNEL_PINS_UPDATE','USER_NOTE_UPDATE','RELATIONSHIP_ADD','RELATIONSHIP_REMOVE'],
	messageCacheLifetime:86400,
	messageSweepInterval:600,
	messageCacheMaxSize:100
});  
client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.aliases = new Discord.Collection();

require('./modules/functions.js')(client);
require('./modules/web_rehost')
require('./modules/quote.js').init(client);
/* Loading */

loadCommands(client);
loadEvents(client);
loadModules(client);


client.moduleManager = require('./modules/ModuleHandler.js');
client.moduleManager.init(client);

/* end of loading */
process.on('error',(err) => {
	console.error(`[ERROR] Ran into critical error: \n${err.message}`);
	process.exit
})
client.login(process.env.TOKEN);
