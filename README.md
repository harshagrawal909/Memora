# 🌿 Memora  
### Your Private Space for Personal Memories

**Memora** is a privacy-first, full-stack digital journaling platform designed for people who value **ownership, security, and solitude**.  
Your memories are not data points — they are *yours*, encrypted and protected by design.

***

## ✨ Why Memora?

In a world where personal content is constantly analyzed and monetized, **Memora chooses a different path**:

- ❌ No data mining  
- ❌ No third-party tracking  
- ❌ No hidden analytics on your memories  

✔ 100% private  
✔ User-controlled  
✔ Built for trust

***

## 🚀 Key Features

### 🔐 Security & Privacy
- Encrypted authentication using `bcryptjs`
- JWT-based authorization
- Email verification via **EmailJS**
- Secure Google OAuth login
- Private-by-default architecture
- Zero content analysis policy

***

### 📝 Core Functionality
- ✍️ Private journaling in a secure environment
- 🖼️ Profile & avatar management via **Cloudinary**
- 🗑️ Complete account deletion  
  (Database records + cloud media wiped instantly)

***

### 🛠️ Engineering Highlights
- SMTP-free email delivery using HTTPS APIs (Render-safe)
- Centralized environment configuration
- Scalable backend architecture
- Clean separation of frontend & backend services

***

## 🧰 Tech Stack

### Frontend
- **Next.js 14**
- **React**
- **Tailwind CSS**

### Backend
- **Node.js**
- **Express.js**
- **JWT Authentication**

### Database
- **PostgreSQL**
- **Supabase** (connection pooling & hosting)

### Cloud & Services
- **EmailJS** – verification & security emails  
- **Cloudinary** – image hosting  
- **Cloudflare R2** – secure object storage  
- **Google OAuth 2.0**

***

## ⚙️ Environment Setup

Create a `.env` file in the backend root directory.

> ⚠️ **Never commit your `.env` file to version control**

```env
# Server
PORT=5000
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://memora-frontend-six.vercel.app

# Database
DATABASE_URL=your_postgresql_connection_string

# EmailJS
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_MASTER_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
```

***

## 📡 API Endpoints

| Method | Endpoint                    | Description                             |
| :--- | :--- | :--- | 
| **POST**   | `/api/auth/signup`          | Register user & send verification email |
| **GET**    | `/api/auth/verify`          | Verify account via secure token         |
| **POST**   | `/api/auth/login`           | Authenticate user & issue JWT           |
| **POST**   | `/api/auth/forgot-password` | Send password reset email               |
| **PUT**    | `/api/auth/update-avatar`   | Update profile image                    |
| **DELETE** | `/api/auth/delete-account`  | Delete account & all related data       |

***

## 🚦 Getting Started
Follow these steps to get your development environment up and running.

### Prerequisites

* Node.js v18 or higher

* PostgreSQL (local or Supabase)

* Git

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/harshagrawal909/memora.git


# Navigate to the backend project directory and installing dependencies
cd memora-backend
npm install

# Navigate to the frontend project directory and installing dependencies
cd ../memora-frontend
npm install
# or yarn install
```

### 2. Database Setup

* Configure PostgreSQL or Supabase

* Run migration scripts from the /db directory 

### 3. Run Locally
```bash
npm run dev
```

### 🛡️ Privacy Commitment

Memora is built for storytellers who value silence and ownership.

* 🔒 Your data remains encrypted

* 🧠 No AI training on your content

* 🗝️ You control deletion — permanently


### Roadmap

* 📱 Mobile-first UI improvements

* 🧠 Local-only encryption layer

* 🌐 Offline journaling mode

* 🧾 Export memories (PDF / Markdown)


### 🤝 Contributing

Contributions, ideas, and discussions are welcome.

Feel free to open an issue or submit a pull request.


### 📜 License

This project is licensed under the MIT License.