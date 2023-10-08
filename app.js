require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()
 
const mongoose = require('mongoose');
mongoose.set('strictQuery', false)
const morgan = require('morgan')
// database

const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes');
const notFoundMiddleware = require('./middleware/not-found')

const errorHandlerMiddleware = require('./middleware/error-handler')


app.use(morgan('tiny'))
const cookieParser = require('cookie-parser')
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(express.static('./public'))
app.get('/', (req,res)=>{
    console.log(req.signedCookies);
    res.send('e-commerce API')
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter);
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)
const PORT = process.env.PORT || 5000
const start = async () =>{
    try{    
        await mongoose.connect(process.env.MONGO_URI)
        app.listen(PORT, console.log(`Listening on port ${PORT}...`))
    }
    catch(err){
        console.log(err);
    }
}
start()
