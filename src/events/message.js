
const getopts = require("getopts")
module.exports = async (client, logger, msg) => {
	return new Promise((resolve,reject) => {
		if(msg.author.bot) return resolve();
		const args = msg.content.split(/\s+/g);
		if(args.length === 0) return resolve();
		if(/\s/.test(client.prefix)) args.shift();
		const command = /\s/.test(client.prefix) ? args.shift().toLowerCase() : args.shift().slice(client.prefix.length).toLowerCase();
		const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
	
		if(msg.content.startsWith(process.env.PREFIX) && cmd) {
			try {
				const flags_options = parseOptions(cmd.config.flags);
				const options = getopts(msg.cleanContent.split(/ +/g).slice(1), {
					boolean: flags_options.boolean,
					string: flags_options.string,
					alias: Object.assign({help: "h",},flags_options.aliases),
					default: {
						help:false
					}
				})
				if(options.help || cmd.config.usageIfNotSet) {
					const help = client.commands.get('help').generateHelpCommand(client,cmd);
					return msg.channel.send(help)
				}
				const newArgs = options._;
				const _logger = new client.Logger(command,{type:'command'});
				cmd.run(client,msg,newArgs,options,_logger)
				resolve();
			}catch(err) {
				msg.channel.send('**Command Error**\n`' + err.stack + "`");
				reject(err);
			}
		}
	})
}

function parseOptions(flags = {}) {
	let result = {
		string:[],
		boolean:['help'],
		aliases:{},
		misc:[]
	}
	for(const key in flags) {
		if(!flags.hasOwnProperty(key)) continue;
		
		if(flags[key] === Boolean || flags[key] === "boolean") {
			result.boolean.push(key);
		}else if(Array.isArray(flags[key])) {
			//if alias option only includes 1 or less ignore
			if(flags[key].length <= 1) continue;
			result.aliases[flags[key][0]] = flags[key].slice(1)
		}else if(typeof(flags[key]) === "object") {
			/*
			{ type: Boolean, aliases: ['t','turbo'] }
			*/
			if(flags[key].type && flags[key].aliases) {
				//again, if alias option only includes 0
				if(flags[key].aliases.length <= 0) return;
				if(flags[key].type === Boolean || flags[key].type === "boolean") {
					//Push the first alias
					result.boolean.push(key)
					result.aliases[key] = flags[key].aliases
				}else if(flags[key].type === String || flags[key].type === "string") {
					result.string.push(key)
					result.aliases[key] = flags[key].aliases
				}
			} 
		} else{
			result.string.push(key);
		}
	}
	return result;
}