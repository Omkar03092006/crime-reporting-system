# Quick Start Guide - Crime Reporting System

## 🚀 Quick Commands to Run the Project

### **Backend (Spring Boot) - Terminal 1**

```cmd
cd D:\demo
mvnw spring-boot:run
```

**Backend runs on:** `http://localhost:8080` (default Spring Boot port)

⚠️ **Note:** Frontend expects backend on port 3001. Either:
- Change backend port to 3001 in `application.properties`: `server.port=3001`
- OR update `frontend/src/services/apiService.ts` line 6 to use port 8080

---

### **Frontend (Next.js) - Terminal 2**

```cmd
cd D:\demo\frontend
npm install
npm run dev
```

**Frontend runs on:** `http://localhost:3000`

---

## ⚠️ Important Notes

1. **Run both terminals simultaneously** - Backend and Frontend must run at the same time
2. **Database**: Make sure MySQL is running OR the system will use H2 database automatically
3. **First Time Setup**: Run `npm install` in frontend directory only once
4. **Access**: Open browser to `http://localhost:3000` after both servers start

---

## 📋 What This Project Does

**Crime Reporting & Transparency Platform**

- ✅ Citizens can **report crimes** with location
- ✅ **Interactive map** shows all reported crimes
- ✅ **Transparency** - everyone can see reported crimes
- ✅ **Real-time** crime data
- ✅ **Secure authentication** system
- ✅ **Admin dashboard** for authorities

**Problem Solved:** Brings transparency between citizens and authorities by making crime data publicly accessible and enabling easy reporting.

---

## 🔧 If Something Doesn't Work

**Backend not starting?**
- Check Java 17 is installed: `java -version`
- Check port 8080 is free
- Check MySQL is running (or it will use H2)

**Frontend not starting?**
- Run `npm install` first
- Check port 3000 is free
- Make sure backend is running first

**Can't connect to API?**
- Backend must be running on port 8080
- Check `frontend/src/services/apiService.ts` for API URL

---

For detailed information, see **PROJECT_GUIDE.md**

