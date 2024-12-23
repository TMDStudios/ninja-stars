const dojoUrl = 'https://login.codingdojo.com/';
const apiUrl = 'http://127.0.0.1:8000/api';
const apiTokenUrl = 'http://127.0.0.1:8000/api/token/';
const apiRefreshTokenUrl = 'http://127.0.0.1:8000/api/token/refresh/';
const registrationUrl = 'http://127.0.0.1:8000/api/register/';
let modalCount = 0;

let isDataLoaded = false;
let isHelpRequestsLoaded = false;
let isReviewsLoaded = false;

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
        return true;
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

document.getElementById('create-help-request').addEventListener('click', (event) => {
    event.preventDefault();

    showModal(null, "new-help-request");
});

document.getElementById('start-review-session').addEventListener('click', (event) => {
    event.preventDefault();

    showModal(null, "new-review");
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

    logIn(username, password);
});

document.getElementById('register').addEventListener('click', (event) => {
    event.preventDefault();

    document.getElementById('login').style.display = "none";
    document.getElementById('registration').style.display = "block";
    document.getElementById('log-in').style.display = "block";
    document.getElementById('register').style.display = "none";
});

document.getElementById('log-in').addEventListener('click', (event) => {
    event.preventDefault();

    document.getElementById('login').style.display = "block";
    document.getElementById('registration').style.display = "none";
    document.getElementById('log-in').style.display = "none";
    document.getElementById('register').style.display = "block";
});

document.getElementById('registration').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username_registration').value;
    const email = document.getElementById('email_registration').value;
    const discord_handle = document.getElementById('discord_handle_registration').value;
    const availability = document.getElementById('availability_registration').value;
    const password = document.getElementById('password_registration').value;
    const confirm_password = document.getElementById('confirm_password_registration').value;

    console.log(password)
    console.log(confirm_password)
    if(password !== confirm_password){
        document.getElementById('message').innerText = 'Registration failed: Passwords do not match.';
        return;
    }

    const response = await fetch(registrationUrl, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, discord_handle, availability, password, confirm_password }),
    });

    const result = await response.json();

    if(response.ok){
        logIn(username, password);
    }else{
        document.getElementById('message').innerText = 'Registration failed: ' + result.detail;
    }
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function logIn(username, password){
    const response = await fetch(apiTokenUrl, {
        method: 'POST',
        headers: {
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
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
        document.getElementById('registration').style.display = "none";
        document.getElementById('content').style.display = "block";
        fetchUserData();
    }else{
        document.getElementById('message').innerText = 'Login failed: ' + result.detail;
    }
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
        loadData();
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

async function loadData(){
    modalCount = 0;
    const token = await getAccessToken();
    if(!token){
        document.getElementById("message").innerHTML = 'Please log in for full access';
        return;
    }
    await loadHelpRequests(token);
    await loadReviews(token);
}

async function loadHelpRequests(token){
    let moduleURL = `${apiUrl}/help-requests/`;

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
            const helpRequestId = 'show-modal' + modalCount;
            const helpRequest = `
                <li><a href="#" id="${helpRequestId}">${request.concept} - ${request.course}</a></li>
            `;
            setTimeout(() => { // setTimeout to make sure the id is available
                document.getElementById(helpRequestId).addEventListener('click', () => {
                    showModal(request, "help-request");
                });
            }, 0);

            modalCount++;
            return helpRequest;
        }).join('');
    }else{
        document.getElementById("message").innerHTML = 'No help requests found or failed to fetch.';
    }
}

