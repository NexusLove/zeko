const {Attachment} = require('discord.js')
const JsonDB = require('node-json-db');
const router = require('express').Router();
exports.db = new JsonDB("db/quotes",true,true);

exports.init = (client) => {
    //setInterval(() => {run(client)},60000000)
    /*setInterval(() => {
        this.postQuote(client);
    },86400000); */
}
router.get('/json',(req,res) => {
    res.json(this.db.getData('/quotes'))
})
router.get('/',(req,res) => {
    const QUOTES = this.db.getData('/quotes');
    const items = {};
    QUOTES.forEach(v => { 
        if(!items[v.type]) items[v.type] = [];
        items[v.type].push(v.value)
    })
    console.log(items)
    return res.render('quotes',{items})
});
exports.postQuote = (client,channel) => {
    let guild = client.guilds.get('358740474623819777');
    if(!guild) return console.info('[Quote] Guild not found, is bot in server?');
    if(!channel) channel = guild.channels.get('358740655205515265'); //get manually
    if(!channel) return console.info('[Quote] Guild channel not found, is bot in server?'); //log if failed again

    const QUOTES = this.db.getData('/quotes');
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    if(quote.type === 'text') {
        return channel.send({embed:{
            title:`Random Prestoné Quote - Text`,
            description:`"${quote.value}"`,
            footer:{text:quote.date},
        }})
    }else if(quote.type === 'image') {
        return channel.send(new Attachment(quote.value))
    }else if(quote.type === 'reddit') {
        return channel.send({embed:{
            title:`Random Prestoné Quote - Reddit`,
            description:`[${quote.value}](https://reddit.com/${quote.value})`,
            footer:{text:'/u/MingledStream9'},
        }})
    }
}
exports.router = router;