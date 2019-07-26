//todo!
/*
This file will manage events,
ability to reload (somehow),

and ability to run custom before (and maybe after) core events.
*/
const path = require('path')
let logger, instance;

module.exports = class EventManager {
    constructor(client) {
        this.events = {
            custom:{},
            core:{}
        }
        this.client = client;
        logger = new client.Logger('EventManager',{type:'module'});
        if (instance) return instance;
        instance = this;
        return instance;
    }
    static getInstance() {
        return instance || new EventManager();
    } 
    //todo: error check
    event(name,args) {
        if(name.toLowerCase() === "guildmemberspeaking") return;
        const core = this.getEvent(name,'core');
        const custom = this.getEvent(name,'custom');
        if(custom) {
            if(custom.event.before) {
                //get value returned, possibly to cancel ?
                Promise.resolve(custom.event.before(...args))
                .then((r) => {
                    let cancelled = (r instanceof Object) ? r.cancel : false;
                    if(!cancelled && custom.event.after) {
                        if(core) {
                            Promise.resolve(core.event(...args))
                            .then(r => {
                                let cancelled = (r instanceof Object) ? r.cancel : false;
                                if(!cancelled) custom.event.after(...args);
                            }).catch(err => {
                                logger.error(`Core Event ${name} errored: ${err.message}`)
                            })
                        }else{
                            custom.event.after(...args)
                        }
                    }
                }).catch(err => {
                    logger.error(`Custom Event ${name} errored: ${err.message}`)
                })
            }
        }else if(core){
            Promise.resolve(core.event(...args))
            .catch(err => {
                logger.error(`Core Event ${name} errored: ${err.message}`)
            })
        }
        /*logger.debug(JSON.stringify({
            event:name,
            core:core!=null,
            before:custom&&custom.event.before != null,
            after:custom&&custom.event.after != null
        }))*/
    }
    reloadEvent(name) {
        const _this = this;
        return new Promise(async(resolve,reject) => {
            try {
                const event = this.getEvent(name,'core') || this.getEvent(name,'custom');
                if(!event) reject(new Error("Could not find event " + name))
                const _path = path.join(
                    _this.client.rootDir,
                    event.config.core?"src/events":"events",
                    event.config.once?`${name}.once.js`:`${name}.js`
                )
                delete require.cache[require.resolve(_path)];

                const event_src = require(_path);
                const _logger = new _this.client.Logger(event.config.name,{type:'event'})
                const event_obj = event.config.core ? event_src.bind(null,_this.client,_logger) : {
                    before:event_src.before?event_src.before.bind(null, _this.client,_logger):null,
                    after:event_src.after?event_src.after.bind(null, _this.client,_logger):null
                }
                _this.events[event.config.core?'core':'custom'][event.config.name] = {
                    event:event_obj,
                    config:event.config
                }
                resolve();
            }catch(err) {
                reject(err);   
            }
        })
    }
    registerEvent(name,opts = {once:false,core:false}) {
        const _this = this;
        return new Promise((resolve,reject) => {
            try {
                const _path = path.join(_this.client.rootDir,
                    opts.core?"src/events":"events",
                    opts.once?`${name}.once.js`:`${name}.js`
                )
                delete require.cache[require.resolve(_path)];
                const event_src = require(_path);
                const _logger = new _this.client.Logger(name,{type:'event'})
                const event_obj = opts.core ? event_src.bind(null,_this.client,_logger) : {
                    before:event_src.before?event_src.before.bind(null, _this.client,_logger):null,
                    after:event_src.after?event_src.after.bind(null, _this.client,_logger):null
                }
                _this.events[opts.core?'core':'custom'][name] = {
                    event:event_obj,
                    config:{
                        core:opts.core,
                        name:name,
                        once:opts.once
                    }
                }
                resolve();
            }catch(err) {
                reject(err);
            }
        })
    }
    getEvent(query,type) {
        if(type != "core" && type != "custom") return null;
        return this.events[type][query];
    }
    getEvents(opts = {names:false}) {
        if(opts.names) {
            return {
                core:Object.keys(this.events.core),
                custom:Object.keys(this.events.custom)
            }
        }else{
            return {
                core:this.events.core,
                custom:this.events.custom
            }
        }
    }
}

