require('dotenv').load();
const stringSim = require('string-similarity');
const similarity = require('similarity');
const jaroWinkler = require("jaro-winkler");
const extractor = require("keyword-extractor");

const AlexaPlay = require('../modules/alexa.js');
const stats = require('../modules/stats.js').db;
let notified = [];
module.exports = async (client, msg) => {
	if(msg.author.bot) return;
	if(msg.author.id === "165535234593521673" && msg.content === "¯\\_(ツ)_/¯")  {
		msg.channel.send("¯\\_(ツ)_/¯")
	}
	if(msg.content.toLowerCase().startsWith("alexa") || msg.content.toLowerCase().startsWith("zeko")) {
		if(msg.content.toLowerCase().startsWith("alexa")) {
			if(!notified.includes(msg.author.id)) {
				notified.push(msg.author.id);
				msg.channel.send("Alexa is gay, try `zeko` instead of using `alexa`");
			}
		}
		const args = msg.content.split(/ +/g);
		args.shift();
		try {
			AlexaPlay(client,msg,args);
		}catch(err) {
			msg.channel.send(`~~Alexa~~ Zeko ran into an error ~~and must terminate all humans~~\`\`\`\n${err.message}\`\`\``);
		}
		
	} else if(msg.guild && msg.guild.id !== '137389758228725761' && !msg.content.includes(process.env.PREFIX)) {
		if(/(despacito|des.{1,5}pa.{1,5}cito)/gm.test(msg.content.toLowerCase().replace(/\s/gm,''))){
			msg.delete();
			return msg.reply('**__no despacito__**').then(m => m.delete(15000))
		}
		/*if(msg.content.toLowerCase().replace(/(despacito|des.{1,3}pa.{1,3}cito)/gm.test(msg.content.toLowerCase()))) {
			
		}*/
	}else if(msg.channel.id === "497379777058045992") {
		if(msg.content.startsWith(".") || msg.content.startsWith(">")) return;
		let msgBefore = await msg.channel.fetchMessages({limit:5,before:msg.id});
		msgBefore = msgBefore.filter(v => !v.author.bot && !v.content.startsWith(".") && !v.content.startsWith(">"));
		if(!msgBefore || msgBefore.size == 0) return;
		msgBefore = msgBefore.first().content;
		const stringsim_results = stringSim.compareTwoStrings(msgBefore,msg.content);
		const sim_results = similarity(msgBefore,msg.content);
		const jaro_results = jaroWinkler(msgBefore,msg);

		const prev_keywords = extractor.extract(msgBefore);
		const this_keywords = extractor.extract(msg.content);
		console.log("[keywordSim/prev]",prev_keywords);
		console.log("[keywordSim/this]",this_keywords);
		const keywordSim = stringSim.compareTwoStrings(prev_keywords.join(" "),this_keywords.join(" "));
		console.log(keywordSim)
		msg.channel.send(`**string-similarity: ** ${(stringsim_results*100).toFixed(4)}% | **similarity: ** ${(sim_results*100).toFixed(4)}% | ` +
		`**jaroWinkler: ** ${(jaro_results*100).toFixed(4)}% | **keyword+string-similarity** ${(keywordSim*100).toFixed(4)}%`)
		return;
	}
	

	const args = msg.content.split(/ +/g);
	if(args.length === 0) return;
	const command = args.shift().slice(process.env.PREFIX.length).toLowerCase();
	const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

	if(msg.content.startsWith(process.env.PREFIX) && cmd) {
		try {
			let flags = {};
            for(let i=0;i<args.length;i++) {
                const flag = args[i].split("=");
                if(flag.length == 2) {
					if(!cmd.config.flags) return flags[flag[0].toLowerCase()] = flag[1];
					args.splice(i,1);
                    switch(cmd.config.flags[flag[0].toLowerCase()]) {
                        case "number":
                            flags[flag[0].toLowerCase()] = parseInt(flag[1]);
							break;
						case "boolean":
							flags[flag[0].toLowerCase()] = (flag[1] == 'true')
							break;
                        default:
                            console.log("default")
                            flags[flag[0].toLowerCase()] = flag[1];
                    }
                }
            }
			return cmd.run(client,msg,args,flags)
		}catch(err) {
			msg.channel.send('**Command Error**\n`' + err.message + "`");
		}
		return; 
	}
	const optout = stats.get("optout").has(msg.author.id).value();

	const authorStats = stats.get("users").has(msg.author.id).value();
	if(!authorStats) {
		if(!optout) stats.get("users").set(msg.author.id,{imgs:0,msgs:1}).write();
		stats.get("global").update("msgs",m => m+=1).write();
	}else{
		if(!optout) stats.get("users").get(msg.author.id).update("msgs",m => m+=1).write();
		stats.get("global").update("msgs",m => m+=1).write();
	}

	if(msg.attachments.size > 0) {
		const authorStats = stats.get("users").has(msg.author.id).value();
		if(!authorStats) {
			stats.get("users").set(msg.author.id,{imgs:1,msgs:1}).write();
			stats.get("global").update("imgs",m => m+=1).write();
		}else{
			stats.get("users").get(msg.author.id).update("imgs",m => m+=1).write();
			stats.get("global").update("imgs",m => m+=1).write();
		}
	}

	/*if(msg.author.id === '177552117555396608') {
		await msg.react('292088385772716042');
		await msg.react('410580614983712768');
		await msg.react('❌');
		await msg.react('❓');
		await msg.react('❗');
		return msg.react('442114730757455873');
	}*/
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