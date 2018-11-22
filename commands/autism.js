let count = 0;
const fs = require('fs');
const {getFile} = require('../modules/default');
exports.init = (client) => {
	getFile("autism.count",0).then(file => {
		count = file;
	}).catch(err => {
		console.error('[cmd/autism]',err.message)
	})
}
exports.run = async(client,msg,args) => {
    if(args[0] === "add") {
		++count;
		fs.writeFile(__dirname + '/../db/autism.count',count,(err) => {
			if(err) return msg.channel.send('Failed to keep track');
			return msg.channel.send(`+1 acousticness, now ${count}`)
		})
        return;
    }
	const min = count * 30;
	const hours = (min / 60);
    return msg.channel.send(`${count} autisms, eqv. to ${hours.toFixed(2)} hours.`)
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'autism',
	aliases:[],
	description: 'Counter',
	usage:''
};
 