# 🧠 Bitespeed Backend Task — Identity Reconciliation

This project implements the **Identity Reconciliation service** required by Bitespeed.

It exposes a `/identify` endpoint that consolidates customer contact information across multiple purchases using email and/or phone number.

The service ensures that all related contacts are linked together under a single primary contact while maintaining data consistency and transactional integrity.

---

## 🌍 Live Deployment

🔗 **Base URL:**  
https://bitespeed-backend-task-1-20wu.onrender.com

🔗 **Endpoint:**  
POST /identify

---

## 🛠 Tech Stack

- **Node.js**
- **Express.js**
- **TypeScript**
- **PostgreSQL**
- **Render (Deployment)**
- **Postman(Testing)**
---

## 📦 Database Schema

```sql
CREATE TABLE contact (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    linked_id INT,
    link_precedence VARCHAR(10) CHECK (link_precedence IN ('primary', 'secondary')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```
