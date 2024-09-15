import React, { useState } from 'react';
import '../../../assets/style/login.css';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faLock, faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { message } from 'antd';
import { jwtDecode } from 'jwt-decode';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [redirect, setRedirect] = useState(false);
  

  const handleUsernameChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // mouchkil hna yaak ??
      const response = await axios.post('https://go-ko.onrender.com/admin/login', { email, password });
      const token = response.data.token; // Assurez-vous que c'est bien la clé que vous utilisez
      localStorage.setItem('token', token);
      const decodedToken = jwtDecode(token);
      setRedirect(true);
      // console.log('Login successful. Token:', token);
      message.success(`Bienvenue dans le tableau de bord ${decodedToken.role}`);
      setRedirect(true);
    } catch (error) {
      message.error('Email ou mot de passe invalide');
      console.error('Erreur lors de la connexion:', error);
    }
  };

  if (redirect) {
    return <Navigate to={"/"} />;
}
  
  return (
    <>
      <section className="relative w-full h-screen bg-no-repeat bg-cover bg-center" style={{ backgroundImage: "url('src/assets/images/sign.avif')" }}>
        <div className="absolute inset-0 bg-black opacity-70"></div> {/* Superposition sombre */}
        <div className="flex justify-center items-center px-6 py-8 mx-auto h-full">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4 md:space-y-6 sm:p-8 z-10 relative" style={{ maxWidth: "500px", width: "100%" }}>
            <div className="logo flex justify-center items-center">
              {/* <FontAwesomeIcon icon={faPersonSnowboarding} className="text-3xl mr-2" style={{ color: 'navy' }}  /> */}
              <span className="font-bold text-2xl" style={{ color: 'navy' }}>GO</span>
              <span className="font-bold text-2xl text-cons-light" style={{ color: 'navy' }}>KO</span>
            </div>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Connectez-vous à votre compte
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Votre email</label>
                <div className="flex items-center border-2 border-gray-300 rounded-md">
                  <FontAwesomeIcon icon={faEnvelope} className="text-md mx-3 text-gray-600" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    onChange={handleUsernameChange}
                    className="bg-gray-50 text-gray-900 sm:text-sm rounded-r-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="nom@entreprise.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mot de passe</label>
                <div className="flex items-center border-2 border-gray-300 rounded-md">
                  <FontAwesomeIcon icon={faLock} className="text-md mx-3 text-gray-600" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    onChange={handlePasswordChange}
                    className="bg-gray-50 text-gray-900 sm:text-sm rounded-r-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="••••••••"
                    required
                  />
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="text-md mx-3 text-gray-600 cursor-pointer"
                    onClick={toggleShowPassword}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">Se souvenir de moi</label>
                  </div>
                </div>
                <Link to="/ForgotPassword">
                  {/* <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Mot de passe oublié?</a> */}
                </Link>
              </div>
              <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600">Se connecter</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default SignIn;
