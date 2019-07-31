const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');
let client, log, dirname;
module.exports = {
    config:{
        type:'internal'
    },
    loadCore(client) {
        dirname = client.rootDir;
        log = new client.Logger('loader');
        internalCustomCheck()
        .then(() => {
            //load modules first, and after its done, load commands and events at the same time
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
        //check if LOADER_AUTO_RELOAD is set to true, to enable auto watch reload
        if(process.env.LOADER_AUTO_RELOAD) {
            log.debug('Watcher: Now active.')
            const cmd_watcher = chokidar.watch(['src/commands','commands'], {
                ignored: /(^|[\/\\])\../,
                ignoreInitial: true,
                persistent: true
            });
            const event_watcher = chokidar.watch(['src/events','events'], {
                ignored: /(^|[\/\\])\../,
                ignoreInitial: true,
                persistent: true
            })
            const mod_watcher = chokidar.watch(['src/modules','modules'], {
                ignored: /(^|[\/\\])\../,
                ignoreInitial: true,
                persistent: true
            });
            //main command watcher
            cmd_watcher
            .on('add',_path => {
                log.debug('Detected a new command (',_path,'). Restart to load')
            })
            .on('change', _path => {
                //TODO: allow support for group loading
                const f = _path.replace(/^.*[\\\/]/, '')
                if(f.split(".").slice(-1)[0] !== "js") return;
                if(f.startsWith("_")) return;
                const filename = f.split(".").slice(0,-1).join(".")
                //set timeout, sometimes it gets a change before file is complete. Should port to the other 2 _watchers
                setTimeout(() => {
                    try {
                        //delete command from map, load it, initalize it, and then add it back if successful
                        client.commands.delete(filename);
                        let command_path = (/(src)(\\|\/)/.test(_path)) ? path.join(dirname,"src/commands") : path.join(dirname,"commands");
                        const filepath = require.resolve(path.join(command_path,filename))
                        delete require.cache[filepath]
                        const command_file = require(filepath)
                        if(command_file.init) {
                            const _logger = new client.Logger(filename,{type:'command'});
                            command_file.init(client,_logger)
                        }
                        if(!command_file.run) log.warn(`Watcher: File ${filename} is missing run property`)
                        client.commands.set(filename,command_file);
                        log.info(`Watcher: Reloaded command ${filename} successfully`)
                    }catch(err) {
                        log.error(`Watcher: Failed to auto reload command ${filename}: ${process.env.PRODUCTION?err.message:err.stack}`)
                    }
                },500)
                
            })

            event_watcher
            .on('add',_path => {
                log.debug('Detected a new event (',_path,'). Restart to load')
            })
            .on('change',_path => {
                const filename = _path.replace(/^.*[\\\/]/, '')
                .split(".").slice(0,-1).join(".")
                //log.debug(`Watcher: Detected file change for module ${filename}, reloading...`)
                client.eventManager.reloadEvent(filename,{custom:true})
                .then(() => {
                    log.info(`Watcher: Reloaded event ${filename} successfully`)
                })
                .catch(err => {
                    log.error(`Watcher: Failed to auto reload event ${filename}: ${process.env.PRODUCTION?err.message:err.stack}`)
                })
            })

            mod_watcher
            .on('add',_path => {
                log.debug('Detected a new module (',_path,'). Restart to load')
            })
            .on('change', _path => {
                if((/(loaders)(\\|\/)/.test(_path))) return; //dont want it to load core loaders
                const filename = _path.replace(/^.*[\\\/]/, '')
                .split(".").slice(0,-1).join(".")
                //log.debug(`Watcher: Detected file change for module ${filename}, reloading...`)
                client.moduleManager.reloadModule(filename,{custom:true})
                .then(() => {
                    log.info(`Watcher: Reloaded module ${filename} successfully`)
                })
                .catch(err => {
                    log.error(`Watcher: Failed to auto reload module ${filename}: ${process.env.PRODUCTION?err.message:err.stack}`)
                })
            })
        }
    }
}
async function loadCommands(client) {
    //just set the folders it should load from
    const folders = ['src/commands','commands'];
    let custom = 0;
    let normal = 0;
    const promises = [];
    for(let i=0;i<folders.length;i++) {
        const folder = folders[i];
        const txt_custom = (i==1)?' Custom' : ''; //ugly solution, but checks if its a custom command
        const filepath = path.join(dirname,folder);
        await fs.readdir(filepath,{withFileTypes:true}) //read directory, returns directs which can check if folder, to support cmd groups
        .then(files => {
            files.forEach(dirent => {
                if(dirent.isDirectory()) {
                    const sub_filepath = path.join(filepath,dirent.name);
                    fs.readdir(sub_filepath)
                    .then(sub_files => {
                        sub_files.forEach(f => {
                            //ignore files that arent *.js, or have _ prefixed
                            if(f.split(".").slice(-1)[0] !== "js") return;
                            if(f.startsWith("_")) return;
                            promises.push(new Promise((resolve,reject) => {
                                try {
                                    //load file, check required properties (help,config,run)
                                    let props = require(`${sub_filepath}/${f}`);
                                    if(!props.help || !props.config) {
                                        log.warn(`${txt_custom} ${f} has no config or help value.`);
                                        return resolve();
                                    }
                                    if(!props.run) {
                                        log.warn(`${txt_custom} ${f} has no run function.`);
                                        return resolve();
                                    }
                                    props.help.description = props.help.description||'[No description provided]'
                                    props.config.group = dirent.name;
                                    props.config.core = (i==0);
                                    //allows support for name to be an array or a single string
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
                                    const logger = new client.Logger(props.help.name,{type:'command'})
                                    if(props.init) props.init(client,logger);
                                    if(i==1) custom++; else normal++;
                                    resolve();
                                }catch(err) {
                                    log.error(`${txt_custom} Command ${f} had an error:\n    ${process.env.PRODUCTION?err.message:err.stack}`);
                                    reject(err);
                                }
                            }))
                        })
                    })
                }else{
                    //same as above, dont run if not *.js or prefixed with _
                    const f = dirent.name;
                    if(f.split(".").slice(-1)[0] !== "js") return;
                    if(f.startsWith("_")) return;
                    promises.push(new Promise((resolve,reject) => {
                        try {
                            //load file, check required properties (help,config,run)
                            let props = require(`${filepath}/${f}`);
                            if(!props.help || !props.config) {
                                log.warn(`${txt_custom} ${f} has no config or help value.`);
                                return resolve();
                            }
                            if(!props.run) {
                                log.warn(`${txt_custom} ${f} has no run function.`);
                                return resolve();
                            }
                            props.help.description = props.help.description||'[No description provided]'
                            props.config.core = (i==0);
                            props.config.group = null;
                            //allows support for name to be an array or a single string
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
                            const logger = new client.Logger(props.help.name,{type:'command'})
                            if(props.init) props.init(client,logger);
                            if(i==1) custom++; else normal++;
                            resolve();
                        }catch(err) {
                            log.error(`${txt_custom} Command ${f} had an error:\n    ${process.env.PRODUCTION?err.message:err.stack}`);
                            reject(err);
                        }
                    }))
                }
            });
        }).catch(err => {
            log.error(`Loading${txt_custom} ${folder} failed:\n    ${process.env.PRODUCTION?err.message:err.stack}`);
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
        const filepath = path.join(dirname,folder);
        await fs.readdir(filepath)
        .then(files => {
            files.forEach(file => {
                if(file.split(".").slice(-1)[0] !== "js") return; //has to be .js file *cough* folder that doesnt exist *cough*
                const eventName = file.split(".");
                eventName.pop();
                try {
                    const event = require(`${filepath}/${file}`);
                    if(i==0) { //core
                        if(!event || typeof event !== 'function') {
                            return log.warn(`Event ${txt_custom} ${file} is not setup correctly!`);
                        }
                    }else{ //custom
                        if(!event || (!event.before && !event.after)) {
                            return log.warn(`Custom Event ${file} is not setup correctly!`);
                        }
                    }
                    //this is probably still broken. Event manager doesnt care about .once. property
                    const logger = new client.Logger(eventName[0])
                    if(eventName.length >= 2 && eventName[1].toLowerCase() === "once") {
                        client.eventManager.registerEvent(eventName[0],{once:true,core:i==0})
                        .catch(err => {
                            log.error(`${txt_custom} Event ${eventName[0]} was not loaded by EventManager: \n ${err.message}`)
                        })
                    }else{
                        client.eventManager.registerEvent(eventName[0],{once:false,core:i==0})
                        .catch(err => {
                            log.error(`${txt_custom} Event ${eventName[0]} was not loaded by EventManager: \n ${err.message}`)
                        })
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
    const folders = ['src/modules','modules'];
    let custom = 0;
    let normal = 0;
    const promises = [];
    for(let i=0;i<folders.length;i++) {
        const folder = folders[i];
        const txt_custom = (i==0)?'Custom ' : '';
        const filepath = path.join(dirname,folder);
        //read the folder path, and get dirs. Same as commands fetching basically
        await fs.readdir(filepath,{withFileTypes:true})
        .then(files => {
            files.forEach(dirent => {
                if(dirent.isDirectory()) {
                    if(dirent.name === "loaders") return; //dont load the loaders with module manager
                    const sub_filepath = path.join(filepath,dirent.name);
                    fs.readdir(sub_filepath)
                    .then(sub_files => {
                        sub_files.forEach(f => {
                            if(f.split(".").slice(-1)[0] !== "js") return;
                            if(f.startsWith("_")) return;
                            promises.push(new Promise((resolve,reject) => {
                                try {
                                    let props = require(`${sub_filepath}/${f}`);
                                    if(!props.config) props.config = {}
                                    props.config.name = f.split(".")[0];
                                    props.config.core = (i==0);
                                    props.config.group = dirent.name;
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
                        })
                    })
                    .catch(err => {
                        log.error(`Loading group ${dirent.name} failed:\n    ${process.env.PRODUCTION?err.message:err.stack}`);
                    })
                }else {
                    const f = dirent.name;
                    if(f.split(".").slice(-1)[0] !== "js") return;
                    if(f.startsWith("_")) return;
                    promises.push(new Promise((resolve,reject) => {
                        try {
                            let props = require(`${filepath}/${f}`);
                            if(!props.config) props.config = {}
                            props.config.name = f.split(".")[0];
                            props.config.core = (i==0);
                            client.moduleManager.registerModule(props)
                            .then(() => {
                                if(i==0) custom++; else normal++;
                                resolve();
                            })
                            .catch(err => {
                                log.error(`${txt_custom} Module ${f} was not loaded by ModuleManager: \n ${process.env.PRODUCTION?err.message:err.stack}`)
                                reject(err);
                            })
                        }catch(err) {
                            log.error(`${txt_custom} Module ${f} had an error:\n    ${process.env.PRODUCTION?err.message:err.stack}`);
                            reject(err);
                        }
                    }))
                }
            });
        }).catch(err => {
            log.error(`Loading ${txt_custom}${folder} failed:\n    ${process.env.PRODUCTION?err.message:err.stack}`);
        })
    }

    await Promise.all(promises)
    .then(() => {
        log.success(`Loaded ${normal} core modules, ${custom} custom modules`)
    }).catch(() => {
        //errors are already logged in the promises
    })
}
//creates custom folders if they dont exist
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