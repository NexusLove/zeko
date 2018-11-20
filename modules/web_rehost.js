const path = require('path')
const fs = require('fs')
const JsonDB = require('node-json-db')
const rimraf = require('rimraf');
const express = require('express');
const router = express.Router();

router.get('/',async (req,res) => {
    let files = [];
    await fs.readdirSync(__dirname + "/../rehost").forEach(file => {
        files.push(file)
    })
    res.send('<h1>Rehosted Domains:</h1><p>Use <b>&gt;web rehost &lt;url&gt;</b> to host any domain</b><ul>' + files.map(v => `<li><a href='/rehost/${v}'>${v.replace(/_/g,'/')}</a></li>`).join("") + "</ul>")
})
router.use('/',express.static(path.join(__dirname, '/../rehost')));

exports.db = new JsonDB("db/rehost",true,false);
setInterval(() => {
    let domains = this.db.getData('/domains');
    for(let key in domains) {
        if(!domains.hasOwnProperty(key)) return;
        if(domains[key] < Date.now()) return rimraf(__dirname + `/../rehost/${key}`,err => {
            if(!err) {
                console.log(`[web_rehost] Deleted ${key}`)
                return this.db.delete(`/domains/${key}`)
            }
            console.log(`[web_rehost] Failed to delete ${key}: ${err.message}`)
        })
    }
},1.8e+6)
exports.router = router;
