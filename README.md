# 🧠 AI-Powered Smart Notes & Document Analyzer

An intelligent, full-stack note-taking and document analysis application built with Spring Boot and React. This system leverages the Google Gemini AI API to automatically generate comprehensive summaries and smart titles from both plain text and uploaded PDF documents.

## ✨ Key Features

* **🤖 AI Integration:** Automatically extracts core concepts from long texts and generates smart titles using Google Gemini API.
* **📄 PDF Document Processing:** Utilizes Apache PDFBox to extract and sanitize raw text from binary PDF uploads (BLOB) for AI analysis.
* **🌗 Modern UI/UX:** Features a dynamic Dark/Light mode toggle, custom toast notifications, and a highly responsive design.
* **🖱️ Drag & Drop Functionality:** Seamless file uploading experience with HTML5 Drag and Drop API integration.
* **⚡ Optimized Rendering:** Displays notes in reverse chronological order with dynamic content truncation ("Show More/Less") for maximum readability.
* **🔍 Live Search:** Real-time filtering through note titles and contents.

## 🛠️ Technology Stack

**Backend (RESTful API):**
* Java 17
* Spring Boot 3.x
* Spring Data JPA
* H2 Database (In-Memory)
* Apache PDFBox (Document Processing)
* Maven

**Frontend (Client):**
* React.js
* Axios (Asynchronous HTTP requests)
* CSS-in-JS (Custom animations and dynamic styling)

## 🚀 Getting Started

### Prerequisites
* JDK 17 or higher
* Node.js and npm
* A valid Google Gemini API Key

### Backend Setup
1. Clone the repository.
2. Navigate to the Spring Boot project root directory.
3. Open `src/main/resources/application.properties` and add your Gemini API key:
   ```properties
   gemini.api.key=YOUR_API_KEY_HERE
   gemini.api.url=[https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=](https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=)
   spring.servlet.multipart.max-file-size=50MB
   spring.servlet.multipart.max-request-size=50MB
Run the application using your IDE (IntelliJ IDEA) or via Maven:

Bash
mvn spring-boot:run
The API will be available at http://localhost:8080

Frontend Setup
Navigate to the React project directory.

Install the dependencies:

Bash
npm install
Start the development server:

Bash
npm start
The client will be available at http://localhost:3000

🏗️ Architecture & Design Decisions
Multipart/Form-Data: Used for handling binary PDF uploads alongside text data to prevent memory overhead associated with Base64 encoding.

Data Sanitization: Implemented a custom sanitization algorithm before passing extracted PDF text to the LLM to prevent JSON formatting corruption.

Bottom-Up MVC: Designed with strict adherence to Single Responsibility principles across Controller, Service, and Repository layers.

Developed as part of a comprehensive Software Engineering internship project.
