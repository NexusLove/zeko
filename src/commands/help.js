exports.run = (client,msg,args) => {
	if(args[0]) {
		const cmd = client.commands
		.filter(cmd => !cmd.config.hidden).get(args[0].toLowerCase()) || client.commands.get(client.aliases.get(args[0].toLowerCase()));
		if(!cmd) return msg.channel.send("Couldn't find that command");
		let fields = [];
		if(cmd.config.flags) {
			const flags = [];
			for(const key in cmd.config.flags) {
				flags.push(`${key}:${cmd.config.flags[key]}`)
			}
			fields.push({name:'Flags',value:flags.join("\n")})
		}
		if(cmd.help.fields) {
			fields = fields.concat(cmd.help.fields)
		} 
		if(cmd.help.example) {
			fields.push({name:'Examples',value:cmd.help.example});
		}
		return msg.channel.send({embed:{
			title:`>${cmd.help.name}`,
			description:`${cmd.help.description}\n**Usage: **\`${cmd.help.usage}\``,
			fields
		}})
	}else{
		msg.channel.send('**__Commands__**\n' + client.commands.filter(cmd => !cmd.config.hidden).map(v => `**${v.help.name}** - ${v.help.description}` ).join("\n"))
	}
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'help',
	description: 'okay',
	usage:'help'
};
 