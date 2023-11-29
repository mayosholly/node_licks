const mongoose  = require("mongoose");

async function connectDB () {
    try{
        mongoose.set('strictQuery', false)
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to the database")
    }catch(error){
        console.log(error)
    }
}
module.exports =  connectDB 