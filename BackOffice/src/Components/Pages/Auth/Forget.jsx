import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartbeat, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (email.trim() !== '') {
      navigate('/confirm'); // Change to the correct path if necessary
    } else {
      alert('Please enter your email address to continue.'); // Optional: Show a better error message or UI feedback
    }
  };

  return (
    <>
      <section className="relative w-full h-screen bg-no-repeat bg-cover bg-start" style={{ backgroundImage: "url('src/assets/images/sign2.jpg')" }}>
        <div className="absolute inset-0 bg-black opacity-70"></div> {/* Dark overlay */}
        <div className="flex justify-center items-center px-6 py-8 mx-auto h-full">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4 md:space-y-6 sm:p-8 z-10 relative" style={{ maxWidth: "500px", width: "100%" }}>
            <div className="logo flex justify-center items-center">
              <FontAwesomeIcon icon={faHeartbeat} className="text-3xl mr-2" style={{ color: 'navy' }} />
              <span className="font-bold text-2xl" style={{ color: '#395886' }}>Consulta</span>
              <span className="font-bold text-2xl text-cons-light" style={{ color: '#5e8cc9' }}>Med</span>
            </div>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Please Reset Your Password
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                <div className="flex items-center border-2 border-gray-300 rounded-md">
                  <FontAwesomeIcon icon={faEnvelope} className="text-md mx-3 text-gray-600" />
                  <input type="email" name="email" id="email" onChange={handleEmailChange} className="bg-gray-50 text-gray-900 sm:text-sm rounded-r-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required />
                </div>
              </div>
              <button type="submit" className="w-full mt-4 text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600">Submit</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default SignIn;
