const {inspect} = require('util');
module.exports = (client) => {
    const token_regex = new RegExp(`(${client.token})`,"g")
    return {
        clean(text) {
            if (typeof(text) !== "string")
               text = inspect(text,{depth:0})
            return text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203))
            .replace(token_regex,"[token]")
        }
    }
}