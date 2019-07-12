//todo!
/*
This file will manage events,
ability to reload (somehow),

and ability to run custom before (and maybe after) core events.
*/
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
    reloadEvent(event,opts = {once:false}) {
        const _this = this;
        return new Promise(async(resolve,reject) => {
            try {
                delete require.cache[require.resolve(`../../events/${ame}.js`)];
                const event_src = require(`../../events/${name}.js`);
                _this.events[name] = {
                    event:event_src,
                    config:{
                        name:name,
                        once:opts.once
                    }
                }
                const logger = new this.client.Logger(name,{type:'event'})
                resolve();
            }catch(err) {
                reject(err);   
            }
        })
    }
    registerEvent(name,opts = {once:false}) {
        return new Promise((resolve,reject) => {
            delete require.cache[require.resolve(`../../events/${name}.js`)];
            const event_src = require(`../../events/${name}.js`);
            _this.events[name] = {
                event:event_src,
                config:{
                    name:name,
                    once:opts.once
                }
            }
            const logger = new this.client.Logger(name,{type:'event'})
            this.client.on(name,event_src)
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