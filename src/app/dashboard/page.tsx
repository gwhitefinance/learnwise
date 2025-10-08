
'use client';

import React, { useEffect, useState } from 'react';

// Define the structure for our popup style for better readability
const popupStyles: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '40px',
  borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  zIndex: 1000,
  textAlign: 'center',
  border: '1px solid #e2e8f0',
};

const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 999,
};

const buttonStyles: React.CSSProperties = {
  marginTop: '20px',
  padding: '10px 20px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
};

/**
 * A functional component for the Dashboard page.
 * It displays a welcome popup to the user immediately after they complete the quiz
 * and land on this page for the first time.
 */
const Dashboard: React.FC = () => {
  // State to control the visibility of the popup.
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // This effect runs once as soon as the component mounts, similar to DOMContentLoaded.

    // Check if the user has just completed the quiz.
    // We assume the previous page (the quiz) has set 'quizCompleted' to 'true'.
    const hasCompletedQuiz = localStorage.getItem('quizCompleted') === 'true';

    // Check if the user has already seen this welcome popup.
    const hasSeenPopup = localStorage.getItem('hasSeenWelcomePopup') === 'true';

    // Show the popup only if the quiz was completed AND the user hasn't seen the popup before.
    if (hasCompletedQuiz && !hasSeenPopup) {
      setShowPopup(true);
    }
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  const handleStartTour = () => {
    // Hide the popup.
    setShowPopup(false);

    // Mark the popup as seen in localStorage so it doesn't show again.
    localStorage.setItem('hasSeenWelcomePopup', 'true');
    
    // Also, we can now remove the quiz completion flag as it has served its purpose.
    localStorage.removeItem('quizCompleted');

    // Placeholder for starting the actual tour logic.
    console.log('Tour started!');
    alert('The tour would start now!');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Dashboard Content</h1>
      <p>This is the main content of your application's dashboard.</p>
      <p>Other components and features would go here.</p>

      {/* Conditionally render the popup and overlay */}
      {showPopup && (
        <>
          <div style={overlayStyles} onClick={handleStartTour} />
          <div style={popupStyles} className="popup">
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Welcome to your Dashboard!</h2>
            <p style={{ marginTop: '10px', color: '#4a5568' }}>
              You're all set up. Let's take a quick tour to see how everything works.
            </p>
            <button style={buttonStyles} onClick={handleStartTour}>
              Start Tour
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
