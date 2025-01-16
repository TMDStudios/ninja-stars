const BASE_URL = 'http://localhost:8000/api';

// Utility function to handle the fetch GET requests
export const fetchData = async (endpoint, token, params = {}) => {
    try{
        const url = new URL(`${BASE_URL}/${endpoint}/`);
        if(params){
            Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
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