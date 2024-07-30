import React from 'react';
import ResearchPaperSummarizer from './ResearchPaperSummarizer';
import './index.css';


const App: React.FC = () => {
  return (
    <div className="App bg-gray-100 min-h-screen">
      <ResearchPaperSummarizer />
    </div>
  );
};

export default App;


// import React, { useState, CSSProperties, useEffect } from 'react';
// import axios from 'axios';
// import { FaBusinessTime, FaMicrochip, FaFileAlt } from 'react-icons/fa';
// import './index.css';

// interface SectionData {
//   [key: string]: string;
// }

// interface ApiResponse {
//   section_headers: string[];
//   extracted_text: SectionData;
// }

// const styles: Record<string, CSSProperties> = {
//   container: { 
//     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
//     backgroundColor: '#ffffff',
//     color: '#333',
//   },
//   header: {
//     backgroundColor: '#000',
//     color: '#fff',
//     padding: '15px 20px',
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   headerPane: {
//     flex: 1,
//     textAlign: 'center',
//     fontSize: '16px',
//     cursor: 'pointer',
//   },
//   mainContent: {
//     padding: '40px 20px',
//     maxWidth: '1200px',
//     margin: '0 auto',
//   },
//   inputSection: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'flex-start',
//     marginBottom: '40px',
//   },
//   inputContainer: { 
//     display: 'flex',
//     alignItems: 'center',
//     width: '100%',
//     marginBottom: '10px',
//   },
//   input: { 
//     flex: 1,
//     padding: '12px',
//     fontSize: '16px',
//     border: '1px solid #e0e0e0',
//     borderRadius: '4px',
//     marginRight: '10px',
//   },
//   button: { 
//     padding: '12px 20px',
//     backgroundColor: '#3498db',
//     color: 'white',
//     border: 'none',
//     cursor: 'pointer',
//     borderRadius: '4px',
//     fontSize: '16px',
//   },
//   summaryButtonContainer: {
//     display: 'flex',
//     alignItems: 'center',
//   },
//   summaryButton: { 
//     padding: '12px 20px',
//     backgroundColor: '#2ecc71', 
//     color: 'white', 
//     border: 'none', 
//     cursor: 'pointer', 
//     borderRadius: '4px',
//     display: 'flex',
//     alignItems: 'center',
//     fontSize: '16px',
//     marginRight: '10px',
//   },
//   summaryIcon: { marginRight: '10px' },
//   summaryContent: {
//     marginTop: '20px',
//     padding: '20px',
//     backgroundColor: '#f9f9f9',
//     borderRadius: '4px',
//     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//   },
//   dropdown: {
//     position: 'relative',
//     display: 'inline-block',
//   },
//   dropdownContent: {
//     position: 'absolute',
//     backgroundColor: '#f9f9f9',
//     minWidth: '200px',
//     boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
//     padding: '12px',
//     zIndex: 1,
//     borderRadius: '4px',
//     top: '100%',
//     left: 0,
//     marginTop: '5px',
//   },
//   dropdownButton: {
//     backgroundColor: '#3498db',
//     color: 'white',
//     padding: '12px 20px',
//     fontSize: '16px',
//     border: 'none',
//     cursor: 'pointer',
//     borderRadius: '4px',
//   },
// };

// const App: React.FC = () => {
//   const [url, setUrl] = useState<string>('');
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>('');
//   const [openDrawer, setOpenDrawer] = useState<string | null>(null);
//   const [processed, setProcessed] = useState<boolean>(false);
//   const [showDropdown, setShowDropdown] = useState<boolean>(false);
//   const [sectionHeaders, setSectionHeaders] = useState<string[]>([]);
//   const [sectionContent, setSectionContent] = useState<SectionData>({});

//   useEffect(() => {
//     console.log('State updated:', {
//       processed,
//       openDrawer,
//       sectionHeaders: sectionHeaders.length,
//       sectionContent: Object.keys(sectionContent).length
//     });
//   }, [processed, openDrawer, sectionHeaders, sectionContent]);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSectionHeaders([]);
//     setSectionContent({});

//     console.log('Submitting URL:', url);

//     try {
//       const response = await axios.post<ApiResponse>('http://localhost:5001', { url });
//       console.log('Server response:', response.data);

//       if (response.data && response.data.section_headers && response.data.extracted_text) {
//         setSectionHeaders(response.data.section_headers);
//         setSectionContent(response.data.extracted_text);
//         setProcessed(true);
//         console.log('Data processed successfully');
//       } else {
//         console.error('Invalid response structure:', response.data);
//         setError('Invalid response format from the server. Check the console for details.');
//       }
//     } catch (err) {
//       console.error('Error:', err);
//       setError('Error processing paper. Please check the console for details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleDrawer = (drawerName: string) => {
//     console.log('Toggling drawer:', drawerName, 'Current openDrawer:', openDrawer);
//     setOpenDrawer(openDrawer === drawerName ? null : drawerName);
//   };

//   return (
//     <div style={styles.container}>
//       <header style={styles.header}>
//         <div style={styles.headerPane}>Home</div>
//         <div style={styles.headerPane}>About</div>
//         <div style={styles.headerPane}>Contact</div>
//       </header>
//       <main style={styles.mainContent}>
//         <div style={styles.inputSection}>
//           <form onSubmit={handleSubmit} style={styles.inputContainer}>
//             <input
//               type="text"
//               value={url}
//               onChange={(e) => setUrl(e.target.value)}
//               placeholder="Enter ArXiv URL"
//               style={styles.input}
//             />
//             <button type="submit" disabled={loading} style={styles.button}>
//               {loading ? 'Processing...' : 'Process Paper'}
//             </button>
//           </form>
//           <div style={styles.dropdown}>
//             <button 
//               type="button"
//               style={styles.dropdownButton}
//               onClick={() => setShowDropdown(!showDropdown)}
//             >
//               Help
//             </button>
//             {showDropdown && (
//               <div style={styles.dropdownContent}>
//                 Enter an ArXiv URL to process the paper and generate summaries.
//               </div>
//             )}
//           </div>
//           {error && <p style={{ color: 'red' }}>{error}</p>}
//           {processed && (
//             <div style={styles.summaryButtonContainer}>
//               <button 
//                 style={styles.summaryButton}
//                 onClick={() => toggleDrawer('extracted')}
//               >
//                 <FaFileAlt style={styles.summaryIcon} />
//                 View Extracted Text
//               </button>
//               <button 
//                 style={styles.summaryButton}
//                 onClick={() => toggleDrawer('business')}
//               >
//                 <FaBusinessTime style={styles.summaryIcon} />
//                 Business Summary
//               </button>
//               <button 
//                 style={styles.summaryButton}
//                 onClick={() => toggleDrawer('technical')}
//               >
//                 <FaMicrochip style={styles.summaryIcon} />
//                 Technical Summary
//               </button>
//             </div>
//           )}
//         </div>
//         {openDrawer === 'extracted' && (
//           <div style={styles.summaryContent}>
//             <h3>Extracted Text</h3>
//             {sectionHeaders.length > 0 ? (
//               sectionHeaders.map((header, index) => (
//                 <div key={index}>
//                   <h4>{header}</h4>
//                   <p>{sectionContent[header]}</p>
//                 </div>
//               ))
//             ) : (
//               <p>No content available</p>
//             )}
//           </div>
//         )}
//         {openDrawer === 'business' && (
//           <div style={styles.summaryContent}>
//             <h3>Business Summary</h3>
//             <p>Business summary content goes here</p>
//           </div>
//         )}
//         {openDrawer === 'technical' && (
//           <div style={styles.summaryContent}>
//             <h3>Technical Summary</h3>
//             <p>Technical summary content goes here</p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default App;

// import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// import ResearchPaperSummarizer from './components/ResearchPaperSummarizer';
// import './App.css'; // Assume we'll create this file for custom styles

// const App: React.FC = () => {
//   return (
//     <Router>
//       <div className="app">
//         <nav className="nav-bar">
//           <ul className="nav-list">
//             <li className="nav-item">
//               <Link to="/" className="nav-link">Home</Link>
//             </li>
//             <li className="nav-item">
//               <Link to="/summarizer" className="nav-link">Paper Summarizer</Link>
//             </li>
//             {/* Add more navigation items as needed */}
//           </ul>
//         </nav>

//         <main className="main-content">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/summarizer" element={<ResearchPaperSummarizer />} />
//             {/* Add more routes as needed */}
//           </Routes>
//         </main>
//       </div>
//     </Router>
//   );
// };

// const Home: React.FC = () => {
//   return (
//     <div className="home">
//       <h1 className="home-title">Welcome to Research Tools</h1>
//       <p className="home-description">Select a tool from the navigation bar to get started.</p>
//     </div>
//   );
// };

// export default App;