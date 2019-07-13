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
        this.events = {};
        this.client = client;
        logger = new client.Logger('ModuleManager',{type:'module'});
        if (instance) return instance;
        instance = this;
        return instance;
    }
    static getInstance() {
        return instance || new EventManager();
    } 
    reloadEvent(event) {
        const _this = this;
        return new Promise(async(resolve,reject) => {
            try {
                const _path = path.join(_this.client.rootDir,"events",`${event.config.name}.js`)
                delete require.cache[require.resolve(_path)];
                this.client.removeListener(event.config.name,event.config.bind)

                const event_src = require(_path);
                const logger = new _this.client.Logger(name,{type:'event'})
                const bind = event_src.bind(null, _this.client,logger);

                _this.events[event.config.name] = {
                    event:bind,
                    config:event.config
                }
                if(event.config.once) {
                    _this.client.once(name,bind);
                }else{
                    _this.client.on(name,bind);
                }
                resolve();
            }catch(err) {
                reject(err);   
            }
        })
    }
    registerEvent(name,opts = {once:false}) {
        const _this = this;
        return new Promise((resolve,reject) => {
            try {
                const _path = path.join(_this.client.rootDir,"events",`${opts.once?`${name}.once`:name}.js`)
                delete require.cache[require.resolve(_path)];
                const event_src = require(_path);
                const logger = new _this.client.Logger(name,{type:'event'})
                const bind = event_src.bind(null, _this.client,logger);
    
                _this.events[name] = {
                    event:bind,
                    config:{
                        name:name,
                        once:opts.once
                    }
                }
                if(opts.once) {
                    _this.client.once(name,bind);
                }else{
                    _this.client.on(name,bind);
                }
                resolve();
            }catch(err) {
                reject(err);
            }
        })
    }
    getEvent(query) {
        return this.events[query];
    }
    getEvents(opts = {names:false}) {
        if(opts.names) {
            return Object.keys(this.events)
        }else{
            return this.events;
        }
    }
}

