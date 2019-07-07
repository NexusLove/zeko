const fs = require('fs').promises;
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const db = low(new FileSync('./db/reminders.json'));
db.defaults({})
/*

*/
exports.run = (client,msg,args) => {
    if(args.length > 0) return msg.channel.send("seromrqer");
    if(args[0].toLowerCase() === "list") {
        db.get("reminders")
    }
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'remind',
	aliases:['r'],
	description: '',
	usage:''
};
 