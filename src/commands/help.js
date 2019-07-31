const PREFIX_REGEX = new RegExp(/%(prefix|p)%/,"g")
exports.run = (client,msg,args) => {
	if(args[0]) {
		const cmd = client.commands
		.filter(cmd => !cmd.config.hidden).get(args[0].toLowerCase()) || client.commands.get(client.aliases.get(args[0].toLowerCase()));
		if(!cmd) return msg.channel.send("Couldn't find that command");
		return msg.channel.send(this.generateHelpCommand(client,cmd))
	}else{
		msg.channel.send('**__Commands__**\n' + client.commands.filter(cmd => !cmd.config.hidden).map(v => `**${v.help.name}** - ${v.help.description}` ).join("\n"))
	}
};

exports.generateHelpCommand = (client,cmd) => {
	let fields = [];
	//disable for now
	if(cmd.config.flags && !cmd.config.hideFlags) {
		const flags = [];
		for(const key in cmd.config.flags) {
			const value = cmd.config.flags[key];
			let type = getType(cmd.config.flags[key]);
			if(type === "Object") {
				if(value.type) {
					type = getType(value.type)
				}else{
					type = "Object";
				}
			}
			flags.push(`**${key}:** ${type}`)
		}
		fields.push({name:'Flags',value:flags.join("\n")})
	}
	if(cmd.help.fields) {
		fields = fields.concat(cmd.help.fields)
	} 
	if(cmd.help.example) {
		fields.push({name:'Examples',value:cmd.help.example.replace(PREFIX_REGEX,client.prefix)});
	}
	const name = Array.isArray(cmd.help.name) ? cmd.help.name[0] : cmd.help.name;
	return {embed:{
		title:`${client.prefix}${name}`,
		description:`${cmd.help.description.replace(PREFIX_REGEX,client.prefix)}\n**Usage: **\`${client.prefix}${cmd.help.usage.replace(PREFIX_REGEX,"")}\``,
		fields
	}}
}

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'help',
	description: 'okay',
	usage:'help'
};
 
function getType(value) {
	if(value === String || value === "string") {
		return "String"
	}else if(value === Boolean || value === "boolean") {
		return "Boolean"
	}else if(Array.isArray(value)) {
		return "Array";
	}else if(typeof value === "object") {
		return "Object"
	}
	return "Unknown";
}