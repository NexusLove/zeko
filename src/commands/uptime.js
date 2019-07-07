const {version} = require('discord.js');
const {stripIndents} = require('common-tags')
const moment = require('moment');
require('moment-duration-format');
require('moment-timezone');
const {platform} = require('os');
exports.run = (client,msg,args) => {
	/*if(args[0]) {
		if(args[0] === "commands") {

		}
		return msg.channel.send("Sorry, not a valid metric name. **Metrics:**\nCommands")
	}*/
	const uptime = moment.duration(client.uptime).format('d[d] h[h] m.s[m] ');
	msg.channel.send({embed:{
		description:`**Zeko**\n`,
		color:client.color,
		fields:[
			{
				name:"❯ General Info",
				value:stripIndents`Uptime **${uptime}**
					RAM **${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB**
					OS **${platform().replace("win32","Windows").replace("linux","Linux")}**`,
				inline:true
			},
			{
				name:"❯ Bot Info",
				value:stripIndents`**${client.guilds.size}** guilds
					**${numberSplit(client.channels.size)}** channels
					**${numberSplit(client.users.size)}** users`,
				inline:true
			},
			{
				name:"❯ Disclaimer",
				value:stripIndents`This is totally \nnot copied from \ninsertbotnamehere`,
				inline:true
			},
		],
		footer:{text:`Created by Jackz#7627 | nodejs ${process.version} | djs v${version}`},
		timestamp:client.readyAt
	}})
};

exports.config = {
	usageIfNotSet: false,
};

exports.help = {
	name: 'uptime',
	aliases:['botinfo','info','metrics'],
	description: 'Displays bot information which includes: uptime, memory usage, bot links, api versions, and more',
	usage:'info'
};
 
function numberSplit (n, separator = ',') {
    let num = (n + '')
    let decimals = ''
    if (/\./.test(num)) {
      decimals = num.replace(/^.*(\..*)$/, '$1')
    }
    num = num.replace(decimals, '').split('').reverse().join('').match(/[0-9]{1,3}-?/g).join(separator).split('').reverse().join('')
    return `${num}${decimals}`
}