const letters = ["🇦","🇧","🇨","🇩","🇪","🇫","🇬","🇭","🇮","🇯","🇰","🇱","🇲","🇳","🇴","🇵","🇶","🇷","🇸","🇹","🇺","🇻","🇼","🇽","🇾","🇿"]
const asyncjs = require('async');

exports.run = (client,msg,args) => {
    msg.delete().catch(err => {});
    let choices = args.join(" ").split("|");
    const pollName = choices[0].slice(0,50);
    choices.shift();
    let options = [];
    for(let i=0;i<choices.length;i++) {
        choices[i] = (choices[i].length > 40) ? `${choices[i].trim().substring(0,37)}...` : choices[i].trim();
        let index = options.indexOf(choices[i]);
        if(index === -1 && index !== i) {
           options.push(choices[i])
        }
        
    }
    if(options.length <= 1) return msg.channel.send({embed:{title:`${this.help.name}`,description:`${this.help.description}\n\n**Usage:** \`\`${this.help.usage}\`\``}})
    let index = 0;
    if(options.length > 6) return msg.channel.send('Poll can only have a maximum of 6 choices.');
    options = options.map(v => `${letters[index++]} - ${v}`)
	msg.channel.send(`${msg.author} has started a poll:`,{embed: {
        color:client.color,
        title:pollName.trim(),
        description:options.join("\n")
    }}).then(m => {
        //react
        asyncjs.eachOfSeries(options,(result,i,callback) => {
            m.react(letters[i]).then(() => callback()); 
        }, (err) => {
            if(err) console.warn(`[Poll] ${err}`);
        });
        return;
    });
};

exports.config = {
    usageIfNotSet: true
};

exports.help = {
	name: 'poll',
	aliases:['polls'],
	description: 'Makes a poll of choices, up to 6 choices.',
	usage:'poll Name of poll | Choice A | Choice B'
};
