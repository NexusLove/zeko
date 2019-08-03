const PREFIX_REGEX = new RegExp(/%(prefix|p)%/,"g")
exports.run = (client,msg,args) => {
	if(args[0]) {
		const cmd = client.commands
		.filter(cmd => !cmd.config.hidden).get(args[0].toLowerCase()) || client.commands.get(client.aliases.get(args[0].toLowerCase()));
		if(!cmd) return msg.channel.send("Couldn't find that command");
		return msg.channel.send(this.generateHelpCommand(client,cmd))
	}else{
		const grouped = {core:[]} //core first
		client.commandGroups.forEach(v => grouped[v] = []);
		grouped['misc'] = []; //want it to be the last group
		//push all commands into their group
		client.commands.keyArray().forEach(key => {
			let v = client.commands.get(key);
			v._NAME = key;

			if(v.config.core) return grouped['core'].push(v)
			grouped[v.group||'misc'].push(v)
		})
		//loop the sorted commands
		for(const key in grouped) {
			//make the name pretty, and filter non-hidden groups
			const group_name = key.charAt(0).toUpperCase() + key.slice(1);
			const cmds = grouped[key].filter(cmd => !cmd.config.hidden);
			if(cmds.length === 0) continue;
			//send embed of commands, only if well there is commands
			msg.author.send({embed:{
				title:`${group_name} Commands`,
				description: cmds.map(v => {
					const desc = v.help.description.replace(/\*\*/g,'\\**')
					return `**${v._NAME}** - ${desc}`
				}).join("\n")
			}})
		}
		//clarify (for other users and the author) thats in the dm
		msg.channel.send("** 📬 Help has been sent to your DM**")
	}
};
exports.generateHelpCommand = (client,cmd) => {
	let fields = [];
	//print information about flags if not hidden
	if(cmd.config.flags && !cmd.config.hideFlags) {
		const flags = [];
		for(const key in cmd.config.flags) {
			const value = cmd.config.flags[key];
			let type = getType(value);
			let description = null;
			//if the value is an object, then parse the sub object 
			if(type === "Object") {
				//only valid if there is a type attribute
				if(value.type) {
					//reset type to the type of flag
					type = getType(value.type)
					//set the description if there is one (will be undefined)
					description = value.description;
				}else{
					type = "Object";
				}
			}
			flags.push(`**[${type}] ${key}** ${description||''}`)
		}
		fields.push({name:'Flags',value:flags.join("\n")})
	}
	//add fields to the embed
	if(cmd.help.fields) {
		fields = fields.concat(cmd.help.fields)
	} 
	//add example field, filling in %prefix%
	if(cmd.help.example) {
		const value = Array.isArray(cmd.help.example) ? cmd.help.example.join("\n") : cmd.help.example
		fields.push({name:'Examples',value:value.replace(PREFIX_REGEX,client.prefix)});
	}else if(cmd.help.examples) {
		const value = Array.isArray(cmd.help.examples) ? cmd.help.examples.join("\n") : cmd.help.examples
		fields.push({name:'Examples',value:value.replace(PREFIX_REGEX,client.prefix)});
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
	if(typeof value === "object") {
		return "Object"
	}else if(value === String || (typeof value === "string" && value.toLowerCase() === "string")) {
		return "String"
	}else if(value === Boolean || (typeof value === "string" && value.toLowerCase() === "boolean")) {
		return "Boolean"
	}else if(value === Number || (typeof value === "string" && value.toLowerCase() === "number")) {
		return "Number";
	}
	return "Unknown";
}