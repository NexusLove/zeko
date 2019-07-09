const {loadCore} = require('./src/modules/loader.js')
const Discord = require("discord.js");
require('dotenv').load();
const client = new Discord.Client({
	disableEveryone:true,
	disabledEvents: ['TYPING_START','CHANNEL_PINS_UPDATE','USER_NOTE_UPDATE','RELATIONSHIP_ADD','RELATIONSHIP_REMOVE'],
	messageCacheLifetime:86400,
	messageSweepInterval:600,
	messageCacheMaxSize:100
});  

if(!process.env.TOKEN) {
	console.error('[ERROR::core] Missing ENV \'TOKEN\' for discord auth. Exiting...')
	process.exit(1);
}
if(process.env.PRODUCTION) {
	process.env.LOGGER_DEBUG_LEVEL = 0;
	process.env.DEBUG_LEVEL = 0;
}

require('./src/modules/functions.js')(client);
//require('./modules/web_rehost')
//require('./modules/quote.js').init(client);

loadCore(client);

/* end of loading */
process.on('error',(err) => {
	console.error(`[ERROR] Ran into critical error: \n${err.message}`);
	process.exit(1)
})
client.login(process.env.TOKEN);
