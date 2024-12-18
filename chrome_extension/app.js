const dojoUrl = 'https://login.codingdojo.com/';
const apiUrl = 'http://127.0.0.1:8000/api';
const apiTokenUrl = 'http://127.0.0.1:8000/api/token/';

document.addEventListener("DOMContentLoaded", () => {
    if(localStorage.getItem('token')){
        document.getElementById('login').style.display = "none";
        document.getElementById('content').style.display = "block";
        fetchUserData();
    }else{
        document.getElementById('login').style.display = "block";
        document.getElementById('content').style.display = "none";
    }
});

document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch(apiTokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if(response.ok){
        localStorage.setItem('token', result.access);
        document.getElementById('message').innerText = 'Login successful!';
        document.getElementById('login').style.display = "none";
        document.getElementById('content').style.display = "block";
        fetchUserData();
    }else{
        document.getElementById('message').innerText = 'Login failed: ' + result.detail;
    }
});

function getCurrentUrl(){
    return new Promise(resolve => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0].url);
        });
    });
}

async function fetchUserData(){
    const token = localStorage.getItem('token');
    if(!token){
        document.getElementById("message").innerHTML = 'Please log in to access this feature';
        return;
    }

    const response = await fetch(`${apiUrl}/user/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if(response.ok){
        const userData = await response.json();
        document.getElementById("login-message").innerHTML = `Welcome, ${userData.user_data.username}`;
        const currentUrl = await getCurrentUrl();
        loadHelpRequests(currentUrl);
    }else{
        document.getElementById("login-message").innerHTML = 'Failed to fetch user data. Please log in.';
    }
}

async function loadHelpRequests(currentUrl){
    const token = localStorage.getItem('token');
    if(!token){
        document.getElementById("message").innerHTML = 'Please log in to access help requests';
        return;
    }

    const currentModule = currentUrl.split(dojoUrl)[1];
    let moduleURL = `${apiUrl}/help-requests/`;

    if(currentModule.length > 0){
        moduleURL = `${apiUrl}/help-requests/?module=${currentModule}`;
    }

    const response = await fetch(moduleURL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if(response.ok){
        const data = await response.json();
        const helpRequestsElement = document.getElementById("help-requests");
        helpRequestsElement.innerHTML = data.help_requests.map(request => {
            return `<li>${request.concept} - ${request.course}</li>`;
        }).join('');
    } else {
        document.getElementById("message").innerHTML = 'No help requests found or failed to fetch.';
    }
}

async function fetchData(currentUrl){
    if(!currentUrl || !currentUrl.includes(dojoUrl)){
        console.error("This does not look like a coding dojo page");
        document.getElementById("message").innerHTML = 'Please navigate to a Coding Dojo page';
        return;
    }

    await fetchUserData(currentUrl);
}

async function handleUrl(){
    const currentUrl = await getCurrentUrl();
    fetchData(currentUrl);
}

handleUrl();