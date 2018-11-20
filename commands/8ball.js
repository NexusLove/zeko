
exports.run = (client,msg,args) => {
	//return msg.channel.send(`🎱 You are gay`);
	if(msg.author.id == 303027173659246594) {
		return msg.channel.send(`🎱 You are gay`);
	}
	let answers = [ "As I see it, yes", "It is certain", "It is decidedly so", "Most likely", "Outlook good", "Signs point to yes", "Without a doubt", "Yes", "Yes - definitely", "You may rely on it", "Reply hazy, try again", "Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again","Don't count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"];
	msg.channel.send(`🎱 ${answers[Math.floor(Math.random()*answers.length)]}`);
};

exports.config = {
	enabled: true,
	usageIfNotSet: false,
	permissions:0,
	group:'fun'
};

exports.help = {
	name: '8ball',
	aliases:['eightball','ball8'],
	description: 'The all seeing 8ball',
	usage:'8ball <question>'
};
 