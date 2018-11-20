const { Attachment } = 'discord.js';

const got = require('got')
const scrape = require('website-scraper');
const path = require('path');
const fs = require('await-fs')
const webshot = require('node-webshot');
const {stripIndents} = require('common-tags');
const db = require('../modules/web_rehost.js').db;
//const AdmZip = require('adm-zip');
const WHITELISTED = ["117024299788926978","137393289845407745","177552117555396608"]
const REHOST_DOMAIN = "http://localhost:8010/rehost/";
exports.run = async (client,msg,args) => {
    if(WHITELISTED.indexOf(msg.author.id) === -1) return msg.channel.send('You are not whitelisted to use this.');
    const query = args.slice(1).join(" ");
    if(args[0] === "rehost") {
        if(!query) return msg.channel.send('Please send a URL');
        const domain = query.replace(/^(?:https?:\/\/)?(?:www\.)?/,'')
        const folderDir = domain.replace(/\//g,'_');
        const m = await msg.channel.send(`<a:typing:421510538661724190> Downloading from **${domain}**`)
        try {
            fs.access(__dirname + `/../rehost/${folderDir}`,async(err) => {
                if(err) {
                    //doesnt exist
                    console.log(err)
                    let r = await scrape({urls:[`http://${domain}`],directory:__dirname + `/../rehost/${folderDir}`});
                    let tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1)
                    db.push(`/domains/${folderDir}`,tomorrow.getTime()/1000|0)
                    return m.edit(`Success! ${REHOST_DOMAIN}/${folderDir} _(Expires in a day)_`)
                }
                return m.edit(`Already rehosted at ${REHOST_DOMAIN}/${folderDir}`);
            })
        }catch(err) {
            console.log('err',err.message)
            return m.edit(`Failed to rehost: ${err.message}`)
        } 
    }else if(args[0] === "index" || args[0] === "raw") {
        let elements = {}
        if(!query) return msg.channel.send('Please provide a URL');
        const domain = query.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/)[1];
        try {

            let r = await got(query);
            /*elements.body = r.body;
            console.log(new Buffer(elements.body))
            let zip = new AdmZip();
            zip.addFile('index.html',new Buffer(elements.body),'',0644);
            let data = zip.toBuffer()*/

            return msg.channel.send({
                files:[{attachment:Buffer.from(r.body),name:`${domain}.html`}]
            })
        }catch(err) {
            return msg.channel.send('Failed: ' + err.message)
        }
    }else if(args[0] === "screenshot" || args[0] === "view") {
        const domain = query.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/)[1];
        let m = await msg.channel.send(`<a:typing:421510538661724190> Screenshotting **${domain}**`)
        await webshot(query,{defaultWhiteBackground:true,windowSize:{width:1600,height:900},streamType:"png",renderDelay:2500,userAgent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36 OPR/47.0.2631.34 (Edition beta)"}, (err,render) => {
            if(err) {
                console.log(err)
                return m.edit(`❌ Failed to screenshot: ${err.message}`);
            }
            msg.channel.send(`Screenshot for **${domain}**`,{files:[{attachment:render,name:`${domain}.png`}]})
            .then(() => m.delete())
            .catch(err => {
                console.log(err)
                m.edit('❌ Cannot upload attachments in this channel.')
            })
        });
    }else if(args[0].toLowerCase() === "scroll" || args[0].toLowerCase() === "sview") {
        const domain = query.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/)[1];
        let m = await msg.channel.send(`<a:typing:421510538661724190> Screenshotting **${domain}**`)
        await webshot(query,{defaultWhiteBackground:true,shotSize:{width:'all',height:'all'},windowSize:{width:1600,height:900},streamType:"png",renderDelay:2500,userAgent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36 OPR/47.0.2631.34 (Edition beta)"}, (err,render) => {
            if(err) {
                console.log(err)
                return m.edit(`❌ Failed to screenshot: ${err.message}`);
            }
            msg.channel.send(`Screenshot for **${domain}**`,{files:[{attachment:render,name:`${domain}.png`}]})
            .then(() => m.delete())
            .catch(err => {
                console.log(err)
                m.edit('❌ Cannot upload attachments in this channel.')
            })
        });
    }else if(args[0] === "render") {
        const domain = query.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/)[1];
        if(!query) return msg.channel.send('Please send raw HTML or a url');
        if(domain === "pastebin.com") {
            let raw = query.split('/');
            raw = (raw[3]) ? raw[3] : (raw[1]) ? raw[1] : null;
            if(!raw) return msg.channel.send('Invalid pastebin URL');

            try {
                const data = await got(`https://pastebin.com/raw/${raw}`)
                let m = await msg.channel.send(`<a:typing:421510538661724190> Rendering input`)
                await webshot(data.body,{siteType:'html',defaultWhiteBackground:true,windowSize:{width:1600,height:900},streamType:"png",renderDelay:2500,userAgent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36 OPR/47.0.2631.34 (Edition beta)"},(err,render) => {
                    if(err) {
                        return m.edit(`❌ Failed to render: ${err.message}`);
                    }
                    msg.channel.send(`Render view for input:`,{files:[{attachment:render,name:`render.png`}]})
                    .then(() => m.delete())
                    .catch(err => {
                        m.edit('❌ Cannot upload attachments in this channel.')
                    })
                })
            }catch(err) {
                return msg.channel.send('Failed: ' + err.message)
            }
        }else{
            let m = await msg.channel.send(`<a:typing:421510538661724190> Rendering input`)
            await webshot(query,{siteType:'html',defaultWhiteBackground:true,windowSize:{width:1600,height:900},streamType:"png",renderDelay:2500,userAgent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36 OPR/47.0.2631.34 (Edition beta)"},(err,render) => {
                if(err) {
                    return m.edit(`❌ Failed to render: ${err.message}`);
                }
                msg.channel.send(`Render view for input:`,{files:[{attachment:render,name:`render.png`}]})
                .then(() => m.delete())
                .catch(err => {
                    m.edit('❌ Cannot upload attachments in this channel.')
                })
            })
        }
    }else if(args[0] === "help") {
        return msg.channel.send(stripIndents`**Options & Their Use**
            rehost - Will scrape url and rehost it (with resources like JS or CSS)
            index - grabs the html of the url only, for download
            screenshot - takes a screenshot of visible part of page.
            scroll - Takes a screenshot of the whole webpage.
            render - will render raw html (use pastebin for longer)

            **Usage:** >web <rehost/index/view/render> <url/html>
        `)
    }else{
        return msg.channel.send('Please specify an option: >website <rehost/index/screenshot/render> <url>');
    }
};

exports.config = {
	usageIfNotSet: false,
	permissions:0
};

exports.help = {
    name: 'website',
	aliases:['web'],
	description: 'Rehosts (uploads to new domain), grabs the .html (no resources), screenshots, or renders (raw html)',
	usage:'f'
};
 