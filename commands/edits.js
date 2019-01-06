const moment = require('moment');
exports.run = async (client, msg, args) => {
    const message = await msg.channel.fetchMessage(args[0]); //temp
    if(!message) return msg.channel.send(`Sorry, I could not find that message`);
    if(!message.edits || message.edits.length <= 1) return msg.channel.send('That message has not been edited');
    msg.channel.send({embed:{
        author:{
            name:message.author.tag,
            icon_url:message.author.avatarURL
        },
        color:client.color,
        fields:[
            {
                name:`Latest `,
                value:message.content
            },
            {
                name:`Original`,
                value:message.edits[message.edits.length - 1].content
            }
        ],
        footer:{text:`Edits (${message.edits.length}) | ${message.id} | Edited ${moment(message.editedAt).fromNow()}`}
    }})
};

exports.config = {
	usageIfNotSet: true
};

exports.help = {
	name: 'edits',
	aliases:[],
	description: 'View the edit history of a message',
	usage:'edits <message ID> ',
};
