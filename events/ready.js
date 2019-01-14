const fs = require('fs-extra');
const schedule = require('node-schedule');
let inital = true;

let birthdayModule; 
module.exports =  async(client) => {
	console.info(`[core] Bot now ready - ${new Date}`);
	if(inital) {
		birthdayModule = client.moduleManager.findModule("birthday");
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
		setInterval(() => {
			//should be a scheduler, debugging for now
			if(!birthdayModule) return;
			const bds = birthdayModule.checkForBirthdays();
			console.log(bds,bds.length)
			//birthdayModule.config.activeGuilds
			const guilds = birthdayModule.config.activeGuilds;
			bds.forEach(v => {
				const user = client.users.get(v.id);
				if(!user) return;
				console.log("got user")
				guilds.forEach(v => {
					const guild = client.guilds.get(v);
					if(!guild) return;
					console.log("got guild",guild.name)
					if(guild.members.has(v.id)) {
						const channel = guild.channels.get(v.channel);
						if(!channel) return;
						channel.send(`${user.toString()}'s birthday is today!`)
					}
				})
			})
		},15000)
		initial = false;
	}
	client.voiceConnections.forEach(conn => {
		if(conn.channel.members.filter(v => !v.bot).size === 0) {
			conn.disconnect();
		}
		//todo: time out feature?
	})
}
