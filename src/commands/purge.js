exports.run = async(client,msg,args) => {
	if(!msg.member.hasPermission('MANAGE_MESSAGES')) return msg.reply("You don't have permission!")
	if(!msg.guild.me.hasPermission(["MANAGE_MESSAGES"],false,true)) return msg.channel.send("I don't have permission to ``MANAGE_MESSAGES``");
	let user = args[1]||null;
	if(["*","all"].includes(user)) user = null;

	const num = parseInt(args[0]);
	if(isNaN(num)) return msg.channel.send('That is not a valid number');
	if (num <= 0 || num > 100) return msg.channel.send('Number must be between 0 and 100');

	msg.channel.fetchMessages({
		before: msg.id,
		limit: num
	})
	.then(function (messages) {
		let deleteList = [];
		let amount = 0;
		let message = messages.array()
		for(let i=0;i<message.length;i++) {
			if(!user) {
				amount++;
				deleteList.push(message[i]);
			} else {
				if(msg.mentions && msg.mentions.members.array()[0]) {
					if(msg.mentions.members.array()[0].id === message[i].author.id) {
						amount++;
						deleteList.push(message[i]);
					}
				}else{
					msg.channel.send("No users were mentioned")
				}
			}

		}
		msg.channel.bulkDelete(deleteList).catch(() => {})
		msg.channel.send(`** Cleared ${amount} messages**`).then(m => m.delete(10000))
		.catch(() => {})
	});

};

exports.config = {
	enabled: true,
	usageIfNotSet: true,
	permissions:2,
	group:'moderation'
};

exports.help = {
	name: 'purge',
	aliases:[],
	description: 'Remove messages from everyone or a certain user up to 100 in a channel.',
	usage:'purge <amount> [user/* for all]'
};
 