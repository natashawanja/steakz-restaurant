# Steakz MIS — Restaurant Management Information System

A full-stack web-based MIS portal built for Steakz, a UK restaurant chain with 7 branches. Built as part of the OTHM Level 5 Diploma in IT Management — Unit Y/617/2273 (Management Information Systems).

---

## Business Overview

Steakz is a premium UK restaurant chain operating across 7 branches. This MIS portal replaces a fragmented, manual paper-based system with a centralised digital platform that supports all operational and management roles.

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| Node.js | v20+ | Runtime |
| Express | ^5.2.1 | Web framework |
| TypeScript | ^6.0.3 | Type safety |
| Prisma ORM | ^6.19.3 | Database ORM |
| PostgreSQL | 15+ | Database |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT authentication |
| cors | ^2.8.6 | Cross-origin requests |
| dotenv | ^16.6.1 | Environment variables |
| tsx | ^4.21.0 | TypeScript runner |
| zod | ^3.23 | Request validation |
| pdfkit | ^0.15 | PDF receipt generation |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | ^19.2.6 | UI framework |
| TypeScript | ^6.0.3 | Type safety |
| Vite | ^8.0.12 | Build tool |
| React Router DOM | ^7.15.0 | Client-side routing |
| Axios | ^1.16.1 | HTTP client |
| Tailwind CSS | ^3.4 | Styling |
| Recharts | ^2.12 | Charts and analytics |
| Lucide React | ^1.14.0 | Icons |

---

## Branches

| Branch | City | Type |
|---|---|---|
| London Flagship | London | **Main Branch** |
| Manchester | Manchester | Standard |
| Birmingham | Birmingham | Standard |
| Leeds | Leeds | Standard |
| Edinburgh | Edinburgh | Standard |
| Bristol | Bristol | Standard |
| Liverpool | Liverpool | Standard |

---

## User Roles

| Role | Access Level | Description |
|---|---|---|
| ADMIN | Global — full control | Manages users, branches, roles, promotions |
| HM | Global — read only | Views all branch analytics and KPIs |
| BM | Own branch only | Monitors branch orders, staff, sales |
| CHEF | Own branch only | Manages kitchen orders and menu |
| CASHIER | Own branch only | Generates receipts and processes payments |
| WAITER | Own branch only | Takes orders and manages tables |

---

## ERD (Entity Relationship Diagram)

The ERD matches the Prisma schema exactly.

> **ERD Link:** [View on dbdiagram.io](https://dbdiagram.io) ← replace with your actual link

Entities: Branch, User, Table, Order, OrderItem, MenuItem, Receipt, Promotion, AuditLog

---

## Setup Instructions

### Prerequisites
- Node.js v20+
- PostgreSQL 15+
- npm

### 1. Clone the repository
```bash
git clone https://github.com/natashawanja/steakz.git
cd steakz
```

### 2. Set up the backend
```bash
cd backend
npm install
```

### 3. Create the .env file
Create a file called `.env` inside the `backend` folder: