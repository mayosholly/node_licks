const allowed_origins = require('../config/allowed_origins')

const credentials = (req, res, next) => {
    const origin = res.headers.origins

    if(allowed_origins.includes(origin)){
        res.header('Access-control-Allow-origin', true)
    }
    next()
}

module.exports = credentials