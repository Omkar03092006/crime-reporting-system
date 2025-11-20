# Crime Reporting System - Project Guide

## 📋 Project Description

This is a **Crime Reporting and Transparency Platform** - a full-stack web application designed to bridge the gap between citizens and law enforcement authorities. The system enables citizens to report crimes in real-time with precise geolocation data, view reported incidents on an interactive map, and promotes transparency in crime data management.

### Technology Stack

**Backend:**
- **Spring Boot 3.2.3** (Java 17)
- **Spring Data JPA** for database operations
- **Spring Security** for authentication and authorization
- **JWT (JSON Web Tokens)** for secure authentication
- **MySQL Database** (with H2 as fallback)
- **Maven** for dependency management

**Frontend:**
- **Next.js 15.2.2** (React 18)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Leaflet & Mapbox GL** for interactive maps
- **Axios** for API communication

---

## 🎯 Problem It Solves

### 1. **Transparency Between Citizens and Authorities**
   - **Public Access to Crime Data**: Citizens can view all reported crimes in their area, promoting transparency
   - **Real-time Reporting**: Immediate reporting of incidents with geolocation ensures accurate data
   - **Accountability**: All crimes are timestamped and linked to reporting users, creating an audit trail

### 2. **Community Safety Awareness**
   - **Crime Mapping**: Interactive maps show crime hotspots and patterns
   - **Nearby Crime Alerts**: Users can see crimes within 1km radius of their location
   - **Crime Type Categorization**: Crimes are categorized (Theft, Assault, Burglary, Vandalism, Fraud, Kidnapping) for better understanding

### 3. **Efficient Crime Reporting**
   - **Geolocation-Based Reporting**: Precise location data using latitude/longitude coordinates
   - **User-Friendly Interface**: Modern, intuitive UI for easy crime reporting
   - **Secure Authentication**: JWT-based authentication ensures only registered users can report

### 4. **Data-Driven Decision Making**
   - **Crime Analytics**: Authorities can analyze crime patterns and trends
   - **Geographic Insights**: Location-based data helps in resource allocation
   - **Historical Records**: All crimes are stored with timestamps for trend analysis

### 5. **Digital Transformation**
   - **Reduces Paperwork**: Digital reporting eliminates physical forms
   - **Faster Response Times**: Real-time reporting enables quicker response
   - **Accessibility**: Web-based platform accessible from any device

---

## 🏗️ Architecture Overview

### Backend Structure
```
src/main/java/com/example/demo/
├── config/          # Security & CORS configuration
├── controller/      # REST API endpoints
│   ├── AuthController.java    # Login/Register
│   ├── CrimeController.java   # Crime CRUD operations
│   └── UserController.java    # User management
├── model/           # Entity classes (Crime, User)
├── repository/      # Data access layer
├── service/         # Business logic
└── utils/           # Utility classes
```

### Frontend Structure
```
frontend/src/
├── app/             # Next.js pages
│   ├── page.tsx           # Home page with map
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── report/            # Crime reporting form
│   ├── crimes/            # List all crimes
│   ├── crimes/[id]/       # Crime detail view
│   ├── profile/           # User profile
│   └── admin/             # Admin dashboard
├── components/      # React components
│   ├── HomeMap.tsx         # Main map component
│   ├── CrimeReportForm.tsx # Reporting form
│   └── AuthGuard.tsx       # Route protection
└── services/        # API services
    ├── apiService.ts       # Crime API calls
    └── authService.ts      # Authentication
```

---

## 🚀 How to Run the Project

### Prerequisites
- **Java 17** or higher
- **Node.js 18+** and npm
- **MySQL 8.0+** (or use H2 in-memory database)
- **Maven 3.6+**

---

### Step 1: Database Setup

#### Option A: Using MySQL (Recommended for Production)
1. Create a MySQL database:
```sql
CREATE DATABASE crime_alert_db;
```

2. Update `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/crime_alert_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

#### Option B: Using H2 (For Development/Testing)
The project includes H2 database support. If MySQL is not available, H2 will be used automatically.

---

### Step 2: Run the Backend (Spring Boot)

**Open Command Prompt (CMD) or PowerShell:**

```cmd
# Navigate to project root directory
cd D:\demo

# Run Spring Boot application using Maven
mvnw spring-boot:run

