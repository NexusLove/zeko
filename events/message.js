require('dotenv').load();
//string test example
const stringSim = require('string-similarity');
const similarity = require('similarity');
const jaroWinkler = require("jaro-winkler");
const extractor = require("keyword-extractor");

//modules
const stats = require('../modules/stats.js').db;

//data
let notified_dm = [];
module.exports = async (client, msg) => {
	if(msg.author.bot) return;
	if(msg.author.id === "165535234593521673" && msg.content === "¯\\_(ツ)_/¯")  {
		msg.channel.send("¯\\_(ツ)_/¯")
	}
	client.moduleManager.messageHandler(client,msg);
	if(msg.guild && msg.guild.id !== '137389758228725761' && !msg.content.includes(process.env.PREFIX)) {
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
			const newArgs = args.slice();
            for(let i=0;i<args.length;i++) {
                const flag = args[i].split("=");
                if(flag.length === 2) {
					if(!/^[A-Za-z]+$/.test(flag[0].toLowerCase())) continue; //flag must be alpha chars
					if(!flag[0] || !flag[1] || flag[0].length === 0 || flag[1].length === 0) continue;
					if(!cmd.config.flags) {
						flags[flag[0].toLowerCase()] = flag[1];
						continue;
					}
					newArgs.splice(i,1);
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
			return cmd.run(client,msg,newArgs,flags)
		}catch(err) {
			msg.channel.send('**Command Error**\n`' + err.message + "`");
		}
		return; 
	}
	if(msg.channel.type === "dm" ) {
		if(notified_dm.includes(msg.author.id)) return;
		notified_dm.push(msg.author.id);
		return msg.channel.send("Okay, I'm telling everyone about that.");
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