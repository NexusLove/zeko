const tetris = require('../modules/tetris.js');
exports.run = (client,msg,args) => {
    const game = new tetris(client,msg.author,msg.channel);
    console.log(game.size)
    return msg.channel.send(game.print());
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'tetris',
	aliases:[],
	description: '',
	usage:''
};
 