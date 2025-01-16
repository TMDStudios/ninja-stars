import React, { useState } from 'react';
import { profanityDetected } from '../utils/api';

const RegistrationForm = ({ onRegisterSuccess, toggleRegisterForm }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [discordHandle, setDiscordHandle] = useState('');
    const [availability, setAvailability] = useState('mornings');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(password !== confirmPassword){
            setErrorMessage('Passwords do not match');
            return;
        }

        try{
            let containsProfanity = false;
            if(await profanityDetected(username) || await profanityDetected(email) || await profanityDetected(discordHandle)) containsProfanity = true;
            if(containsProfanity){
                setErrorMessage('Registration failed: Please refrain from using profanity.');
                return;
            }

            const response = await fetch('http://localhost:8000/api/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email,
                    discord_handle: discordHandle,
                    availability,
                    password,
                    confirm_password: confirmPassword,
                }),
            });

            const result = await response.json();

            if(response.ok){
                onRegisterSuccess(username, result.access_token || null, password);
            }else{
                setErrorMessage(result.errors || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setErrorMessage(error.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div>
            <h2>Create a new account</h2>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="text" placeholder="Discord Handle" value={discordHandle} onChange={(e) => setDiscordHandle(e.target.value)} required />
                <select value={availability} onChange={(e) => setAvailability(e.target.value)} required>
                    <option value="mornings">Mornings</option>
                    <option value="afternoons">Afternoons</option>
                    <option value="evenings">Evenings</option>
                    <option value="nights">Nights</option>
                </select>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button type="submit">Register</button>
            </form>
            <p>Already have an account?</p>
            <a href="#" onClick={toggleRegisterForm}>Log In</a>
        </div>
    );
};

export default RegistrationForm;