const fs = require('fs-extra');
const schedule = require('node-schedule');
let inital = true;
module.exports =  async(client) => {
	console.info(`[core] Bot now ready - ${new Date}`);
	if(inital) {
		require('../modules/server.js')(client);
		client.user.setActivity('Prestoné',{type:'LISTENING'})
		schedule.scheduleJob({hour: 6, minute: 00}, async() => {
			const channel = await client.channels.get("500772757911502848")
			if(channel) return channel.send("<@!318551843754082304> Where bony?")
			console.warn('could not find #where-bony')
		});
		schedule.scheduleJob({hour: 11, minute: 05}, async() => {
			const channel = await client.channels.get("500772757911502848")
			if(channel) return channel.send("<@!318551843754082304> Where bony?")
			console.warn('could not find #where-bony')
		});
		initial = false;
	}
	client.voiceConnections.forEach(conn => {
		if(conn.channel.members.filter(v => !v.bot).size === 0) {
			conn.disconnect();
		}
		//todo: time out feature?
	})
}
