const OWNER_IDS = process.env.OWNER_IDS ? process.env.OWNER_IDS.split(",") : []
module.exports = {
    init(client,logger) {
        if(!process.env.OWNER_IDS) logger.warn("Missing environment var OWNER_IDS, therefore eval & other commands will not work.");
    },
    isAuthorized(member,role) {
        switch(role.toLowerCase()) {
            case "owner":
                return OWNER_IDS.includes(member)
                break;
        }
    }
}