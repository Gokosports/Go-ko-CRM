import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";


const EmailConfirmation = () => {
  const [count, setCount] = useState(3);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowContent(true);
    }
  }, [count]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900"
         style={{ backgroundImage: "url('src/assets/images/sign2.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      {!showContent ? (
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon icon={faCircleNotch} className="fa-spin text-6xl text-white" />
          <p className="text-white text-xl mt-3">Redirecting in {count} seconds...</p>
        </div>
      ) : (
        <div className="p-8 max-w-lg w-full bg-white rounded-lg shadow-xl z-10">
          <div className="flex flex-col items-center justify-center">
            <FontAwesomeIcon icon={faEnvelope} className="text-green-500 text-6xl" />
            <h1 className="text-xl font-bold text-gray-900 mt-4">Check Your Email</h1>
            <p className="text-gray-700 mt-2 text-center">
              Please check your email address <span className="text-gray-900 font-bold"></span> for instructions to reset your password.
            </p>
            <Link to="/login">
            <button className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Resend email
            </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailConfirmation;
