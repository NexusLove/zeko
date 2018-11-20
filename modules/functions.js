const {inspect} = require('util');
module.exports = (client) => {
    client.createGist = function createGist(name,value,public,description) {
        return new Promise((resolve,reject) => {
            if(!/^.*\.[^\\]+$/.test(name)) name = `${name}.md`;
            got(`https://api.github.com/gists`,{json:true,body:{
                public:public||false,
                description:description||`Created via InsertBotNameHere (https://insertbotnamehere.jackz.me)`,
                files:{
                    [name||'untitled.md']:{
                        content:value
                    }
                }
            },headers: {'user-agent': `InsertBotNameHere Discord Bot/${client.version} (https://insertbotnamehere.jackz.me)`}})
            .catch(err => {
                reject(err);
            }).then(gist => {
                resolve({url:gist.body.html_url,size:gist.body.files[name].size})
            });
        })
    };
    client.clean = (text) => {
        if (typeof text !== 'string')
        text = inspect(text, {depth: 0})
        text = text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203))
        .replace(client.token, "7");
        return text;
    };
}