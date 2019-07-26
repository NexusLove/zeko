
module.exports = async (client,logger,err) => {
    if(err.code.includes("ECONNRESET")) {
        logger.error("Lost connection to the internet, bot is now terminating....");
        process.exit(1);
    }
    logger.error(err.code,err.message)
}
