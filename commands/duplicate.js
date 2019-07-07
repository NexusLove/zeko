const default_percent = 50;
const stringSim = require('string-similarity');
const extractor = require("keyword-extractor");

const fs = require('fs').promises;

exports.run = (client,msg,args) => {
	const finalMatches = [];
	/*
	[
		["one two test", "two testing test"]
	]
	*/
	let percent = (args[0] && parseInt(args[0]) !== NaN) ? parseInt(args[0]) : default_percent;
 	fs.readJSON('./db/suggestions.json','utf-8')
	.then(async list => {
		for (let i = 0; i < list.length; i++) {
			const matchTest = list[i];
			let localMatches = [];
			for(let b = 0;b < list.length; b++) {
				if(b == i) continue;
				const strings = list[b];

				const matchKeys = extractor.extract(matchTest);
				const thisKeys  = extractor.extract(strings);

				//possibly count matches instead

				const results = stringSim.compareTwoStrings(matchKeys.join(" "),thisKeys.join(" "));
				if((results*100) >= percent) {
					localMatches.push(strings);
				}
			}
			if(localMatches.length > 0) finalMatches.push({text:matchTest,matches:localMatches});
		}
		await fs.writeJSON('./db/duplicate_results.json',finalMatches,'utf-8');
		msg.channel.send(`(${percent}%) Stored ${finalMatches.length} matches to duplicate_results.json`,{
			files: [{
				attachment: new Buffer(JSON.stringify(finalMatches)),
				name: `matches_${percent}.json`
			}]
		})
	})
};

exports.config = {
	enabled: true,
	usageIfNotSet: false,
	permissions:0,
	group:'fun'
};

exports.help = {
	name: 'duplicate',
	aliases:[],
	description: '',
	usage:''
};
 