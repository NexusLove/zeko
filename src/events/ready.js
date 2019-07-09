
module.exports =  async(client) => {
	const log = new client.Logger("ready",{type:'event'});
	log.info(`Bot now ready`);
}
