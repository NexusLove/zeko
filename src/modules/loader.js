const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');
let client, log;
module.exports = {
    config:{
        type:'internal'
    },
    loadCore(client) {
        log = new client.Logger('loader');
        internalCustomCheck()
        .then(() => {
            loadModules(client).then(() => {
                Promise.all([
                    loadCommands(client),
                    loadEvents(client)
                ])
            })
        }).catch(err => {
            log.error('Internal Load failure, exiting.\n' + err.message);
            process.exit(1);
        })
        if(process.env.LOADER_AUTO_RELOAD) {
            log.debug('Watcher: Now active.')
            const cmd_watcher = chokidar.watch(['src/commands','commands'], {
                ignored: /(^|[\/\\])\../,
                persistent: true
            });
            const mod_watcher = chokidar.watch(['modules'], {
                ignored: /(^|[\/\\])\../,
                persistent: true
            });

            cmd_watcher
            .on('change', _path => {
                const f = _path.replace(/^.*[\\\/]/, '')
                if(f.split(".").slice(-1)[0] !== "js") return;
                if(f.startsWith("_")) return;
                const filename = f.split(".").slice(0,-1).join(".")
                //log.debug(`Watcher: Detected file change for command ${filename}, reloading...`)
                try {
                    client.commands.delete(filename);
                    let command_path = (/(src)(\\|\/)/.test(_path)) ? path.join(__dirname,"/../../src/commands") : path.join(__dirname,"/../../commands");
                    const filepath = require.resolve(path.join(command_path,filename))
                    delete require.cache[filepath]
                    client.commands.set(filename,require(filepath));
                    log.info(`Watcher: Reloaded command ${filename} successfully`)
                }catch(err) {
                    log.error(`Watcher: Failed to auto reload command ${filename}: ${err.message}`)
                }
            })

            mod_watcher
            .on('change', _path => {
                const filename = _path.replace(/^.*[\\\/]/, '')
                .split(".").slice(0,-1).join(".")
                //log.debug(`Watcher: Detected file change for module ${filename}, reloading...`)
                client.moduleManager.reloadModule(filename,{custom:true})
                .catch(err => {
                    log.error(`Watcher: Failed to auto reload module ${filename}: ${err.message}`)
                })
            })
        }
    }
}
async function loadCommands(client) {
    const folders = ['src/commands','commands'];
    let custom = 0;
    let normal = 0;
    const promises = [];
    for(let i=0;i<folders.length;i++) {
        const folder = folders[i];
        const txt_custom = (i==1)?' Custom' : '';
        const filepath = path.join(__dirname,'/../../',folder);
        await fs.readdir(filepath)
        .then((files) => {
            files.forEach(f => {
                if(f.split(".").slice(-1)[0] !== "js") return;
                if(f.startsWith("_")) return;
                promises.push(new Promise((resolve,reject) => {
                    try {
                        let props = require(`${filepath}/${f}`);
                        if(!props.help || !props.config) {
                            log.warn(`${txt_custom} ${f} has no config or help value.`);
                            return resolve();
                        }
                        props.help.description = props.help.description||'[No description provided]'
                        props.config.custom = (i==1);
                    
                        if(Array.isArray(props.help.name)) {
                            if(props.help.name.length === 0) {
                                log.warn(`${f} has no names or aliases defined.`)
                            }else{
                                const name = props.help.name.shift();
                                props.help.name.forEach(alias => {
                                    client.aliases.set(alias,name);
                                })
                                client.commands.set(name,props);
                            }
                        }else{
                            client.commands.set(props.help.name, props);
                        }
                        if(props.init) props.init(client);
                        if(i==1) custom++; else normal++;
                        resolve();
                    }catch(err) {
                        log.error(`${txt_custom} Command ${f} had an error:\n    ${err.stack}`);
                        reject(err);
                    }
                }))
                
            });
        }).catch(err => {
            log.error(`Loading${txt_custom} ${folder} failed:\n    ${err.stack}`);
        })
    }
    Promise.all(promises).then(() => {
        log.success(`Loaded ${normal} core commands, ${custom} custom commands`)
    }).catch(() => {
        //errors are already logged in the promises
    })

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
    log.success(`Loaded ${normal} core events, ${custom} custom events`)

}
async function loadModules(client) {
    const folders = ['modules'];
    let custom = 0;
    let normal = 0;
    const promises = [];
    for(let i=0;i<folders.length;i++) {
        const folder = folders[i];
        const txt_custom = (i==0)?'Custom ' : '';
        const filepath = path.join(__dirname,'/../../',folder);
        await fs.readdir(filepath)
        .then(files => {
            
            files.forEach(f => {
                fs.stat(`${filepath}/${f}`)
                .then(() => {
                    if(f.split(".").slice(-1)[0] !== "js") return;
                    if(f.startsWith("_")) return;
                    promises.push(new Promise((resolve,reject) => {
                        try {
                            let props = require(`${filepath}/${f}`);
                            if(!props.config) props.config = {}
                            props.config.name = f.split(".")[0];
                            props.config.custom = (i==0);
                            client.moduleManager.registerModule(props)
                            .then(() => {
                                if(i==0) custom++; else normal++;
                                resolve();
                            })
                            .catch(err => {
                                log.error(`${txt_custom} Module ${f} was not loaded by ModuleManager: \n ${err.message}`)
                                reject(err);
                            })
                        }catch(err) {
                            log.error(`${txt_custom} Module ${f} had an error:\n    ${err.stack}`);
                            reject(err);
                        }
                    }))
                });
            });
        }).catch(err => {
            log.error(`Loading ${txt_custom}${folder} failed:\n    ${err.stack}`);
        })
    }

    await Promise.all(promises)
    .then(() => {
        log.success(`Loaded ${normal} core modules, ${custom} custom modules`)
    }).catch(() => {
        //errors are already logged in the promises
    })
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