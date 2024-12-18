const dojoUrl = 'https://login.codingdojo.com/';
const apiUrl = 'http://127.0.0.1:8000/api';
const apiTokenUrl = 'http://127.0.0.1:8000/api/token/';
const apiRefreshTokenUrl = 'http://127.0.0.1:8000/api/token/refresh/';

async function getAccessToken(){
    let accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if(accessToken && isTokenExpired(accessToken)){
        accessToken = await refreshAccessToken(refreshToken);
    }

    return accessToken;
}

function isTokenExpired(token){
    try{
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = decodedToken.exp * 1000;
        return Date.now() > expiryTime;
    }catch(e){
        console.error("Error decoding token:", e);
        return true; // If there's an error decoding, assume the token is expired or invalid
    }
}

async function refreshAccessToken(refreshToken){
    const response = await fetch(apiRefreshTokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    if(response.ok){
        const result = await response.json();
        localStorage.setItem('access_token', result.access);
        return result.access;
    }else{
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        document.getElementById('message').innerText = 'Session expired. Please log in again.';
        document.getElementById('login').style.display = "block";
        document.getElementById('content').style.display = "none";
        document.getElementById('logout-link').style.display = "none";
        return null;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    if(await getAccessToken()){
        document.getElementById('login').style.display = "none";
        document.getElementById('content').style.display = "block";
        document.getElementById('logout-link').style.display = "block";
        fetchUserData();
    }else{
        document.getElementById('login').style.display = "block";
        document.getElementById('content').style.display = "none";
        document.getElementById('logout-link').style.display = "none";
    }
});

document.getElementById('logout-link').addEventListener('click', (event) => {
    event.preventDefault();

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    document.getElementById('login').style.display = "block";
    document.getElementById('content').style.display = "none";
    document.getElementById('logout-link').style.display = "none";

    document.getElementById('message').innerText = 'You have been logged out.';
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
        localStorage.setItem('access_token', result.access);
        localStorage.setItem('refresh_token', result.refresh);
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
    const token = await getAccessToken();
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

function formatDate(dateString){
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} - ${hour}:${minute}`;
}

async function loadHelpRequests(currentUrl){
    const token = await getAccessToken();
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
        let helpRequestCount = 0;
        helpRequestsElement.innerHTML = data.help_requests.map(request => {
            const helpRequestId = 'show-modal' + helpRequestCount;
            const helpRequest = `
                <li><a href="#" id="${helpRequestId}">${request.concept} - ${request.course}</a></li>
            `;
            setTimeout(() => { // setTimeout to make sure the id is available
                document.getElementById(helpRequestId).addEventListener('click', () => {
                    showModal(request, "help-request");
                });
            }, 0);

            helpRequestCount++;
            return helpRequest;
        }).join('');
    }else{
        document.getElementById("message").innerHTML = 'No help requests found or failed to fetch.';
    }
}

function showModal(data, type = ""){
    let modalContent = '';

    if(type === "help-request"){
        modalContent = `
            <h3>${data.concept}</h3>
            <p>Added by: ${data.user.username}</p>
            <p>Email: <span class="user_data">${data.user.email}</span> <button class="copy_button" data-copy-target=".user_data">Copy</button></p>
            <p>Discord: <span class="user_data">${data.user.discord_handle}</span> <button class="copy_button" data-copy-target=".user_data">Copy</button></p>
            <p>${formatDate(data.created_at)}</p>
            <hr>
            <p>Course: ${data.course}</p>
            <p>Module Link: https://login.codingdojo.com/${data.module_link}</p>
            <p>Note: ${data.note}</p>
            <div><button id="modal_button">Dismiss</button></div>
        `;
    }else if(type === "review"){
        modalContent = `
            <h3>${data.concept}</h3>
            <p>Added by: ${data.user.username}</p>
            <p>Email: <span class="user_data">${data.user.email}</span> <button class="copy_button" data-copy-target=".user_data">Copy</button></p>
            <p>Discord: <span class="user_data">${data.user.discord_handle}</span> <button class="copy_button" data-copy-target=".user_data">Copy</button></p>
            <p>${data.created_at}</p>
            <hr>
            <p>Course: ${data.course}</p>
            <p>Module Link: https://login.codingdojo.com/${data.module_link}</p>
            <p>Note: ${data.note}</p>
            <p>Active until: ${data.duration}</p>
            <div><button id="modal_button">Dismiss</button></div>
        `;
    }else{
        modalContent = `
            <p>${data}</p>
            <div><button id="modal_button">Dismiss</button></div>
        `;
    }

    document.getElementById("modal_content").innerHTML = modalContent;

    document.getElementById("modal_button").addEventListener('click', () => {
        document.getElementById("modal").close();
    });

    const copyButtons = document.querySelectorAll('.copy_button');
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSelector = button.getAttribute('data-copy-target');
            const textToCopy = document.querySelector(targetSelector).textContent;
            navigator.clipboard.writeText(textToCopy);
        });
    });

    document.getElementById("modal").showModal();
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