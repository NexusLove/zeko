exports.run = (client,msg,args) => {
    if(msg.mentions.users.size == 0) return msg.channel.send("**Usage: **`" + this.help.usage + "`")
    const user = msg.mentions.users.first();
    msg.channel.send({embed:{
        title:`${user.tag}'s avatar`,
        description:user.avatarURL,
        image:{url:user.avatarURL}
    }})
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: ['avatar','avt'],
	description: 'Get the full sized avatar and an url of a user',
	usage:'avatar @user'
};
 