const mongoose = require('mongoose')

const Schema = mongoose.Schema

const otpCodeSchema = new Schema({
        email: {
                type: String,
                required: true,
        },
        otpCode: {
                type: Number,
                required: true,
        },
        expiresAt: {
                type: Date,
                required: true,
        },
        isVerified: {
                type: Boolean
        }
})


module.exports = mongoose.model('OTP_Code', otpCodeSchema)