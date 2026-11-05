# HelpFlow AI – AI-Powered IT Helpdesk Automation System

HelpFlow AI is an AI-powered IT Helpdesk Automation System designed to simplify IT support operations. It helps users create and manage support tickets while using Google Gemini AI to classify issues, predict priorities, generate troubleshooting suggestions, and create resolution summaries.

## 🌐 Live Demo

- **Frontend:** https://help-flow-ai.vercel.app
- **Backend:** https://helpflow-ai-backend.onrender.com
- **GitHub Repository:** https://github.com/ritikapandey9795-cpu/HelpFlow-AI

## ✨ Features

- **User Authentication:** Secure registration and login using JWT authentication.
- **Role-Based Access:** Separate Admin and Support Agent access.
- **Ticket Management:** Create, view, update, and delete support tickets.
- **AI Category Prediction:** Automatically identifies the category of IT issues.
- **AI Priority Prediction:** Suggests Low, Medium, or High priority.
- **AI Troubleshooting:** Generates practical troubleshooting steps.
- **AI Resolution Summary:** Creates concise summaries from resolution notes.
- **Dashboard Analytics:** Displays ticket statistics and reports.
- **Search and Filtering:** Search and filter tickets using available criteria.
- **Date-Wise Analytics:** View ticket information based on dates.
- **Responsive UI:** Interface designed for different screen sizes.

## 🛠️ Tech Stack

| Technology       | Purpose             |
| ---------------- | ------------------- |
| React.js         | Frontend            |
| Vite             | Frontend build tool |
| Node.js          | Backend runtime     |
| Express.js       | Backend framework   |
| MongoDB Atlas    | Database            |
| Mongoose         | Database ODM        |
| Google Gemini AI | AI-powered features |
| JWT              | Authentication      |
| CSS              | Styling             |
| Git & GitHub     | Version control     |
| Vercel           | Frontend deployment |
| Render           | Backend deployment  |

## 🏗️ Project Structure

```text
HelpFlow-AI/
│
├── public/
├── src/
│   ├── assets/
│   ├── App.jsx
│   └── App.css
│
├── server/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Ticket.js
│   │   └── User.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── server.js
│   └── package.json
│
├── index.html
├── package.json
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ritikapandey9795-cpu/HelpFlow-AI.git
```

### 2. Navigate to the Project

```bash
cd HelpFlow-AI
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Install Backend Dependencies

```bash
cd server
npm install
```

### 5. Configure Environment Variables

Create a `.env` file inside the `server` directory.

Add the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder values with your own credentials. Never upload `.env` or expose API keys and passwords on GitHub.

### 6. Start the Backend

From the `server` directory:

```bash
npm start
```

### 7. Start the Frontend

Open another terminal in the project root:

```bash
npm run dev
```

The Vite development server will display the local frontend URL in the terminal.

## 🔗 API Documentation

Base URL:

```text
https://helpflow-ai-backend.onrender.com
```

### Authentication APIs

Authentication routes are available under:

```text
/api/auth
```

### Ticket APIs

| Method | Endpoint                    | Description                  |
| ------ | --------------------------- | ---------------------------- |
| GET    | `/api/tickets`              | Fetch all tickets            |
| POST   | `/api/tickets`              | Create a ticket              |
| PATCH  | `/api/tickets/:id/status`   | Update ticket status         |
| PATCH  | `/api/tickets/:id/priority` | Update ticket priority       |
| DELETE | `/api/tickets/:id`          | Delete a ticket (Admin only) |

### AI APIs

| Method | Endpoint                     | Description                    |
| ------ | ---------------------------- | ------------------------------ |
| POST   | `/api/ai/predict-category`   | Predict ticket category        |
| POST   | `/api/ai/predict-priority`   | Predict ticket priority        |
| POST   | `/api/ai/troubleshoot`       | Generate troubleshooting steps |
| POST   | `/api/ai/resolution-summary` | Generate resolution summary    |

Ticket APIs require authentication. Admin authorization is required for ticket deletion.

## ☁️ Deployment

- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **Database Hosting:** MongoDB Atlas
- **AI Integration:** Google Gemini API

## 🔐 Security

- JWT-based authentication.
- Role-based access control.
- Environment variables for sensitive credentials.
- CORS configuration for the production frontend.
- Protected ticket management routes.

## 🎯 Project Objective

The main objective of HelpFlow AI is to improve IT helpdesk efficiency by combining ticket management with AI-powered assistance. It aims to reduce manual classification effort, support faster troubleshooting, and make IT support operations more organized.

## 👩‍💻 Author

**Ritika Pandey**

B.Tech – Computer Science and Engineering (2026)

- **GitHub:** https://github.com/ritikapandey9795-cpu
- **LinkedIn:** https://www.linkedin.com/in/ritikapandey3106/

---

⭐ If you find this project interesting, feel free to explore the repository and share your feedback.
