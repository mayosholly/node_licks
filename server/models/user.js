const mongoose = require("mongoose") 

const Schema = mongoose.Schema

const UserSchema = Schema({
    username: { 
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    refresh_token: String
    
},
{
    virtual : {
        full_name: {
            get(){
                return this.first_name + ' ' + this.last_name
            }
        }
    }
}
)

module.exports = mongoose.model('User', UserSchema)