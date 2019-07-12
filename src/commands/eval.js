const Discord = require("discord.js");
//const got = require('got'); //gists
let OWNER_IDS = [];
exports.init = (client,logger) => {
	try {
		const ids = client.env.get("OWNER_IDS").required().asArray();
	}catch(err) {
		logger.warn("Missing environment var OWNER_IDS, therefore eval will not work.");
	}
}
exports.run = async (client, msg, args, flags, logger) => {
	if(OWNER_IDS.length == 0) {
		return msg.channel.send("There is no users given access to this command")
	}else if(!OWNER_IDS.includes(msg.author.id)) {
		return msg.channel.send("You do not have permission to use this command.");
	}

	let output = true;
	if(flags.output == false) output = false;
	const code = args.join(" ");
	if(!code) return msg.channel.send("❌ There is nothing to eval")

	if(!output) {
		logger.warn(`${msg.author.tag} ran eval: (Output:False): ${code}`);
		try {
			console.log(code)
			eval(code);
			msg.react("✅")
		}catch(err) {
			msg.react("❌")
			logger.error(`${msg.author.tag}'s eval failed: ${err.stack}`);
		}
		return;
	}
	try {
		msg.delete().catch(() => {});
		logger.warn(`${msg.author.tag} ran eval: ${code}`);
		const measure_start = Date.now();
		let evaled = await eval(code);
		const time_taken = (Date.now() - measure_start).toFixed(2);
		const type = typeof(evaled);
		evaled = client.clean(evaled);
		if(evaled.length >= 1024) { 
			evaled = evaled.slice(0,1000) + "...";
		}
		msg.channel.send({embed:{
			author:{
				name:msg.author.username,
				icon_url:msg.author.avatarURL
			},
			color:client.color,
			fields:[
				{
					name:"📥 INPUT",
					value:`\`\`\`js\n${code}\`\`\``,
					inline:true
				},
				{
					name:`📤 OUTPUT <${type}>`,
					value:`\`\`\`js\n${evaled}\n\`\`\``,
					inline:true
				}
			],
			footer:{text:`Took ${time_taken}ms | d.js v${Discord.version} | node ${process.version}`}
		}});
		
	}catch(err) {
		msg.channel.send({embed:{
			author:{
				name:msg.author.username,
				icon_url:msg.author.avatarURL
			},
			color:client.color,
			fields:[
				{
					name:"📥 INPUT",
					value:`\`\`\`js\n${code}\`\`\``,
					inline:true
				},
				{
					name:`📤 OUTPUT`,
					value:`\`\`\`js\n${client.clean(err.message)}\n\`\`\``,
					inline:true
				}
			],
			footer:{text:(err.constructor) ? err.constructor.name : 'Unknown type of error'}
		}});
		//console.warn(err.stack)
		//msg.channel.send(`\`ERROR\` \`\`\`xl\n${client.clean(err)}\n\`\`\``);
	}
};

exports.config = {
	usageIfNotSet: true,
	hidden:true,
	flags: {
		output: "boolean"
	}
};

exports.help = {
	name: 'eval',
	aliases:[],
	description: 'Evalutes code',
	usage:'eval <test command>',
};
 