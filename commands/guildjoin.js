require('dotenv').load();
const btoa = require('btoa');
const got = require('got')
exports.run = (client,msg,args) => {
	if(args[0] === "url") {
        msg.channel.send(`https://discordapp.com/api/oauth2/authorize?client_id=421387492252712971&redirect_uri=http%3A%2F%2Flocalhost%3A90&response_type=code&scope=identify%20guilds.join`)
    }
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'guildjoin',
	aliases:[],
	description: 'f',
	usage:''
};
 
const express = require('express');
const app = express();
app.get('/',async(req,res) => {
    const creds = btoa(`${421387492252712971}:${process.env.DISCORD_SECRET}`);
    let json = await got(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${req.query.code}&redirect_uri=http%3A%2F%2Flocalhost%3A90`,{
      method:'POST',
      headers:{'Authorization': `Basic ${creds}`}
    }).catch(error => {
      console.log('[guildjoin]',error.message)
      res.send('error');
    });
    console.log(json)
    let user = await got('https://discordapp.com/api/users/@me',{method: 'GET',headers: {Authorization: `Bearer ${json.body.access_token}`}});
    await got(`https://discordapp.com/api/guilds/330216161432305664/members/${user.body.id}`,{method:'POST',headers: {Authorization: `Bearer ${json.body.access_token}`}})
})
app.listen(90);