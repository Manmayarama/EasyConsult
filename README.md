# <img src="https://github.com/Manmayarama/EasyConsult/blob/main/frontend/public/logo.svg" alt="Logo" width="30" style="vertical-align: middle;"/>  EasyConsult

Welcome to **EasyConsult** — a modern online **Doctor Appointment Booking Platform**.  
Designed to make booking and managing Appointments simple for users. Built with JavaScript (React + Node) and MongoDB — ready to integrate with authentication, payments.

---

## 🌟 Features

- 🔐 Secure user authentication (Custom with Password Reset Feature)  
- 📅 Appointment booking with availability management  
- 👨‍⚕️ Doctor profiles and service listings  
- 💳 Optional payments using Razor Pay 
- ✉️ Email notifications for confirmations & reminders  
- 🔎 Admin dashboard to manage Doctors and appointments  
- 📱 Responsive UI for desktop & mobile

---

## 🕹️ How It Works

1. **Sign Up / Log In** → Users and providers sign up and authenticate.  
2. **Find a Doctor** → Browse availability.  
3. **Book a Slot** → Choose a time slot and confirm booking.  
4. **Pay (Optional)** → Pay securely if the service requires payment.  
5. **Get Confirmation** → Receive email confirmation  
6. **Manage Appointments** → Admin,Users and Doctors manage Appointments

---

## 🧠 Tech Stack (suggested)

| Layer         | Tech / Options                      |
|---------------|-------------------------------------|
| Frontend      | React (Vite), Tailwind CSS          |
| Backend       | Node.js, Express                    |
| Database      | MongoDB + Mongoose,Cloudinary       |
| Auth          | JWT                                 |
| Payments      | Razor Pay                           |
| Emails        | Nodemailer(Gmail)                   |
| Hosting       | Vercel(frontend,backend,admin-panel)|

---

## ⚙️ Requirements

- Node.js v16+  
- npm or yarn  
- MongoDB (Atlas or local)   
- Razor Pay API keys for payments
- Cloudinary to store profile and other images
- SMTP credentials (Gmail)

---

## 🛠️ Setup Instructions

To get EasyConsult running locally, follow these steps.

### 📥 Clone the repo

```bash
git clone https://github.com/Manmayarama/EasyConsult.git
cd EasyConsult
```

### 📦 Install Dependencies

If the project is split into `client` and `server` directories, install both:

```bash
# from repo root
cd frontend && npm install      # frontend deps
cd ../backend && npm install    # backend deps
cd ../admin && npm install      # admin deps
```

### 🔐 Environment Variables

Create a `.env` file for the backend directory.

```env
# MongoDB
MONGODB_URI="your_mongodb_connection_string_here"

# Cloudinary (for image uploads)
CLOUDINARY_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_SECRET_KEY="your_cloudinary_api_secret"

# Admin user (initial/admin seeding)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="ChangeThisToAStrongPassword"

# JWT secret for signing tokens
JWT_SECRET="generate_a_secure_random_secret_here"

# Payment (Razorpay) - used for payments in India
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Currency code
CURRENCY="INR"

# SMTP for sending emails (Gmail, SendGrid, Mailgun, etc.)
EMAIL_USER="your_smtp_username_or_email"
EMAIL_PASS="your_smtp_password_or_app_password"
```

Create a `.env` file for the frontend directory.

```env
VITE_BACKEND_URL="http://localhost:4000"
VITE_RAZORPAY_KEY_ID="your_razorpay_key_id"
```

Create a `.env` file for the admin directory.
```env
VITE_BACKEND_URL='http://localhost:4000'
```

---

## 🚀 Running the Application

### 🗄️ Start the Backend

From the `backend` directory:

```bash
npm run server
```

### 📱 Start the Frontend

From the `frontend` directory:

```bash
npm run dev
```

### 📱 Start the Admin

From the `admin` directory:

```bash
npm run dev
```
---

## 🧾 Admin Capabilities (what admins can do)

Admins have the following capabilities in the Admin Panel:

- ➕ Add Doctor
- ❌ Delete Doctor
- 👁️ View Doctors
- 📊 View Bookings per Doctor
- ✅ Mark Booking Completed / Uncompleted
- 🔁 Toggle Doctor Availability
- 🧾 Print / Export Receipts
- 💳 View Earnings
---

## 🩺 Doctor Capabilities (what doctors can do in their dashboard)

Doctors have the following capabilities in their own dashboard:

- 👁️ View Bookings
- ✅ Mark Booking Completed or Uncompleted
- 🧾 Print Receipt with Medicine Description
- 🧑‍⚕️ View & Update Profile
- 💲 Update Consultation Charge
- 🔁 Toggle Availability
- 📊 View Bookings & Earnings
---

## 🌐 Live Demos

- User (client): https://easy-consult-fawn.vercel.app/  
- Admin (dashboard): https://easy-consult-dashboard.vercel.app/

---

## 👥 Collaborators & Maintainers

This project is actively maintained and developed by a team.

- Maintainer
  - Manmaya Rama — Project lead, frontend, backend, deployment, and overall architecture  
    GitHub: https://github.com/Manmayarama

- Collaborators
  - Adarsh Shetty — Frontend components, client-side integrations  
    GitHub: https://github.com/Adarsh864
  - Ashwith K — UI/UX, Tailwind styling and responsive design  
    GitHub: https://github.com/Ashwith-K
  - N C Gowtham — Payment integration, third‑party APIs 
    GitHub: https://github.com/NC-Gowtham
