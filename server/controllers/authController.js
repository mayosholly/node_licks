const User = require("../models/user")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

async function register(req, res){
    const { username, first_name, last_name, email, password, password_confirm } = req.body

    if(!username || !email || !password || !password_confirm || !first_name || !last_name){
        return res.status(422).json({
            message: 'Invalid Field'
        })
    }
    if(password !== password_confirm ){
        return res.status(422).json({
            message: 'Password mismatch'
        })
    }
        // const userExists = await User.exists({email}).exec()
        // if(userExists) return res.status(409)
        try {
            hashedPassword = await bcrypt.hash(password, 10)
            user = await User.create({email, username, password: hashedPassword,  first_name, last_name})
            return res.status(201).json({
                message: "Successfully Created",
                data : user 
            })
        } catch (error) {
            return res.status(400).json({
                message : "Could not Register"
            })
        }
}

async function login(req, res){
    const { email, password } = req.body
    if(!email || !password) return res.status(422).json({
        message: "invalid field"
    })
    const user = await User.findOne({email})
    if(!user) return res.sendStatus(401 )
    const match = await bcrypt.compare(password, user.password)
    if(!match) return res.status(401).json({message: "Email or password is incorrect"})

    const accessToken = jwt.sign(
        {username: user.username},
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: '1800s'
        }
    )
    const refreshToken = jwt.sign(
        {username: user.username},
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: '1d'
        }
    )
    user.refresh_token = refreshToken
    await user.save()
    
    res.cookie('refresh_token', refreshToken , {
        httpOnly: true, maxAge: 24*60*60*100})
    res.json({
        access_token : accessToken
    })
}


async function logout(){
    res.sendStatus(200)
}


async function refresh(){
    res.sendStatus(200)
}


async function user(){
    res.sendStatus(200)
}

module.exports = { login, register, logout, refresh,  user }