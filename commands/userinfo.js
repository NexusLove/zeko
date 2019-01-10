const moment = require('moment');
require('moment-duration-format');
const capFirst = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
const emojis = {
	online:'<:online:406916053340258315>',
	offline:'<:offline:406916053638316042>',
	away:'<:away:406916054237970442>',
	dnd:'<:dnd:406916053709488129>',
	streaming:'<:streaming:406916053294383115>',
	bot:'<:botTag:406916053403303957>'
};
const activityTypes = [
	"Playing",
	"Streaming",
	"Listening",
	"Watching"
]

exports.run = async(client,msg,args) => {
	let input = args.join(" ").toLowerCase();
	let user_lookup = async (user) => {
		let member_info,
			user_info;
		if(msg.guild.members.has(user.id)) {
			let minfo = msg.guild.members.get(user.id);
			member_info = `${user.bot?'Added':'Joined'} **${moment(minfo.joinedAt).fromNow()}** on **${moment(minfo.joinedAt).format('MMMM Do[,] YYYY')}**
			\nRoles: ${minfo.roles.array().join(' ')}
			\nBot Perm Lvl: **${await client.wordPermCheck(minfo)}** ` + ((await client.permCheck(minfo,true) === 5) ? ' (**Bot Staff**)' : '');
		
		}else{
			member_info = `${user.username} is not in this guild`;
		}
		//
		user_info = `Created **${moment(user.createdAt).fromNow()}** on **${moment(user.createdAt).format('MMMM Do[,] YYYY')}**
		\n${emojis[user.presence.status]||''}**${capFirst(user.presence.status)}** ` + ((user.presence.game) ? `, **${activityTypes[user.presence.game.type]}** \`\`${user.presence.game.name}\`\`` : '');


		return msg.channel.send({embed: {
			title:`${user.tag} ${(minfo.nickname)?`(${minfo.nickname})`:''} ${((user.bot) ? emojis.bot:'')}`,
			color:`${((minfo)? minfo.displayColor:client.color)}`,
			thumbnail:{url:user.avatarURL},
			fields:[
				{
					name:"❯ Member Info",
					value:`${member_info}`,
				},
				{
					name:"❯ User Info",
					value:`${user_info}`,
				}

			],
			footer: {
				text:`ID: ${user.id}`
			}
		}});
		//check if member of guild, if so stats
	}
	if(!args[0]) return user_lookup(msg.author);
	let user = client.users.get(input);
	if(user) return user_lookup(user);
	if(msg.mentions.users.size > 0) user = msg.mentions.users.first();
	if(user) return user_lookup(user);
	user = msg.guild.members.find(v => (v.nickname && v.nickname.toLowerCase() === input) || v.user.username.toLowerCase() === input);
	if(user) return user_lookup(user.user);
	return msg.reply("Couldn't find anything for ``" + input + '``');
};


exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'userinfo',
	aliases:['uinfo'],
	description: 'Gives information about users',
	usage:''
};
 