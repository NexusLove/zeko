const PouchDB = require('pouchdb');
const db = new PouchDB('db/main');

const INIT_VAL = {bank:500} //zK
exports.db = db;
exports.getBalance = (id) => {
    return new Promise(async(resolve,reject) => {
        try {
            const balance = await db.get(id);
            return resolve(balance);
        }catch(err) {
            if(err.name == "not_found") {
                const res = await createWallet(id);
                return resolve(INIT_VAL);
            }
            return reject(err);
        }
    })
}



function createWallet(id) {
    return new Promise(async(resolve,reject) => {
        try {
            const res = await db.put(Object.assign({
                _id:id
            },INIT_VAL));
            return resolve(res);
        }catch(err) {
            return reject(err);
        }
    })
}