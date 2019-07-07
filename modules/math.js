const { parse } = require('mathjs')
/*math.import({
    'import': function () { throw new Error('Function import is disabled') },
    'createUnit': function () { throw new Error('Function createUnit is disabled') },
    'eval': function () { throw new Error('Function eval is disabled') },
    'derivative': function () { throw new Error('Function derivative is disabled') }
}, { override: true })*/

exports.config = {
    triggers:["=","=math","math"],
    dependencies:["mathjs"],
    command:true
}
const temp = [];
exports.run = async(client,msg,args) => {
    if(args.length === 0) {
        return msg.channel.send("Please enter an equation");
    }
    try {
        if(!temp.includes(msg.author.id)) {
            temp.push(msg.author.id)
            return msg.channel.send("Please watch this video to get your equation or pay $2.99:\nhttps://zeko.jackz.me/video-ad?type=math&clientid=" + msg.author.id);
        }
        //msg.channel.startTyping();
        const parsed = parse(args.join(" ").replace(/`/g,""));
        const node = parsed.compile().eval();
        msg.channel.send(`**Result: ** ${node}`)
        //msg.channel.stopTyping();
    }catch(err) {
        //msg.channel.stopTyping();
        msg.channel.send({embed:{
            title:"Could not parse your equation",
            color:16711731,
            description:err.message,
            footer:{text:`Input: ${args.join(" ")}`}
        }});
    }
}