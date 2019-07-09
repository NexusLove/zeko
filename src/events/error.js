
module.exports = async (client,err) => {
    const logger = new client.Logger("core");
    logger.error(err.message)
}
