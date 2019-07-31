//import modules
const Discord = require("discord.js");
require('dotenv').config();
//start a new discord client
const client = new Discord.Client({
	disableEveryone:true,
	disabledEvents: ['TYPING_START','CHANNEL_PINS_UPDATE','USER_NOTE_UPDATE','RELATIONSHIP_ADD','RELATIONSHIP_REMOVE'],
	messageCacheLifetime:86400,
	messageSweepInterval:600,
	messageCacheMaxSize:100
});  


//load environmental parser (parse to numbers, process owner ids)
require('./src/modules/loaders/EnvLoader')(client);
//load functions to the client object
require('./src/modules/loaders/functions.js')(client);

//finally start loading
require('./src/modules/loaders/loader.js').loadCore(client);

//final error catch area
process.on('error',(err) => {
	console.error(`[ERROR] Ran into critical error: \n${err.message}`);
	process.exit(1)
})
//finally, login with token after everything is loaded.
client.login(process.env.TOKEN);
