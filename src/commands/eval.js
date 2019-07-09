const Discord = require("discord.js");
//const got = require('got'); //gists

const util = require('util'); //used for easy global access
exports.run = async (client, msg, args, flags, logger) => {
	if(msg.author.id !== "117024299788926978") return;
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
 
/*
if(evaled.length >= 1024 || force_gist) {
			msg.channel.startTyping();
			let body = {
				public:false,
				description:`Output from ${client.user.username}'s eval. https://bot.jackz.me`,
				files:{
					[`insertbotnamehere_${msg.id}.md`]:{
						content:stripIndents`Output for message ID ${msg.id} in channel **#${msg.channel.name}** (${msg.channel.id})

						Guild: **${msg.guild.name}** (${msg.guild.id}) at ${moment().format("[**]h:mm A [**on**] MMMM Do[,] YYYY[**]")}

						User: **${msg.author.tag}** (${msg.author.id})  Nickname: **${msg.member.nickname||'_none_'}**
						# Input
						\`\`\`${code}\`\`\`
						# Output (${type})
						\`\`\`${evaled}`
					}
				}
			}
			return got(`https://api.github.com/gists`,{json:true,body,headers: {'user-agent': `InsertBotNameHere Discord Bot/${client.version} (https://insertbotnamehere.jackz.me)`}})
			.then(r => {
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
							value:(force_gist) ? `Gist was forced\n${r.body.html.url}` : `Output was too long (${client.numberSplit(evaled.length)} characters):\n<${r.body.html_url}>`,
							inline:true
						}
					],
					footer:{text:`Took ${time_taken}ms | d.js v${Discord.version} | node ${process.version}`}
				}});
				msg.channel.stopTyping();
			}).catch(err => {
				msg.channel.stopTyping();
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
							value:`Could not produce gist for output`,
							inline:true
						}
					],
					footer:{text:`d.js v${Discord.version} | node ${process.version} | bot v${client.version}`}
				}});
				if(client.dev) return console.log(err.stack);
				console.log(err.message);
			})
		}
*/