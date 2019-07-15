
module.exports = async (client, logger, msg) => {
	return new Promise((resolve,reject) => {
		if(msg.author.bot) return resolve();
		const args = msg.content.split(/ +/g);
		if(args.length === 0) return resolve();
		const command = args.shift().slice(process.env.PREFIX.length).toLowerCase();
		const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
	
		if(msg.content.startsWith(process.env.PREFIX) && cmd) {
			try {
				let flags = {};
				const newArgs = msg.cleanContent.split(/ +/g).slice(1);
				for(let i=0;i<args.length;i++) {
					const flag = args[i].split("=");
					if(flag.length === 2 && flag[0].startsWith("$")) {
						flag[0] = flag[0].substr(1);
						if(!/^[A-Za-z]+$/.test(flag[0].toLowerCase())) continue; //flag must be alpha chars
						if(!flag[0] || !flag[1] || flag[0].length === 0 || flag[1].length === 0) continue;
						newArgs.splice(i,1);
						if(!cmd.config.flags) {
							flags[flag[0].toLowerCase()] = flag[1];
							continue;
						}
						
						switch(cmd.config.flags[flag[0].toLowerCase()]) {
							case "number":
								flags[flag[0].toLowerCase()] = parseInt(flag[1]);
								break;
							case "boolean":
								flags[flag[0].toLowerCase()] = (flag[1] == 'true')
								break;
							default:
								flags[flag[0].toLowerCase()] = flag[1];
						}
					}
				}
				const logger = new client.Logger(command,{type:'command'});
				cmd.run(client,msg,newArgs,flags,logger)
				resolve();
			}catch(err) {
				msg.channel.send('**Command Error**\n`' + err.stack + "`");
				reject(err);
			}
		}
	})
}