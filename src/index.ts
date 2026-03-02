import express from 'express'
import dotenv, { config } from 'dotenv'
import { Pool } from 'pg'
const app = express()
dotenv.config()
app.use(express.json())
const PORT = 3200
const pool = new Pool({
    user:'postgres',
    host: 'localhost',
    database: 'bitespeed',
    password: process.env.POSTGRES_PASSWORD as string,
    port:3000
})
app.get('/', async(req,res)=>{
    try{
        const result = await pool.query('SELECT NOW();')
        res.json(result.rows)
    }catch(error){
        console.log(error)
        res.status(500).json({error:'Internal Server Error'})
    }
})
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})