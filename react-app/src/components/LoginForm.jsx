import React, { useState } from 'react';
import { setAccessToken, setLoggedInUser } from '../utils/utils';

const LoginForm = ({ onLoginSuccess, toggleRegisterForm }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const response = await fetch('http://localhost:8000/api/token/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if(response.ok){
                const data = await response.json();
                setAccessToken(data.access);
                setLoggedInUser(username);
                onLoginSuccess(username, data.access);
            }else{
                const errorData = await response.json();
                setErrorMessage(errorData.detail || 'Login failed. Please try again.');
            }
        }catch(error){
            console.error('Error during login:', error);
            setErrorMessage('Login failed due to an unexpected error.');
        }
    };

    return(
        <div>
            <h2>Log in for full access</h2>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Log In</button>
            </form>
            <p>Don't have an account?</p>
            <a href="#" onClick={toggleRegisterForm}>Register</a>
        </div>
    );
};

export default LoginForm;