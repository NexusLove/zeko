const moment = require('moment');
exports.run = async (client, msg, args) => {
    try {
        const channel = (args[1]) ? client.channels.get(args[1]) : msg.channel;
        if(!channel) return msg.channel.send("Could not find that channel");
        const message = await channel.fetchMessage(args[0])
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
    }catch(err) {
        msg.channel.send(`Sorry, I could not find that message`);
    }
};

exports.config = {
	usageIfNotSet: true
};

exports.help = {
	name: 'edits',
	description: 'View the edit history of a message',
	usage:'edits <message ID> ',
};
