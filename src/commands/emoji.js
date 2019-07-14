exports.run = (client,msg,args) => {
    if(!msg.member.hasPermission('MANAGE_EMOJIS')) return msg.reply("You don't have permission to manage emoijs")
	if(args.length == 2) {
        msg.guild.createEmoji(args[0],args[1])
        .then(r => {
            msg.channel.send("Success. " + r.toString())
        }).catch(err => {
            msg.channel.send("**Failed to add emoji**\n" + err.message)
        })
    }else {
        return msg.channel.send("**Usage: ** `" + this.help.usage + "`");
    }
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: ['emoji','emote'],
	description: '',
	usage:'emoji <url> <name>'
};
 