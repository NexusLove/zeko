exports.error = (error,module) => {
    return {
        embed:{
            color:16711731,
            title:`Module ${module.name} has errored`,
            description:error.stack
        }
    }
}