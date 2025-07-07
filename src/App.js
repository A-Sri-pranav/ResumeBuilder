import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, where, query } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import jsPDF from 'jspdf';
import './App.css';

// Firebase configuration (replace with your Firebase project config)
  const firebaseConfig = {
    apiKey: "AIzaSyATXWxKLESB5z0xhFK6Fq0cf_3Zfpe7Kl8",
    authDomain: "resumebuilder-add06.firebaseapp.com",
    projectId: "resumebuilder-add06",
    storageBucket: "resumebuilder-add06.firebasestorage.app",
    messagingSenderId: "461230059713",
    appId: "1:461230059713:web:62a14c34a84990a20e6440",
    measurementId: "G-MSN8WKHDHQ"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const App = () => {
  const [user, setUser] = useState(null);
  const [resume, setResume] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    objective: '',
    education: '',
    workExperience: '',
    skills: '',
    certifications: '',
    projects: '',
    additionalSkills: ''
  });
  const [resumes, setResumes] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) fetchResumes(user.uid);
    });
    return () => unsubscribe();
  }, []);

  // Fetch resumes from Firestore
  const fetchResumes = async (uid) => {
    try {
      const resumeRef = query(collection(db, 'resumes'), where('userId', '==', uid));
      const snapshot = await getDocs(resumeRef);
      const resumeList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResumes(resumeList);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      alert('Failed to load resumes');
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setResume({ ...resume, [e.target.name]: e.target.value });
  };

  // Save resume to Firestore
  const saveResume = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to save your resume');
      return;
    }
    // Validate required fields
    if (!resume.name || !resume.email) {
      alert('Name and Email are required');
      return;
    }
    try {
      await addDoc(collection(db, 'resumes'), {
        ...resume,
        userId: user.uid,
        createdAt: new Date()
      });
      alert('Resume saved successfully!');
      fetchResumes(user.uid);
      setResume({
        name: '',
        email: '',
        phone: '',
        address: '',
        objective: '',
        education: '',
        workExperience: '',
        skills: '',
        certifications: '',
        projects: '',
        additionalSkills: ''
      });
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Error saving resume');
    }
  };

  // Download resume as PDF
  const downloadResume = (res) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Margins and constants
    const leftMargin = 20;
    const rightMargin = 20;
    const maxWidth = 210 - leftMargin - rightMargin; // A4 width is 210mm
    const lineHeight = 7;

    // Helper function to safely add text and return height
    const addSafeText = (text, x, y, options = {}) => {
      const safeText = (text && typeof text === 'string') ? text : 'Not provided';
      const lines = doc.splitTextToSize(safeText, options.maxWidth || maxWidth);
      doc.text(lines, x, y, options);
      return lines.length * lineHeight;
    };

    // Helper function to add section header
    const addSectionHeader = (text, y) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      const height = addSafeText(text, leftMargin, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      return height;
    };

    // Helper function to add bulleted list
    const addBulletedList = (text, x, y, prefix = '- ') => {
      const safeText = (text && typeof text === 'string') ? text : 'Not provided';
      const items = safeText.split('\n').filter(item => item.trim());
      let currentY = y;
      for (const item of items) {
        const lines = doc.splitTextToSize(`${prefix}${item.trim()}`, maxWidth - 5);
        doc.text(lines, x, currentY);
        currentY += lines.length * lineHeight;
      }
      return currentY - y;
    };

    let yPos = 10;

    // Header: Name and Contact Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    yPos += addSafeText(res.name, 105, yPos, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const contactInfo = [
      res.email,
      res.phone,
      res.address
    ].filter(Boolean).join(' | ');
    yPos += addSafeText(contactInfo, 105, yPos, { align: 'center' });
    yPos += 5;

    // Divider
    doc.setLineWidth(0.5);
    doc.line(leftMargin, yPos, 210 - rightMargin, yPos);
    yPos += 10;

    // Objective
    yPos += addSectionHeader('Objective', yPos);
    yPos += addSafeText(res.objective, leftMargin + 5, yPos);
    yPos += 5;

    // Education
    yPos += addSectionHeader('Education', yPos);
    yPos += addBulletedList(res.education, leftMargin + 5, yPos);
    yPos += 5;

    // Work Experience
    yPos += addSectionHeader('Work Experience', yPos);
    yPos += addBulletedList(res.workExperience, leftMargin + 5, yPos);
    yPos += 5;

    // Skills
    yPos += addSectionHeader('Skills', yPos);
    yPos += addBulletedList(res.skills, leftMargin + 5, yPos);
    yPos += 5;

    // Certifications
    yPos += addSectionHeader('Certifications', yPos);
    yPos += addBulletedList(res.certifications, leftMargin + 5, yPos);
    yPos += 5;

    // Projects
    yPos += addSectionHeader('Projects', yPos);
    yPos += addBulletedList(res.projects, leftMargin + 5, yPos);
    yPos += 5;

    // Additional Skills
    yPos += addSectionHeader('Additional Skills', yPos);
    yPos += addBulletedList(res.additionalSkills, leftMargin + 5, yPos);

    // Save PDF
    const fileName = res.name && typeof res.name === 'string' 
      ? `${res.name.replace(/\s+/g, '_')}_resume.pdf`
      : 'resume.pdf';
    doc.save(fileName);
  };

  // Handle user sign-in
  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Signed in successfully!');
    } catch (error) {
      console.error('Sign-in error:', error);
      alert('Sign-in failed: ' + error.message);
    }
  };

  // Handle user sign-out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setResumes([]);
      alert('Signed out successfully!');
    } catch (error) {
      console.error('Sign-out error:', error);
      alert('Sign-out failed');
    }
  };

  return (
    <div className="app-container">
      <h1>Resume Builder</h1>

      {!user ? (
        <div className="auth-container">
          <h2>Sign In</h2>
          <form className="auth-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input-field"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-field"
              required
            />
            <button
              onClick={handleSignIn}
              className="btn btn-primary"
            >
              Sign In
            </button>
          </form>
        </div>
      ) : (
        <div className="resume-section">
          <div className="resume-form-container">
            <h2>Create Resume</h2>
            <form className="resume-form">
              <input
                type="text"
                name="name"
                value={resume.name}
                onChange={handleChange}
                placeholder="Full Name *"
                className="input-field"
                required
              />
              <input
                type="email"
                name="email"
                value={resume.email}
                onChange={handleChange}
                placeholder="Email *"
                className="input-field"
                required
              />
              <input
                type="text"
                name="phone"
                value={resume.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="input-field"
              />
              <input
                type="text"
                name="address"
                value={resume.address}
                onChange={handleChange}
                placeholder="Address"
                className="input-field"
              />
              <textarea
                name="objective"
                value={resume.objective}
                onChange={handleChange}
                placeholder="Career Objective (e.g., Seeking a role to leverage my skills in...)"
                className="input-field textarea"
              />
              <textarea
                name="education"
                value={resume.education}
                onChange={handleChange}
                placeholder="Education (e.g., B.S. Computer Science, XYZ University, 2018-2022)"
                className="input-field textarea"
              />
              <textarea
                name="workExperience"
                value={resume.workExperience}
                onChange={handleChange}
                placeholder="Work Experience (e.g., Software Engineer, ABC Corp, 2022-Present, Developed...)"
                className="input-field textarea"
              />
              <textarea
                name="skills"
                value={resume.skills}
                onChange={handleChange}
                placeholder="Skills (e.g., JavaScript, Python, Project Management)"
                className="input-field textarea"
              />
              <textarea
                name="certifications"
                value={resume.certifications}
                onChange={handleChange}
                placeholder="Certifications (e.g., AWS Certified Developer, 2023)"
                className="input-field textarea"
              />
              <textarea
                name="projects"
                value={resume.projects}
                onChange={handleChange}
                placeholder="Projects (e.g., Portfolio Website, Built with React, 2023)"
                className="input-field textarea"
              />
              <textarea
                name="additionalSkills"
                value={resume.additionalSkills}
                onChange={handleChange}
                placeholder="Additional Skills (e.g., Git, Docker, Agile Methodologies)"
                className="input-field textarea"
              />
              <button
                onClick={saveResume}
                className="btn btn-success"
              >
                Save Resume
              </button>
              <button
                onClick={handleSignOut}
                className="btn btn-danger"
              >
                Sign Out
              </button>
            </form>
          </div>
          <div className="resume-list-container">
            <h2>Saved Resumes</h2>
            {resumes.length === 0 ? (
              <p>No resumes saved yet.</p>
            ) : (
              <ul className="resume-list">
                {resumes.map((res) => (
                  <li key={res.id} className="resume-item">
                    <h3>{res.name || 'Untitled'}</h3>
                    <p><strong>Email:</strong> {res.email || 'Not provided'}</p>
                    <p><strong>Phone:</strong> {res.phone || 'Not provided'}</p>
                    <p><strong>Address:</strong> {res.address || 'Not provided'}</p>
                    <p><strong>Objective:</strong> {res.objective || 'Not provided'}</p>
                    <p><strong>Education:</strong> {res.education || 'Not provided'}</p>
                    <p><strong>Work Experience:</strong> {res.workExperience || 'Not provided'}</p>
                    <p><strong>Skills:</strong> {res.skills || 'Not provided'}</p>
                    <p><strong>Certifications:</strong> {res.certifications || 'Not provided'}</p>
                    <p><strong>Projects:</strong> {res.projects || 'Not provided'}</p>
                    <p><strong>Additional Skills:</strong> {res.additionalSkills || 'Not provided'}</p>
                    <button
                      onClick={() => downloadResume(res)}
                      className="btn btn-primary"
                    >
                      Download PDF
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;