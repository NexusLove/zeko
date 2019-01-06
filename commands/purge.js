exports.run = async(client,msg,args) => {
	if(!msg.member.hasPermission('MANAGE_MESSAGES')) return msg.reply("You don't have permission!")
	if(!msg.guild.me.hasPermission(["MANAGE_MESSAGES"],false,true)) return msg.channel.send("I don't have permission to ``MANAGE_MESSAGES``");
	msg.delete();
	let n = parseInt(args[1]);
	if(isNaN(n)) return msg.reply('not a valid number');
	if (n <= 0 || n > 100) return msg.reply('number must be between 0 and 100');

	msg.channel.fetchMessages({
		before: msg.id,
		limit: n
	})
	.then(function (messages) {
		let deleteList = [];
		let amount = 0;
		let message = messages.array()
		for(let i=0;i<message.length;i++) {
			if(msg.mentions && msg.mentions.members.array()[0]) {
				if(msg.mentions.members.array()[0].id === message[i].author.id) {
					amount++;
					deleteList.push(message[i]);
				}
			}else if(args[0] === "*" || args[0] === "all" || args[0] === "any" || args[0] === "everything") {
				amount++;
				deleteList.push(message[i]);
				continue;
			}else{
				return msg.reply("Mention a user to clear, or put an asterik for all")
				break;
				//msg.channel.bulkDelete(messages);
			}

		}
		msg.channel.bulkDelete(deleteList).catch(err => {
			//silence the errors, shhh
		});

		msg.channel.send("** Cleared " + amount + " messages**").then(function (message) {
			message.delete(10000);
		}).catch(err => {

		});
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
	usage:'purge <user/* for all> <amount>'
};
 