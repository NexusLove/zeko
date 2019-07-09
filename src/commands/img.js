exports.run = (client,msg,args) => {
    if(args.length == 0) return help(msg);
	switch(args[0].toLowerCase()) {
        default:
            help(msg);
    }
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: ['image','meme'],
	description: 'custom image editing',
	usage:'image help'
};
 
function help(msg) {
    msg.channel.send("no")
}