import express from 'express';
import dotenv from 'dotenv';
import { pool } from '../utils/db';
dotenv.config();
const router = express.Router();
router.post('/identify', async(req,res)=>{
    const {email, phoneNumber} = req.body;
    if(!email && !phoneNumber){
        return res.status(400).json({error:'Email or Phone Number is required'});
    }
    try{
        await pool.query('BEGIN');
        const matches = await pool.query(
            'SELECT * FROM Contact WHERE email = $1 OR phoneNumber = $2',
            [email || null, phoneNumber || null]
        )
        
        if(matches.rows.length === 0){
            await pool.query(
                'INSERT INTO Contact (email, phoneNumber, linkPrecedence) VALUES ($1, $2, $3)', [email || null, phoneNumber || null, 'primary']
            )
        const matches2 = await pool.query(
            'SELECT * FROM Contact WHERE email = $1 OR phoneNumber = $2',
            [email || null, phoneNumber || null]
        )
        await pool.query('COMMIT');
            return res.status(200).json({
                contact:{
                    primaryContactId: matches2.rows[0].id,
                    emails: email? [email]:[],
                    phoneNumbers: phoneNumber? [phoneNumber]:[],
                    secondaryContactIds: []
                }
            })
        }
         const rootIds = new Set<number>()

        matches.rows.forEach(contact => {
            if (contact.linkprecedence === 'primary') {
                rootIds.add(contact.id)
            } else {
                rootIds.add(contact.linkedid)
            }
        })

        const cluster = await pool.query(
            `SELECT * FROM Contact
             WHERE id = ANY($1)
             OR linkedId = ANY($1)`,
            [Array.from(rootIds)]
        )

        const primaries = cluster.rows.filter(c => c.linkprecedence === 'primary')

        primaries.sort((a, b) =>
            new Date(a.createdat).getTime() - new Date(b.createdat).getTime()
        )

        const oldestPrimary = primaries[0]
        const primaryId = oldestPrimary.id

        if (primaries.length > 1) {
            for (let i = 1; i < primaries.length; i++) {
                const p = primaries[i]

                await pool.query(
                    `UPDATE Contact
                     SET linkPrecedence = 'secondary',
                         linkedId = $1
                     WHERE id = $2`,
                    [primaryId, p.id]
                )
            }
        }

        const existingEmails = cluster.rows.map(c => c.email).filter(Boolean)
        const existingPhones = cluster.rows.map(c => c.phonenumber).filter(Boolean)

        const emailExists = email ? existingEmails.includes(email) : true
        const phoneExists = phoneNumber ? existingPhones.includes(phoneNumber) : true

        if (!emailExists || !phoneExists) {
            await pool.query(
                `INSERT INTO Contact (email, phoneNumber, linkPrecedence, linkedId)
                 VALUES ($1, $2, 'secondary', $3)`,
                [email || null, phoneNumber || null, primaryId]
            )
        }

        const finalCluster = await pool.query(
            `SELECT * FROM Contact
             WHERE id = $1 OR linkedId = $1`,
            [primaryId]
        )

        await pool.query('COMMIT')


        const emails = [
            oldestPrimary.email,
            ...finalCluster.rows
                .filter(c => c.email && c.id !== primaryId)
                .map(c => c.email)
        ].filter(Boolean)

        const phoneNumbers = [
            oldestPrimary.phonenumber,
            ...finalCluster.rows
                .filter(c => c.phonenumber && c.id !== primaryId)
                .map(c => c.phonenumber)
        ].filter(Boolean)

        const secondaryContactIds = finalCluster.rows
            .filter(c => c.linkprecedence === 'secondary')
            .map(c => c.id)

        return res.json({
            contact: {
                primaryContactId: primaryId,
                emails: [...new Set(emails)],
                phoneNumbers: [...new Set(phoneNumbers)],
                secondaryContactIds
            }
        })

    } catch (error) {
        await pool.query('ROLLBACK')
        console.error(error)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
})

export default router