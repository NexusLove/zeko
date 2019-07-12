const env = require('env-var');
module.exports = (client) => {
    //pass the env-var module to the client
    client.env = env;

    //check for discord token and exit if none
    if(!process.env.TOKEN) {
        console.error('[SEVERE::core] Missing ENV \'TOKEN\' for discord auth. Exiting...')
        process.exit(1);
    }
    //check for production env and set logging levels
    if(process.env.PRODUCTION) {
        process.env.LOGGER_DEBUG_LEVEL = 0;
        process.env.DEBUG_LEVEL = 0;
    }
}