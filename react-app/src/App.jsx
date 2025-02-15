import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import Home from './components/Home';
import Reviews from './components/Reviews';
import NewHelpRequest from './components/NewHelpRequest';
import NewReview from './components/NewReview';
import { getValidAccessToken, postData } from './utils/api';
import { getLoggedInUser, setAccessToken, setRefreshToken, removeTokens } from './utils/utils';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [token, setToken] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const checkToken = async () => {
            const accessToken = await getValidAccessToken();
            const loggedInUsername = getLoggedInUser();

            if(accessToken && loggedInUsername){
                setIsLoggedIn(true);
                setUsername(loggedInUsername);
                setToken(accessToken);
            }
        };

        checkToken();
    }, []);

    const handleLoginSuccess = async (loggedInUsername, accessToken, refreshToken) => {
        setIsLoggedIn(true);
        setUsername(loggedInUsername);
        setToken(accessToken);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setMessage(`Login successful. Hello, ${loggedInUsername}!`);
    };

    const handleLogout = () => {
        removeTokens();
        setIsLoggedIn(false);
        setUsername('');
        setToken('');
    };

    const handleRegisterSuccess = async (registeredUsername, _, password) => {
        try{
            const data = await postData('token', null, { username: registeredUsername, password });
            handleLoginSuccess(registeredUsername, data.access, data.refresh);
        }catch (error){
            setMessage('Registration successful, but login failed. Try logging in manually.');
        }
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
            <div className="credits">
                <p id="credits">Profanity Filter courtesy of <a href="https://www.purgomalum.com/" target="_blank">PurgoMalum</a></p>
            </div>
        </Router>
    );
};

export default App;