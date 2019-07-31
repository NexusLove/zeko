const path = require('path')
let logger, instance;
module.exports = class ModuleManager {
    constructor(client) {
        this.modules = {};
        this.legacy_message_module_list = [];
        this.client = client;
        logger = new client.Logger('ModuleManager',{type:'module'});
        if (instance) return instance;
        instance = this;
        return instance;
    }   
    static getInstance() {
        return instance || new ModuleManager();
    } 
    //LEGACY COMPONENT. NEEDS TO BE SET ON FIRE AND REMOVED
    messageHandler(msg) {
        const args = msg.content.split(/ +/g);
        const message = args.shift();
        for(let i=0;i<this.legacy_message_module_list.length;i++) {
            for(let k=0;k<this.legacy_message_module_list[i].triggers.length;k++) {
                if(message.toLowerCase().startsWith(this.legacy_message_module_list[i].triggers[k].toLowerCase())) {
                    const search = this.modules[this.legacy_message_module_list[i].module];
                    if(search) {
                        try {
                            search.run(this.client,msg,args);
                        }catch(err) {
                            this.error(err,search,{dev:true})   
                        }
                        return;
                    }
                }
            }
            
        }
    }
    reloadModule(name) {
        return new Promise((resolve,reject) => {
            const module = this.modules[name];
            if(!module) reject(new Error(`ModuleManager: No module found for ${name}`));
            if(module.reloadable != null && !module.reloadable) {
                reject(new Error(`ModuleManager: Module ${name} cannot be reloaded.`))
                logger.warn(`Reloading module ${name} failed: Not Reloadable`)
                return;
            }
            this._reload(module)
            .then(() => {
                logger.info(`Successfully reloaded module ${name}`)
                resolve();
            }).catch(err => {
                logger.error(`Reloading module ${name} failed: ${err.message}`);
                reject(err);
            })
        })
    }
    registerModule(module) {
        const _this = this;
        return new Promise(async(resolve,reject) => {
            
            if(!module.config) reject(new Error(`Invalid module registered.`));
            try {
                this._moduleCheck(module)
                const logger = new this.client.Logger(module.config.name,{type:'module'})
                _this.modules[module.config.name] = module;

                if(module.config.command) this._registerCommandModule(module);
                if(module.init) await module.init(_this.client,logger);


                //logger.debug(`Registered${module.config.core?" Core ":" "}${module.config.command?"Command ":""}Module ${module.config.name}`);
                resolve();
            }catch(err) {
                reject(err);
            }
        })
    }
    getModule(query) {
        return this.modules[query];
    }
    getModules(opts = {names:false}) {
        //{type: 'custom'}
        let filtered;
        if(opts.type) {
            if(opts.type === "custom") {
                filtered = this.modules.filter(v => !v.config.core)
            }else if(opts.type === "core") {
                filtered = this.modules.filter(v => v.config.core);
            }else{
                throw new Error("Unknown type specified of module");
            }
        }else{
            filtered = this.modules;
        }

        if(opts.names) {
            return Object.keys(this.modules)
        }else{
            return this.modules;
        }
    }

    //private methods
    _reload(module) {
        const _this = this;
        return new Promise(async(resolve,reject) => {
            try {
                //delete this.modules[module.config.name];
                if(module.exit) await module.exit(this.client);
                
                const _path = path.join(_this.client.rootDir,module.config.core?"src/modules/":"modules/",`${module.config.name}.js`)
                try {
                    delete require.cache[require.resolve(_path)];
                    const newModule = require(_path)
                    if(!newModule.config) newModule.config = {}
                    newModule.config.name = module.config.name;
                    newModule.config.core = module.config.core;
                    //do logic on register modules
                    _this.modules[module.config.name] = newModule;
                    const logger = new this.client.Logger(module.config.name,{type:'module'})
                    if(newModule.init) await newModule.init(_this.client,logger);
                    resolve();
                } catch(err) {
                    if(err.code === 'ENOENT') {
                        reject(new Error("Module does not exist"))
                    }else{
                        reject(err);
                    }
                }
            }catch(err) {
                reject(err);   
            }
        })
    }
    _registerCommandModule(module) {
        this.legacy_message_module_list.push({triggers:module.config.triggers,module:module.config.name}); //command module
    }
    _moduleCheck(module) {
        if(module.config.command && module.config.triggers.length == 0) {
            logger.warn(`Module ${module.config.name} is a command with no triggers`)
        }
        const failed_dependencies = [];
        const failed_envs = [];
        if(module.config.dependencies) module.config.dependencies.forEach(v => {
            try {
                require.resolve(v)
            } catch(e) {
                failed_dependencies.push(v);
            }
        })
        if(module.config.envs) module.config.envs.forEach(v => {
            if(!process.env[v]) failed_envs.push(v);
        })
        if(failed_dependencies.length > 0) {
            return logger.warn(`Module ${module.config.name} missing dependencies: ${failed_dependencies.join(" ")}`);
        }else if(failed_envs.length > 0) {
            return logger.warn(`Module ${module.config.name} missing envs: ${failed_envs.join(" ")}`);
        }
    }
}