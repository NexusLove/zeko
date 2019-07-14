let OWNER_IDS = [];
module.exports = {
    init(client,logger) {
        try {
            const ids = client.env.get("OWNER_IDS").required().asArray();
            OWNER_IDS = ids;
        }catch(err) {
            logger.warn("Missing environment var OWNER_IDS, therefore eval & other commands will not work.");
        }
    },
    isAuthorized(member,role) {
        switch(role.toLowerCase()) {
            case "owner":
                return OWNER_IDS.includes(member)
                break;
        }
    }
}