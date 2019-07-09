const { format, distanceInWords } = require('date-fns')
const capFirst = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
const emojis = {
/*	online:'<:online:406916053340258315>',
	offline:'<:offline:406916053638316042>',
	away:'<:away:406916054237970442>',
	dnd:'<:dnd:406916053709488129>',
	streaming:'<:streaming:406916053294383115>',
	bot:'<:botTag:406916053403303957>'*/
};
const activityTypes = [
	"Playing",
	"Streaming",
	"Listening",
	"Watching"
]
exports.lookupUser = (member,msg) => {
	let guildmember_text = "${user.username} is not in this guild.";
	const user = member.user;
	if(member.guild) {
		const joinedCompare = distanceInWords(Date.now(),member.joinedAt,{addSuffix: true});
		const joinedFormatted = format(member.joinedAt,'MMMM Do[,] YYYY');
		guildmember_text = `${user.bot?'Added':'Joined'} **${joinedCompare}** on **${joinedFormatted}**
		\nRoles: ${member.roles.array().join(' ')}`
	}
	const createdCompare = distanceInWords(Date.now(),user.createdAt,{addSuffix: true});
	const createdFormatted = format(user.createdAt,'MMMM Do[,] YYYY');
	const user_text = `Created **${createdCompare}** on **${createdFormatted}**
		\nStatus **${capFirst(user.presence.status == "dnd" ? "Do Not Disturb":user.presence.status)}** ` + ((user.presence.game) ? `, **${activityTypes[user.presence.game.type]}** \`\`${user.presence.game.name}\`\`` : '');
	const result = {embed: {
		title:`${user.tag} ${(member && member.nickname)? `(${member.nickname})`:''} ${user.bot ? emojis.bot||"[BOT]":''}`,
		color:`${member? member.displayColor:0}`,
		thumbnail:{url:user.avatarURL},
		fields:[
			{
				name:"❯ Member Info",
				value:`${guildmember_text}`,
			},
			{
				name:"❯ User Info",
				value:`${user_text}`,
			}
	
		],
		footer: {
			text:`ID: ${user.id}`
		}
	}};
	if(msg) return msg.channel.send(result);
	return result;
}

exports.run = async(client,msg,args) => {
	const input = args.join(" ").toLowerCase();
	if(args.length == 0 || args[0].toLowerCase() == "me") {
		return this.lookupUser(msg.member,msg);
	}else if(msg.mentions.members.size > 0) {
		const member = msg.mentions.members.first();
		return this.lookupUser(member,msg);
	}else if(msg.mentions.users.size > 0) {
		const user = msg.mentions.users.first();
		return this.lookupUser(user,msg);
	}else{
		const user = msg.guild.members.find(v => (v.nickname && v.nickname.toLowerCase() === input) || v.user.username.toLowerCase() === input);
		if(user) return this.lookupUser(user,msg);
	}
	/*
	if(!args[0]) return user_lookup(msg.author);
	let user = client.users.get(input);
	if(user) return user_lookup(user);
	if(msg.mentions.users.size > 0) user = msg.mentions.users.first();
	if(user) return user_lookup(user);
	user = msg.guild.members.find(v => (v.nickname && v.nickname.toLowerCase() === input) || v.user.username.toLowerCase() === input);
	if(user) return user_lookup(user.user);*/
	return msg.channel.send("Could not find any users.");
};


exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: ['userinfo','uinfo'],
	description: 'Gives information about users',
	usage:''
};
 