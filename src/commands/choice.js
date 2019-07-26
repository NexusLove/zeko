// ES6 Modules
const { Random } = require("random-js");
const random = new Random(); // uses the nativeMath engine
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
	const rnd = random.integer(0, options.length-1);
    msg.channel.send(`I choose \`\`${options[rnd].trim()}\`\` `)
};

exports.config = {
	usageIfNotSet: true,
};

exports.help = {
	name: ['choice','choose'],
	description: 'Bot will choose between all the choices given',
	usage:'choice choice one | choice two | and so on...'
};