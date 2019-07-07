const fs = require('fs').promises;
const path = require('path')
exports.getFile = (name,defVal) => {
    //getFile returns file, and creates if missing
    return new Promise(async(resolve,reject) => {
        const filePath = path.join(__dirname,"/../db/",name);
        try {
            
            const file = await fs.readFile(filePath,'utf-8')
            resolve(file);
        }catch(err) {
            if(err.code === "ENOENT") {
                try {
                    let _default = defVal;
                    if(typeof(devVal) === "object") _default = JSON.stringify(defVal);
                    await fs.writeFile(filePath,_default,{ flag: 'wx' })
                    resolve(defVal)
                }catch(err) {
                    reject(err);
                }
            }else{
                reject(err);
            }
        }
    })
}
