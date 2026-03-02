import { Pool } from "pg";
import dotenv from 'dotenv';
dotenv.config();
export const pool = new Pool({
    user: 'postgres',
    host : 'localhost',
    database: 'bitespeed',
    password: process.env.POSTGRES_PASSWORD,
    port: 3000
})