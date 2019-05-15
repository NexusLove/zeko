const economy = require('../modules/economy');
exports.run = async(client,msg,args) => {
    if(msg.channel.type === "text" && msg.channel.guild.id !== "291672183627972610") return msg.channel.send("Sorry, this is only available in The Steve Empire")
    const wallet = await economy.getBalance(msg.author.id);
    //if(msg.author.id === "117024299788926978") wallet.bank = 9999999999999999999999999999999999999999999999999999999999999;
    msg.author.send({embed: {
        color:(msg.member)?msg.member.displayColor:0,
        author:{name:`My Wallet`,icon_url:msg.author.avatarURL}, 
        fields:[ 
            { name:`Bank`, value:`${wallet.bank} ZK ($${(wallet.bank/100).toFixed(2)} USD)`,inline:true}
        ]
    }}).then(() =>  msg.react("📬"))
   
}
exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'wallet',
	aliases:['wal','wl','bank'],
	description: 'Check your wallet',
	usage:''
};
 