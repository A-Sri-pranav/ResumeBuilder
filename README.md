Resume Builder Web App

A React-based web application for creating, saving, and downloading professional resumes, optimized for Applicant Tracking Systems (ATS). Uses Firebase Firestore for data storage and jsPDF for PDF downloads.

Features:

-User authentication (sign-in/sign-out) with Firebase Authentication.

-Create resumes with ATS-friendly fields: Name, Email, Phone, Address, Objective, Education, Work Experience, Skills, Certifications, Projects, Additional Skills.

-Save resumes to Firebase Firestore.

-View and download resumes as PDFs.

-Modern, responsive UI with a professional gradient background.


Prerequisites

-Node.js (v16 or later)
-firebase account
-stable internet connection

Setup Instructions

-Clone or Set Up Repository:

cd D:\Cloud task\ResumeBuilder
npx create-react-app@5.1.0 resume-builder
cd resume-builder

-Install Dependencies:

npm install firebase jspdf

If network errors occur:

Clear cache: npm cache clean --force
Try Yarn: npm install -g yarn && yarn add firebase jspdf
Fix vulnerabilities: npm audit fix or npm audit fix --force



Set Up Firebase:
-Create a Firebase project at Firebase Console.
-Enable Email/Password Authentication.
-Create a Firestore Database (test mode).
-Copy firebaseConfig from Project Settings > General > Your apps > Web.
-Replace firebaseConfig in src/App.js.



Add Code:

Replace src/App.js, src/App.css, src/index.js, and public/index.html with provided files.
Add this README.md to the project root.



Secure Firestore: In Firebase Console > Firestore Database > Rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /resumes/{resumeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}



Test Locally:

npm start

Open http://localhost:3000 to test sign-in, resume creation, and PDF download.



Deploy to Firebase Hosting:

npm install -g firebase-tools
firebase login
firebase init hosting





Select your Firebase project.



Set public directory to build.



Configure as a single-page app.

npm run build
firebase deploy

Access at https://your-project-id.web.app.