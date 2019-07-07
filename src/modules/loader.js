const fs = require('fs').promises;
const path = require('path')
let client, log;
module.exports = {
    config:{
        type:'internal'
    },
    loadCore(client) {
        log = new client.Logger('core');
        internalCustomCheck()
        .then(() => {
            Promise.all([
                loadCommands(client),
                loadEvents(client),
                loadModules(client)
            ])
        }).catch(err => {
            log.error('Internal Load failure, exiting.\n' + err.message);
            process.exit(1);
        })
        
    }
}
async function loadCommands(client) {
    const folders = ['src/commands','commands'];
    let custom = 0;
    let normal = 0;
    for(let i=0;i<folders.length;i++) {
        const folder = folders[i];
        const txt_custom = (i==1)?' Custom' : '';
        const filepath = path.join(__dirname,'/../../',folder);
        await fs.readdir(filepath)
        .then(files => {
            files.forEach(f => {
                fs.stat(`${filepath}/${f}`).then(() => {
                    if(f.split(".").slice(-1)[0] !== "js") return;
                    if(f.startsWith("_")) return;
                    try {
                        let props = require(`${filepath}/${f}`);
                        if(!props.help || !props.config) return log.warn(`${txt_custom} ${f} has no config or help value.`);
                        props.help.description = props.help.description||'[No description provided]'
                        props.config.custom = (i==1);
                        if(props.init) props.init(client);
                        props.help.aliases.forEach(alias => {
                            client.aliases.set(alias, props.help.name);
                        });
                        client.commands.set(props.help.name, props);
                        if(i==1) custom++; else normal++;
                    }catch(err) {
                        log.error(`${txt_custom} Command ${f} had an error:\n    ${err.stack}`);
                    }
                }).catch(err => {
                    log.error(`${txt_custom} Command ${f} had an error:\n    ${err.stack}`);
                })
            });
        }).catch(err => {
            log.error(`Loading${txt_custom} ${folder} failed:\n    ${err.stack}`);
        })
    }
    log.success(`Loaded ${normal} commands, ${custom} custom commands`)

}
async function loadEvents(client) {
    const folders = ['src/events','events'];
    let custom = 0;
    let normal = 0;
    for(let i=0;i<folders.length;i++) {
        const folder = folders[i];
        const txt_custom = (i==1)?' Custom' : '';
        const filepath = path.join(__dirname,'/../../',folder);
        await fs.readdir(filepath)
        .then(files => {
            files.forEach(file => {
                if(file.split(".").slice(-1)[0] !== "js") return; //has to be .js file *cough* folder that doesnt exist *cough*
                const eventName = file.split(".");
                eventName.pop();
                try {
                    const event = require(`${filepath}/${file}`);
                    if(!event || typeof event !== 'function') {
                        return log.warn(`${txt_custom} ${file} is not setup correctly!`);
                    }
                    if(eventName.length >= 2 && eventName[1].toLowerCase() === "once") {
                        client.once(eventName[0], event.bind(null, client));
                    }else{
                        client.on(eventName, event.bind(null, client));
                    }
                    delete require.cache[require.resolve(`${filepath}/${file}`)];
                    if(i==1) custom++; else normal++;
                }catch(err) {
                    log.error(`Event${txt_custom} ${file} had an error:\n    ${err.stack}`);
                }
            });
        }).catch(err => {
            log.error(`Loading${custom} ${folder} failed:\n    ${err.stack}`);
        })
    }
    log.success(`Loaded ${normal} events, ${custom} custom events`)

}
async function loadModules(client) {
    const folders = ['modules'];
    log.info(`Checking for modules to load..`);
    for(let i=0;i<folders.length;i++) {
        const folder = folders[i];
        const custom = (i==1)?' Custom' : '';
        const filepath = path.join(__dirname,'/../../',folder);
        await fs.readdir(filepath)
        .then(files => {
            
            files.forEach(f => {
                fs.stat(`${filepath}/${f}`)
                .then(() => {
                    if(f.split(".").slice(-1)[0] !== "js") return;
                    if(f.startsWith("_")) return;
                    try {
                        let props = require(`${filepath}/${f}`);
                        if(!props.config) return; //not a custom module
                        props.config.name = f.split(".")[0];
                        props.config.custom = (i==1);
                        if(props.init) props.init(client);
                        client.moduleManager.registerModule(props,{custom:true});
                    }catch(err) {
                        log.error(`${custom} Module ${f} had an error:\n    ${err.stack}`);
                    }
                });
            });
        }).catch(err => {
            log.error(`Loading${custom} ${folder} failed:\n    ${err.stack}`);
        })
    }
}

function internalCustomCheck() {
    return new Promise((resolve,reject) => {
        const folders = ["commands","events","modules"]
        folders.forEach(v => {
            fs.readdir(`./${v}`)
            .then(() => {
                resolve();
            })
            .catch(() => {
                try {
                    fs.mkdir(`./${v}`)
                }catch(err) {
                    reject(err);
                }
            })
        })
    })
}