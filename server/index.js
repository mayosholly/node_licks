require("dotenv").config()

const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
const path = require("path")
const corsOption = require("./config/cors")
const credentials = require('./middlewares/credentials')
const connectDB = require('./config/database')
const app = express()
const errorHandler = require('./middlewares/error-handler')
const apiRoutes = require('./routes/api/auth')

const PORT = 3500


connectDB()



// allow credentials
// app.use(credentials)
// app.use(cors(corsOption))


// application form url encoded
app.use(express.urlencoded({
    extended:false
}))

// application/json response
app.use(express.json())


// middleware for cookie
// app.use(cookieParser)
// app.use(errorHandler)



// static files
app.use('/static', express.static(path.join(__dirname, 'public')))




// routes
app.use('/api/auth', apiRoutes)
app.all("*", () => {
    res.status(404)
})

mongoose.connection.once('open', () => {
    console.log('DB Connected')
    app.listen(PORT, () => { 
        console.log(`Listening on port ${PORT}`)
    })
})

