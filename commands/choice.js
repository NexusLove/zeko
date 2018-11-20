exports.run = (client,msg,args) => {
	const choices = args.join(" ").split("|");
	let options = [];
	for (let i = 0; i < choices.length; i++) {
		choices[i] = choices[i].trim().slice(0,30);
		let index = options.indexOf(choices[i]);
		if(index === -1 && index !== i) {
			options.push(choices[i])
		}
	}
    if(options.length <= 1) return msg.channel.send("Uh, there is only one choice, forgot something?");
    msg.channel.send(`I choose \`\`${options[Math.floor(Math.random()*options.length)].trim()}\`\` `)
};

exports.config = {
	enabled: true,
	usageIfNotSet: true,
	permissions:0,
	group:'fun'
};

exports.help = {
	name: 'choice',
	aliases:['choose'],
	description: 'Bot will choose between all the choices given',
	usage:'choice choice one | choice two | and so on...'
};