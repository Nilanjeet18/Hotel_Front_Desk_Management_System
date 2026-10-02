# 🚀 Hotel Front Desk Management System

A full-stack Hotel Front Desk Management System application built with Java Backend and React Frontend, designed to efficiently manage and automate business operations.

---

## ✨ Features

- 🔐 User Authentication & Authorization
- 📊 Dashboard & Analytics
- 📝 CRUD Operations
- 📂 Data Management
- 📈 Reports & Statistics
- 📱 Responsive UI Design
- ⚡ Real-time Updates
- 🔍 Search & Filter Functionality

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Tailwind CSS

### Backend

- Java
- Spring Boot
- Spring Security
- Hibernate / JPA
- REST API

### Database

- MySQL

### Tools

- Git & GitHub
- Postman
- VS Code
- STS ( Spring Tool Suite )

---

## 📋 Prerequisites

Before running this application, make sure you have installed:

- Java JDK 17+
- Maven
- Node.js (v18+)
- MySQL Server
- Git

---

## 🔧 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Nilanjeet18/Hotel_Front_Desk_Management_System.git

cd Hotel_Front_Desk_Management_System
```

### 2. Backend Setup

```bash
cd Backend

# Configure Database Connection in application.properties

spring.datasource.url=jdbc:mysql://localhost:3306/vhoteldb_task2
spring.datasource.username=your_username
spring.datasource.password=your_password
```

Run Backend

```bash
mvn clean install

mvn spring-boot:run
```

Backend URL

```bash
http://localhost:8080
```

---

### 3. Frontend Setup

```bash
cd Frontend

# Install Dependencies 
npm install

# Start the development server
npm run dev
```

Frontend URL

```bash
http://localhost:5173
```

---

### 4. Database Setup

```sql
CREATE DATABASE vhoteldb_task2;
```

Tables will be created automatically if configured.

---

## 🎯 Usage

### Login

```text
Username: admin@example.com
Password: admin123
```

### Main Modules

- Dashboard
- User Management
- Product Management
- Reports
- Settings

---

## 📂 Project Structure

```text
Project-Name/

├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🔑 API Endpoints

### Authentication

```http
POST /api/auth/login
POST /api/auth/register
```

### Users

```http
GET    /api/users
GET    /api/users/{id}
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}
```

### Reports

```http
GET /api/reports/daily
GET /api/reports/monthly
```

## 🔒 Security Features

- JWT Authentication
- Password Encryption
- Role-Based Access Control
- Secure REST APIs

---

## 🚀 Future Enhancements

- Email Notifications
- SMS Alerts
- Mobile Application
- Cloud Deployment
- AI-Based Analytics

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the Repository
2. Create Feature Branch

```bash
git checkout -b feature/NewFeature
```

3. Commit Changes

```bash
git commit -m "Added New Feature"
```

4. Push Changes

```bash
git push origin feature/NewFeature
```

5. Create Pull Request

---

## 👨‍💻 Author

**Nilanjeet Gugale**

- GitHub: [https://github.com/Nilanjeet18]
- LinkedIn: [https://www.linkedin.com/in/nilanjeet-gugale-b06534252/]
- Email: [nilanjeetgugale@gmail.com]

---

## 🙏 Acknowledgements

- Thanks to all contributors who helped in developing this project.
- Inspired by modern hotel management and front desk systems used in the hospitality industry.
- Built to streamline hotel operations, guest management, and booking processes.

---

## 📞 Support

For support:

📧 nilanjeetgugale@gmail.com

---

⭐ If you found this project useful, please give it a Star.
