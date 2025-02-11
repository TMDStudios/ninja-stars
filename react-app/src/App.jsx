import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import Home from './components/Home';
import Reviews from './components/Reviews';
import NewHelpRequest from './components/NewHelpRequest';
import NewReview from './components/NewReview';
import { getAccessToken, getLoggedInUser } from './utils/utils';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [token, setToken] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const accessToken = getAccessToken();
        const loggedInUsername = getLoggedInUser();
        if(accessToken && loggedInUsername){
            setIsLoggedIn(true);
            setUsername(loggedInUsername);
            setToken(accessToken);
        }
    }, []);

    const handleLoginSuccess = (loggedInUsername, accessToken) => {
        setIsLoggedIn(true);
        setUsername(loggedInUsername);
        setToken(accessToken);
        localStorage.setItem('loggedInUsername', loggedInUsername);
        setMessage(`Login successful. Hello, ${loggedInUsername}!`);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('loggedInUsername');
        setIsLoggedIn(false);
        setUsername('');
        setToken('');
    };

    const handleRegisterSuccess = async (registeredUsername, accessToken, password) => {
        if(!accessToken){
            const response = await fetch('http://localhost:8000/api/token/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: registeredUsername, password }),
            });

            if(response.ok){
                const data = await response.json();
                accessToken = data.access;
            }
        }

        handleLoginSuccess(registeredUsername, accessToken);
    };

    const toggleRegisterForm = () => {
        setIsRegistering(!isRegistering);
    };

    const updateMessage = newMsg => {
        setMessage(newMsg);
    }

    return (
        <Router>
            <div>
                {isLoggedIn ? (
                    <Routes>
                    <Route path="/" element={<Home username={username} message={message} updateMessage={updateMessage} onLogout={handleLogout} token={token} />} />
                    <Route path="/new-help-request" element={<NewHelpRequest token={token} updateMessage={updateMessage} />} />
                    <Route path="/reviews" element={<Reviews token={token} />} />
                    <Route path="/new-review" element={<NewReview token={token} updateMessage={updateMessage} />} />
                    </Routes>
                    ) : isRegistering ? (
                    <RegistrationForm onRegisterSuccess={handleRegisterSuccess} toggleRegisterForm={toggleRegisterForm} />
                    ) : (
                    <LoginForm onLoginSuccess={handleLoginSuccess} toggleRegisterForm={toggleRegisterForm} />
                )}
            </div>
            <div class="credits">
                <p id="credits">Profanity Filter courtesy of <a href="https://www.purgomalum.com/" target="_blank">PurgoMalum</a></p>
            </div>
        </Router>
    );
};

export default App;