# OR if you have Maven installed globally:
mvn spring-boot:run
```

**The backend will start on:** `http://localhost:8080`

**API Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/crimes` - Get all crimes
- `POST /api/crimes` - Report a crime
- `GET /api/crimes/{id}` - Get crime by ID
- `GET /api/crimes/nearby?latitude=X&longitude=Y` - Get nearby crimes
- `DELETE /api/crimes/{id}` - Delete a crime

---

### Step 3: Run the Frontend (Next.js)

**Open a NEW Command Prompt (CMD) or PowerShell window:**

```cmd
# Navigate to frontend directory
cd D:\demo\frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**The frontend will start on:** `http://localhost:3000`

---

### Step 4: Access the Application

1. Open your browser and go to: `http://localhost:3000`
2. Register a new account or login
3. Start reporting crimes and viewing them on the map!

---

## 📝 Quick Start Commands Summary

### Backend (Terminal 1):
```cmd
cd D:\demo
mvnw spring-boot:run
```

### Frontend (Terminal 2):
```cmd
cd D:\demo\frontend
npm install    # First time only
npm run dev
```

---

## 🔑 Default Configuration

### Backend Port
- Default: `8080`
- Can be changed in `application.properties`: `server.port=YOUR_PORT`

### Frontend Port
- Default: `3000`
- Can be changed: `npm run dev -- -p YOUR_PORT`

### API URL
- Frontend expects backend at: `http://localhost:3001/api` (check `frontend/src/services/apiService.ts`)
- If backend runs on different port, update the `API_URL` in `apiService.ts`

---

## 🎨 Key Features

### For Citizens:
1. **User Registration & Authentication** - Secure account creation
2. **Crime Reporting** - Report crimes with location, type, and description
3. **Interactive Map** - View all reported crimes on a map
4. **Crime Listings** - Browse all reported crimes with details
5. **Profile Management** - View and manage user profile
6. **Nearby Crimes** - See crimes within 1km radius

### For Authorities (Admin):
1. **Admin Dashboard** - Access to all crime data
2. **Crime Management** - View, analyze, and manage reported crimes
3. **Data Analytics** - Crime patterns and trends

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Passwords are securely hashed
- **CORS Configuration** - Cross-origin requests properly configured
- **Route Protection** - Frontend routes protected with AuthGuard
- **Input Validation** - Server-side validation for all inputs

---

## 📊 Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password` - Hashed password
- `name` - User's full name
- `latitude` - User location latitude
- `longitude` - User location longitude
- `enabled` - Account status
- `registered_at` - Registration timestamp

### Crimes Table
- `id` - Primary key
- `crime_type` - Type of crime
- `description` - Crime description
- `location` - Location address
- `latitude` - Crime location latitude
- `longitude` - Crime location longitude
- `reported_at` - Reporting timestamp
- `reported_by` - Foreign key to users table

---

## 🐛 Troubleshooting

### Backend Issues:
1. **Port 8080 already in use:**
   - Change port in `application.properties`: `server.port=8081`

2. **Database connection error:**
   - Check MySQL is running
   - Verify credentials in `application.properties`
   - Or use H2 database (automatic fallback)

3. **Maven build fails:**
   - Ensure Java 17+ is installed: `java -version`
   - Clean and rebuild: `mvnw clean install`

### Frontend Issues:
1. **Port 3000 already in use:**
   - Use different port: `npm run dev -- -p 3001`

2. **API connection error:**
   - Ensure backend is running on port 8080
   - Check `API_URL` in `apiService.ts` matches backend URL

3. **Dependencies not installed:**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

---

## 📚 Additional Notes

- The system uses **geolocation** for accurate crime reporting
- Crimes are displayed on **interactive maps** using Leaflet/Mapbox
- All crimes are **publicly visible** to promote transparency
- Users can only **delete their own reported crimes**
- The system supports **real-time crime reporting** with immediate map updates

---

## 🌟 Future Enhancements

Potential improvements:
- Email notifications for nearby crimes
- SMS alerts for critical incidents
- Mobile app version
- Advanced analytics dashboard
- Crime statistics and trends
- Integration with law enforcement systems
- Anonymous reporting option
- Photo/video evidence upload

---

**Built with ❤️ for community safety and transparency**

