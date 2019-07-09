require('dotenv').load();
//modules
//TODO: overwrite this with custom
const stats = require('../../modules/stats.js').db;
const fs = require('fs').promises;
const got = require('got')
const {Attachment} = require('discord.js');
//data
let notified_dm = [];
let violations = 0;
const msgs = {
	lowerAttachment:[
		"No.",
		"I don't think so.",
		"You are forbidden",
		"fuck you",
		"0",
		"Nope.",
		"Undo."
	]
}
let last_auto_remove = {};
let auto_remove_enabled = false;
module.exports = async (client, msg) => {
	if(msg.author.bot) return;
	if(msg.channel.id === "291675586324070401") return;
	if(msg.channel.id === "531281131186815006") {
		//h
		if(!msg.content.startsWith("!ignore")) {
			const description = msg.content.split(/\n/);
			const name = description.shift();
			got('https://api.trello.com/1/cards',{
				method:'POST',
				json:true,
				query:{
					key:process.env.TRELLO_API_KEY,
					token:process.env.TRELLO_API_TOKEN,
					name:name,
					desc:description.join("\n"),
					pos:'bottom',
					idList:"5d23885a5dd5f44eb791b59d",
					idLabels:"5d238854af988c41f23b78fe"
				}
			}).then((r) => {
				msg.react('✅');
			}).catch(err => {
				msg.react('❌')
				msg.channel.send(`**${msg.author} Could not post suggestion:** ${err.message}`)
				.then(m => m.delete(25000)).catch(() => {})
				console.error(`[ERROR::event/message] Post by ${msg.author.tag} failed: ${err.response.body}`)
			})
		}
		return;
	}
	if(auto_remove_enabled && msg.author.id === "303027173659246594") {
		msg.delete();
		if(!last_auto_remove[msg.author.id] || Date.now() - last_auto_remove[msg.author.id] > 40000) {
			msg.channel.send(`${msg.author} Your message was detected to be in violation of the Steve Content Regulations and has been removed automatically.\n_If you think this was incorrect, then your wrong. Zeko is never wrong_`)
		}
		last_auto_remove[msg.author.id] = Date.now();
		return;
	}

	//custom code that will be moved
	if(msg.guild && msg.guild.id === "551224997268553729") {
		if(msg.content.toLowerCase().startsWith("train")) {
			const trains = await fs.readdir('./db/trains');
			const train = trains[Math.floor(Math.random()*trains.length)];
			msg.channel.send(new Attachment(`./db/trains/${train}`))
		}
	}
	if(msg.guild && msg.guild.id !== '137389758228725761' && !msg.content.includes(process.env.PREFIX)) {
		if(/(despacito|des.{1,5}pa.{1,5}cito?)/gm.test(msg.content.toLowerCase().replace(/\s/gm,''))){
			msg.delete();
			return msg.reply('**__no despacito__**').then(m => m.delete(15000))
		}
		//( |\t)+((acquir|g(i|e)tt|grabb)(en|ing?))
		const crapRegex = new RegExp(/(crapp|sh(i|e)tt|poop(e|i)n|anus juice|fecal\smatter|dodo)(ing?|en|in)?.{0,2}( |\t)?(and|n)/,'gm');
		if(crapRegex.test(msg.content.toLowerCase())){
			msg.delete();
			return msg.channel.send(`${msg.author.toString()} nope. we don't say that.`)
		}
		/*if(msg.content.toLowerCase().replace(/(despacito|des.{1,3}pa.{1,3}cito)/gm.test(msg.content.toLowerCase()))) {
			
		}*/
	}

	if(msg.author.id === "165535234593521673" && msg.content === "¯\\_(ツ)_/¯")  {
		msg.channel.send("¯\\_(ツ)_/¯")
	}
	//load the legacy module message handler
	client.moduleManager.messageHandler(msg);

	const args = msg.content.split(/ +/g);
	if(args.length === 0) return;
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
			return cmd.run(client,msg,newArgs,flags,logger)
		}catch(err) {
			msg.channel.send('**Command Error**\n`' + err.stack + "`");
		}
		return; 
	}

	//custom code that should be removed
	if(msg.channel.type === "dm" ) {
		if(notified_dm.includes(msg.author.id)) return;
		notified_dm.push(msg.author.id);
		return msg.channel.send("Okay, I'm telling everyone about that.");
	}
	const optout = stats.get("optout").has(msg.author.id).value();

	const authorStats = stats.get("users").has(msg.author.id).value();
	if(!authorStats) {
		if(!optout) stats.get("users").set(msg.author.id,{imgs:0,msgs:1}).write();
		//stats.get("global").update("msgs",m => m+=1).write();
	}else{
		if(!optout) stats.get("users").get(msg.author.id).update("msgs",m => m+=1).write();
		//stats.get("global").update("msgs",m => m+=1).write();
	}

	if(msg.attachments.size > 0) {
		const authorStats = stats.get("users").has(msg.author.id).value();
		if(!authorStats) {
			stats.get("users").set(msg.author.id,{imgs:1,msgs:1}).write();
			//stats.get("global").update("imgs",m => m+=1).write();
		}else{
			stats.get("users").get(msg.author.id).update("imgs",m => m+=1).write();
			//stats.get("global").update("imgs",m => m+=1).write();
		}
	}
	//custom code that should be removed
	if(msg.cleanContent.toLowerCase().startsWith("xd") || msg.cleanContent.toLowerCase().replace(/[-!,.?\/]/,'') === "xd") msg.react('292088385772716042').catch(() => {});
	if(msg.content.toLowerCase().includes("steve?")) {
		if(msg.author.id === "303027173659246594") return;
		await msg.react('442114730757455873');
		return msg.react('❗')
	}else if(msg.content.toLowerCase().includes("steve!")) {
		if(msg.author.id === "303027173659246594") return;
		await msg.react('442114730757455873');
		return msg.react('❓');
	}else if(msg.content.toLowerCase().includes("steve")) {
		if(msg.author.id === "303027173659246594") return;
		return msg.react('442114730757455873');
	}
}