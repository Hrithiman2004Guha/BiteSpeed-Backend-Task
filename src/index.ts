import express from 'express'
import dotenv, { config } from 'dotenv'
import identifyRouter from './Routes/Identify'
const app = express()
dotenv.config()
app.use(express.json())
const PORT = process.env.PORT || 3200
app.use('/', identifyRouter)
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})