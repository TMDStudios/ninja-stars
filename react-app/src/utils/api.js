const BASE_URL = 'http://localhost:8000/api';
import { getAccessToken, setAccessToken, getRefreshToken, removeTokens } from './utils';

// Function to refresh access token
export const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();

    if(!refreshToken){
        console.error("No refresh token found, user needs to log in again.");
        removeTokens();
        return null;
    }

    try{
        const response = await fetch(`${BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if(response.ok){
            const data = await response.json();
            setAccessToken(data.access);
            return data.access;
        }else{
            console.error("Refresh token expired or invalid.");
            removeTokens();
            return null;
        }
    }catch(error){
        console.error("Error refreshing token:", error);
        return null;
    }
};

// Function to get a valid access token (refresh if needed)
export const getValidAccessToken = async () => {
    let token = getAccessToken();
    if (!token) return null;

    const tokenParts = JSON.parse(atob(token.split('.')[1])); // Decode token
    const exp = tokenParts.exp * 1000; // Convert to milliseconds
    if(Date.now() >= exp){
        token = await refreshAccessToken();
    }
    return token;
};

export const fetchData = async (endpoint, token, params = {}, filter = '') => {
    try{
        let url = new URL(`${BASE_URL}/${endpoint}/`);
        if(filter) url.search = new URLSearchParams(filter).toString();
        if(params) Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

        const validToken = await getValidAccessToken();
        if(!validToken) throw new Error("User needs to log in again.");

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${validToken}`,
                'Content-Type': 'application/json',
            },
        });

        if(!response.ok){
            throw new Error(`Failed to fetch data from ${url}`);
        }

        return await response.json();
    }catch(error){
        console.error('Error fetching data:', error);
        throw error;
    }
};

// Utility function to handle the fetch POST requests
export const postData = async (endpoint, token, data) => {
    try{
        const url = `${BASE_URL}/${endpoint}/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if(!response.ok){
            throw new Error(`Failed to post data to ${url}`);
        }

        return await response.json();
    }catch(error){
        console.error('Error posting data:', error);
        throw error;
    }
};

export const profanityDetected = async (text) => {
    const response = await fetch(`https://www.purgomalum.com/service/containsprofanity?text=${text}`);
    if(response.ok){
        const responseData = await response.json();
        if(responseData) return true;
    }
    return false;
};