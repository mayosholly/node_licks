const allowOrigins = require('./allowed_origins')

const corsOption = {
    origin: (origin, callback) => {
        if(allowOrigins.includes(origin) || !origin){
            callback(null, true)
        }else{
            callback(new Error("Not allowed by cors"))
        }
    }
}

module.exports = corsOption