async function loadReviews(token, currentModule){
    let moduleURL = `${apiUrl}/reviews/`;

    if(currentModule.length > 0){
        moduleURL = `${apiUrl}/reviews/?module=${currentModule}`;
    }

    const response = await fetch(moduleURL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if(response.ok){
        const data = await response.json();
        const reviewsElement = document.getElementById("reviews");
        reviewsElement.innerHTML = data.reviews.map(request => {
            const reviewId = 'show-modal' + modalCount;
            const review = `
                <li><a href="#" id="${reviewId}">${request.concept} - ${request.course}</a></li>
            `;
            setTimeout(() => { // setTimeout to make sure the id is available
                document.getElementById(reviewId).addEventListener('click', () => {
                    showModal(request, "review");
                });
            }, 0);

            modalCount++;
            return review;
        }).join('');
    }else{
        document.getElementById("message").innerHTML = 'No reviews found or failed to fetch.';
    }
}

async function showModal(data, type = ""){
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
    }else if(type === "new-help-request"){
        modalContent = `
            <h3>Create help request</h3>
            <form method="POST" id="help_request_form" action="/api/help/request/">
                <input type="text" id="help_request_concept" placeholder="Topic" required><br>
                <select name="help_request_course" id="help_request_course">
                    <option value="all courses">All Courses</option>
                    <option value="programming basics">Programming Basics</option>
                    <option value="web fundamentals">Web Fundamentals</option>
                    <option value="python">Python</option>
                    <option value="js">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="c#">C#</option>
                    <option value="projects and algorithms">Projects and Algorithms</option>
                </select><br>
                <input type="text" id="help_request_module_link" placeholder="Module link" required><br>
                <input type="text" id="help_request_note" placeholder="Add notes (optional)" required><br>
                <input type="submit" value="Submit">
            </form>
            <div><button id="modal_button">Dismiss</button></div>
        `;
    }else if(type === "new-review"){
        modalContent = `
            <h3>Start review session</h3>
            <form method="POST" id="new_review_form" action="/api/review/start/">
                <input type="text" id="new_review_concept" placeholder="Review topic" required><br>
                <select name="new_review_course" id="new_review_course">
                    <option value="all courses">All Courses</option>
                    <option value="programming basics">Programming Basics</option>
                    <option value="web fundamentals">Web Fundamentals</option>
                    <option value="python">Python</option>
                    <option value="js">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="c#">C#</option>
                    <option value="projects and algorithms">Projects and Algorithms</option>
                </select><br>
                <input type="text" id="new_review_module_link" placeholder="Module link" required><br>
                <input type="text" id="new_review_note" placeholder="Add notes (optional)" required><br>
                <input type="number" id="new_review_duration" placeholder="Duration (in minutes)" required><br>
                <input type="submit" value="Submit">
            </form>
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

    if(type==="new-help-request"){
        document.getElementById('help_request_form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const token = await getAccessToken();
        
            const concept = document.getElementById('help_request_concept').value;
            const course = document.getElementById('help_request_course').value;
            const module_link = document.getElementById('help_request_module_link').value;
            const note = document.getElementById('help_request_note').value;
        
            const response = await fetch(apiUrl+"/help/request/", {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ concept, course, module_link, note }),
            });
        
            const result = await response.json();
        
            if(response.ok){
                console.log('help request added')
                document.getElementById('message').innerText = 'Help request added';
            }else{
                document.getElementById('message').innerText = 'Help request add failed: ' + result.detail;
            }
        });
    }

    if(type==="new-review"){
        document.getElementById('new_review_form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const token = await getAccessToken();
            const concept = document.getElementById('new_review_concept').value;
            const course = document.getElementById('new_review_course').value;
            const module_link = document.getElementById('new_review_module_link').value;
            const note = document.getElementById('new_review_note').value;
            const duration = document.getElementById('new_review_duration').value;
        
            const response = await fetch(apiUrl+"/review/start/", {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ concept, course, module_link, note, duration }),
            });
        
            const result = await response.json();
        
            if(response.ok){
                console.log('review added')
                document.getElementById('message').innerText = 'Review added';
            }else{
                document.getElementById('message').innerText = 'Review add failed: ' + result.detail;
            }
        });
    }

    if(data!=null){
        const copyButtons = document.querySelectorAll('.copy_button');
        copyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetSelector = button.getAttribute('data-copy-target');
                const textToCopy = document.querySelector(targetSelector).textContent;
                navigator.clipboard.writeText(textToCopy);
            });
        });
    }

    document.getElementById("modal").showModal();
}

async function fetchUserData(){
    if(isDataLoaded) return;
    isDataLoaded = true;

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
        loadData();
    }else{
        document.getElementById("login-message").innerHTML = 'Failed to fetch user data. Please log in.';
    }
}

async function loadHelpRequests(token){
    if(isHelpRequestsLoaded) return;
    isHelpRequestsLoaded = true;

    let moduleURL = `${apiUrl}/help-requests/`;

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
            const helpRequestId = 'show-modal' + modalCount;
            const helpRequest = `
                <li><a href="#" id="${helpRequestId}">${request.concept} - ${request.course}</a></li>
            `;
            setTimeout(() => { // setTimeout to make sure the id is available
                document.getElementById(helpRequestId).addEventListener('click', () => {
                    showModal(request, "help-request");
                });
            }, 0);

            modalCount++;
            return helpRequest;
        }).join('');
    }else{
        document.getElementById("message").innerHTML = 'No help requests found or failed to fetch.';
    }
}

async function loadReviews(token){
    if(isReviewsLoaded) return;
    isReviewsLoaded = true;

    let moduleURL = `${apiUrl}/reviews/`;

    const response = await fetch(moduleURL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if(response.ok){
        const data = await response.json();
        const reviewsElement = document.getElementById("reviews");
        reviewsElement.innerHTML = data.reviews.map(request => {
            const reviewId = 'show-modal' + modalCount;
            const review = `
                <li><a href="#" id="${reviewId}">${request.concept} - ${request.course}</a></li>
            `;
            setTimeout(() => { // setTimeout to make sure the id is available
                document.getElementById(reviewId).addEventListener('click', () => {
                    showModal(request, "review");
                });
            }, 0);

            modalCount++;
            return review;
        }).join('');
    }else{
        document.getElementById("message").innerHTML = 'No reviews found or failed to fetch.';
    }
}