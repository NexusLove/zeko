const q = require('../modules/quote');

const ALLOWED = ['117024299788926978'];
const TYPES = ['text','image','reddit']
const IMGS = {
	text:'<:text:449416725948268554>',
	image:'<:image:449416725868314634>',
	reddit:'<:reddit:449416725927297034>'
}
exports.run = (client,msg,args) => {
	if(args[0]) {
		if(args[0].toLowerCase() === "add") {
			if(!ALLOWED.includes(msg.author.id)) return msg.channel.send('⛔ You do not have permission.');
			if(!args[1] || !TYPES.includes(args[1].toLowerCase())) return msg.channel.send('Add a type of either: **' + TYPES.join(", ") + "**");
			if(!args[2]) return msg.channel.send('Please add the description');
			q.db.push('/quotes[]',{type:args[1].toLowerCase(),value:args.slice(2).join(" "),date:getDate()});
			return msg.channel.send('✅ Added quote to db')
		}else if(args[0].toLowerCase() === "list") {
			const QUOTES = q.db.getData('/quotes');
			let i = 0;
			QUOTES.forEach(v => {
				if(v.type === 'image') v.value = `<${v.value}>`;
				if(v.value.length > 100) v.value = v.value.slice(0,100) + "...";
			});
			let quoteArray = QUOTES.map(v => {
				i++;
				return `**${i.toString().padStart(2,0)}.** [${v.type}] ${v.value}`
			})
			return msg.channel.send('**__Quotes__**\n' + quoteArray.join("\n"),{split:true})
			.catch(err => {
				console.log(err.message)
				return msg.channel.send('Failed to send quote list - <@!117024299788926978>')
			})
		}
		const QUOTES = q.db.getData('/quotes');
		const num = parseInt(args[0]);
		if(isNaN(num)) return msg.channel.send('Unknown argument. Try: add, list, <# of quote>')
		const quote = QUOTES[num - 1];
		if(quote) {
			if(quote.type === 'text') {
				return msg.channel.send({embed:{
					title:`Random Prestoné Quote - Text`,
					description:`"${quote.value}"`,
					footer:{text:quote.date},
				}})
			}else if(quote.type === 'image') {
				//console.log(quote.value)
				return msg.channel.send(new Attachment(quote.value))
			}else if(quote.type === 'reddit') {
				return msg.channel.send({embed:{
					title:`Random Prestoné Quote - Reddit`,
					description:`[${quote.value}](https://reddit.com/${quote.value})`,
					footer:{text:'/u/MingledStream9'},
				}})
			}
		}
		return msg.channel.send("Unknown quote name")
	}
	
	q.postQuote(client,msg.channel);
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'quote',
	aliases:['q'],
	description: 'Get a random Prestone Quote',
	usage:'q\nq add <type:text,reddit,img> <text/url>\nq list'
};
 
function getDate(d) {
	const date = new Date(d||Date.now());
	return (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
}