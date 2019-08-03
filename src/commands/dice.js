const { Random } = require("random-js");
const random = new Random();
const {stripIndents} = require('common-tags')
const wordconverter = require('number-to-words')
exports.run = (client,msg,args,flags,logger) => {
	const dice_amount = args[0] != null ? parseInt(args[0]) : 1;
	const sides_amount = args[1] != null ? parseInt(args[1]) : 6;
	let total = 0;
	let sides = {}
	//loop X times (x = dice_amount), getting a random number between 1-sides_amount
	for(let i=0;i<dice_amount;i++) {
		const amount = random.integer(1,sides_amount)
		if(!sides[amount]) {
			sides[amount] = 1;
		}else{
			sides[amount]++;
		}
		total+=amount;
	}
	const side_msg = [];
	for(const side in sides) {
		const convertedWord = wordconverter.toWords(side); //get in word form, then uppercase first letter
		const sideName = convertedWord.charAt(0).toUpperCase() + convertedWord.slice(1);
		side_msg.push(`**${sideName}** rolled **${sides[side]}** times`)
	}
	msg.channel.send(stripIndents
		`__Rolled **${dice_amount>1?dice_amount:'a'}** ${dice_amount>1?'Dice':'Die'} with **${sides_amount}** sides__
		${side_msg.join("\n")}
		__**Total:** ${total}__`
	)
};

exports.config = {
	usageIfNotSet: true
};

exports.help = {
	name: ['dice','die','roll','rld'],
	description: 'Roll virtual dice or a die',
	usage:'die [# of dice] [# of sides]'
};
 