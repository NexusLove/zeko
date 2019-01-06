const got = require('got');
const key = "$tj78Ag*9%jG*h^g3gQ8YDn@X"
let phones = {_lastUpdate:null}
exports.run = async(client,msg,args) => {
	if(args.length === 0) return msg.channel.send("Try like call or text");
	if(!phones['_lastUpdate'] || (Date.now() - phones['_lastUpdate']) > 1728000000) {
		try {
			const db = await got(`http://localhost:3004/api/db`,{json:true,query:{code:key}});
			phones = db.body.phones;
			phones['_lastUpdate'] = Date.now();
		}catch(err) {
			console.error(`[twillio] ${err.statusCode}: ${err.message}`)
			msg.channel.send(`⚠ Failed to update list of phone number names (${err.statusCode})`);
		}
	}
	console.log(phones)
	switch(args[0].toLowerCase()) {
		case "text":
			let phone = parsePhone(args[1]);
			
		case "call":

		default:
			msg.channel.send("UNKNOWN THINGY");
	}
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'twillio',
	aliases:['tw'],
	description: 'dont',
	usage:''
};
 
function parsePhone(input) {
	let number = parseInt(input);
	if(isNaN(number)) {
		number = phones[input.toLowerCase()];
		if(!number) return null; //no number
	}
	//validate number
	return number;
	
}