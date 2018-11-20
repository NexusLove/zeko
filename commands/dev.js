const CHAR0 = 'ㅤ';
const CHAR1 = 'ﾠ';
const RGX_CHAR0 = new RegExp(`${CHAR0}`,'g');
const RGX_CHAR1 = new RegExp(`${CHAR1}`,'g');
require('dotenv').load();
const got = require('got')
const {getSong} = require('../modules/alexa.cache.js');

exports.run = async(client,msg,args) => {
if(!args[0]) return msg.channel.send('❌ Not');
switch(args[0].toLowerCase()) {
    case "rejoin":
        if(args[1] && args[1] === "activate") {
            if(msg.author.id !== "117024299788926978") return msg.channel.send("NO PERM");
            return;
        } 
        msg.channel.send("Go to http://mc.jackz.me:8010/rejoin/login")
        break;
    case "join":
        break;
    case "math": {
        let series = [];
        let input = args.slice(1).join(" ").split(",");
        input.forEach(v => {
            let b = parseInt(v);
            if(b !== NaN) series.push(b);
        })
        const r = series[1] - series[0]; //
        const a1 = series[0];
        let converges = (series >= 1);
        let n = 0; //# of terms
        let findN = [a1];
        console.log('r',r);
        
        console.log('a1',a1);
        console.log((converges) ? 'Converges':'Deverges');
        series.forEach(v => {
            const val = findN[findN.length - 1] * r;
        
            if(val > series[series.length - 1]) return;
            findN.push(val)
        })
        n = (findN[findN.length - 1] !== series[series.length - 1]) ? 'Error' : findN.length;
        console.log('n',n);
        return msg.channel.send({embed:{
            title:series.join(","),
            description:`**${(converges) ? 'Converges':'Diverges'}**\n**a1** ${a1}\n**r** ${r}\n**n** ${n}`
        }});
    }case "encode": {
        const output = unicodeToBinary(args.slice(1).join(" "));
        if(output.length > 2048) {
            let post = await got('https://api.paste.ee/v1/pastes',{method:'POST',json:true,headers:{'X-Auth-Token':process.env.PASTEE},body:{description:'JackzTest - Generated',sections:[{name:'Contents',contents:output}]}});
            msg.delete();
            return msg.channel.send(`<${post.body.link}>`);
        }
        
        msg.delete();
        return msg.channel.send({embed:{description:output}});
    }case "decode": {
        const output = binaryToUnicode(args.slice(1).join(" "));
        if(output.length > 2048) {
            let post = await got('https://api.paste.ee/v1/pastes',{method:'POST',json:true,headers:{'X-Auth-Token':process.env.PASTEE},body:{description:'JackzTest - Generated',sections:[{name:'Contents',contents:output}]}});
            msg.delete();
            return msg.channel.send(`<${post.body.link}>`);
        }
        msg.delete();
        return msg.channel.send({embed:{description:output}});
    }case "steves": {
        const failedUsers = msg.guild.members.filter(v => {
            const name = v.nickname||v.user.username; 
            console.log(name,name.toLowerCase().includes("steve"))
            return !name.toLowerCase().includes("steve")
        });
        console.log(failedUsers.map(v => v.user.username))
        msg.channel.send(
            "These ~~losers~~ users do not follow the Steve Rule:\n```\n" + 
            failedUsers.map(v => v.user.username).join("\n") +
            "```"
        )
        break;
    } case "cache":
        try {
            const result = getSong(args[1]);
            console.log(result)
            msg.guild.voiceConnection.playStream(result);
            break;
        }catch(err) {
            console.log(err.stack)
            msg.channel.send(err.message);
        }
        break;
    default:
        msg.channel.send("❌ Reeeeeeeee ")
}
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'dev',
	aliases:[],
	description: 'development shit OK???',
	usage:'die'
};

function unicodeToBinary(char) {
    return char.split('').map(function(codepoint) {
        return padLeftTo(codepoint.charCodeAt(0).toString(2), 0, 16);
    }).join('').replace(/0/g,CHAR0).replace(/1/g,CHAR1);
}

function binaryToUnicode(binaryList) {
    binaryList = binaryList.replace(RGX_CHAR0,0).replace(RGX_CHAR1,1).split("");
    let codepointsAsNumbers = [];
    while( binaryList.length>0 ){
        var codepointBits = binaryList.slice(0,16);
        binaryList = binaryList.slice(16);
        codepointsAsNumbers.push( parseInt(codepointBits.join(''),2) );
    }
    return String.fromCharCode.apply(this,codepointsAsNumbers);
}

function padLeftTo(string, padChar, numChars) {
    return (new Array(numChars-string.length+1)).join(padChar) + string;
}