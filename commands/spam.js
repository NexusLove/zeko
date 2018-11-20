exports.run = (client,msg,args) => {
    if(msg.author.id !== '117024299788926978') return msg.channel.send('🚫 You do not have permission');
    if(args.length < 2) return msg.channel.send('Usage: `spam @user #amount [msg]`');
    let user = (msg.mentions.users.size > 0) ? msg.mentions.users.first() : msg.guild.members.find(v => v.user.username.toLowerCase() === args[0].toLowerCase()  || v.id === args[0].toLowerCase() || (v.nickname && v.nickname.toLowerCase() === args[0].toLowerCase()) );
    let amount = parseInt(args[1]);
    let message = args.slice(2).join(" ");

    if(!user) return msg.channel.send('User not found');
    if(isNaN(amount) || amount < 0) return msg.channel.send('Invalid amount');
    if(amount > 150) {
        amount = 150;
        msg.channel.send('Amount capped at 150.'); 
    }
    for(let i=0;i<amount;i++) {
        msg.channel.send(`<@!${user.id}> ${message||""}`);
    }
    return msg.channel.send(`✅ Successfully annoyed the fuck out of <@!${user.id}>`)
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'spam',
	aliases:[],
	description: 'Against the TOS but fuck it',
	usage:'spam #amount @user'
};
 