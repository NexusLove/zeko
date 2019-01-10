const math = require('mathjs');
math.import({
    'import': function () { throw new Error('Function import is disabled') },
    'createUnit': function () { throw new Error('Function createUnit is disabled') },
    'eval': function () { throw new Error('Function eval is disabled') },
    'derivative': function () { throw new Error('Function derivative is disabled') }
}, { override: true })

exports.config = {
    triggers:["=","=math"],
    dependencies:["mathjs"],
    command:true
}
exports.run = async(client,msg,args) => {
    if(args.length === 0) {
        return msg.channel.send("Please enter an equation");
    }
    try {
        msg.channel.startTyping();
        const parsed = math.parse(args.join(" "));
        const node = parsed.compile().eval();
        msg.channel.send(`**Result: ** ${node}`)
        msg.channel.stopTyping();
    }catch(err) {
        msg.channel.stopTyping();
        msg.channel.send({embed:{
            title:"Could not parse your equation",
            color:16711731,
            description:err.message,
            footer:{text:`Input: ${args.join(" ")}`}
        }});
    }
}