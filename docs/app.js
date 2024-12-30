const config = {
    dojoUrl: 'https://login.codingdojo.com/',
    apiUrl: 'http://127.0.0.1:8000/api',
    apiTokenUrl: 'http://127.0.0.1:8000/api/token/',
    apiRefreshTokenUrl: 'http://127.0.0.1:8000/api/token/refresh/',
    registrationUrl: 'http://127.0.0.1:8000/api/register/',
    loggedInUser: ''
};

let modalCount = 0;

let loadingState = {
    data: false,
    helpRequests: false,
    reviews: false
};

const pageElements = {
    'login-message': document.getElementById('login-message'),
    'message': document.getElementById('message'),
    'login-link': document.getElementById('login-link'),
    'login': document.getElementById('login'),
    'login-form': document.getElementById('login-form'),
    'registration-link': document.getElementById('registration-link'),
    'registration': document.getElementById('registration'),
    'registration-form': document.getElementById('registration-form'),
    'logout-link': document.getElementById('logout-link'),
    'content': document.getElementById('content'),
    'filter-help-requests': document.getElementById('filter-help-requests'),
    'show-all': document.getElementById('show-all'),
    'filter-forms': document.getElementById('filter-forms'),
    'course-filter-form': document.getElementById('course-filter-form'),
    'search-filter-form': document.getElementById('search-filter-form'),
    'selected-course': document.getElementById('selected-course'),
    'search-value': document.getElementById('search-value'),
    'create-help-request': document.getElementById('create-help-request'),
    'help-requests': document.getElementById('help-requests'),
    'start-review-session': document.getElementById('start-review-session'),
    'reviews': document.getElementById('reviews'),
    'modal': document.getElementById('modal'),
    'modal-content': document.getElementById('modal-content'),
}

function setUpPage(){
    document.addEventListener("DOMContentLoaded", async () => {
        pageElements['filter-help-requests'].addEventListener('click', (event) => {
            event.preventDefault();
            handleElements(['course-filter-form', 'search-filter-form', 'show-all'], true, "flex");
            handleElements(['filter-help-requests'], false);
        });

        pageElements['show-all'].addEventListener('click', async (event) => {
            event.preventDefault();
            showAll();
        });

        pageElements['course-filter-form'].addEventListener('submit', async (event) => {
            event.preventDefault();
            handleElements(['course-filter-form', 'search-filter-form'], false, "flex");
            updatePage(await getAccessToken(), `?course=${pageElements['selected-course'].value}`);
            pageElements['show-all'].innerHTML = `Show all - Current filter: course (${pageElements['selected-course'].value})`;
        });

        pageElements['search-filter-form'].addEventListener('submit', async (event) => {
            event.preventDefault();
            handleElements(['course-filter-form', 'search-filter-form'], false, "flex");
            updatePage(await getAccessToken(), `?search=${pageElements['search-value'].value}`);
            pageElements['show-all'].innerHTML = `Show all - Current filter: search (${pageElements['search-value'].value})`;
        });

        pageElements['create-help-request'].addEventListener('click', (event) => {
            event.preventDefault();
            showModal(null, "new-help-request");
        });
        
        pageElements['start-review-session'].addEventListener('click', (event) => {
            event.preventDefault();
            showModal(null, "new-review");
        });
        
        pageElements['logout-link'].addEventListener('click', (event) => {
            event.preventDefault();
        
            showAll();
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            config['loggedInUser'] = '';
        
            handleElements(['login'], true);
            handleElements(['content', 'logout-link'], false);
        
            pageElements['message'].innerText = 'You have been logged out.';
            pageElements["login-message"].innerHTML = '';
        });
        
        pageElements['login-form'].addEventListener('submit', async (event) => {
            event.preventDefault();
        
            const username = document.getElementById('username_login').value;
            const password = document.getElementById('password_login').value;
        
            logIn(username, password);
        });

        document.querySelectorAll('#registration-link, #login-link').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                if(event.target.id==='registration-link'){
                    handleElements(['login', 'registration-link'], false);
                    handleElements(['registration', 'login-link'], true);
                }else{
                    handleElements(['login', 'registration-link'], true);
                    handleElements(['registration', 'login-link'], false);
                }
            });
        });
        
        pageElements['registration'].addEventListener('submit', async (event) => {
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
                pageElements['message'].innerText = 'Registration failed: Passwords do not match.';
                return;
            }
        
            const response = await fetch(config.registrationUrl, {
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
                pageElements['message'].innerText = 'Registration failed: ' + result.detail;
            }
        });

        if(await getAccessToken()){
            handleElements(['content', 'logout-link'], true);
            handleElements(['login'], false);
            fetchUserData();
        }else{
            handleElements(['content', 'logout-link'], false);
            handleElements(['login'], true);
        }
    });
}

async function showAll(){
    updatePage(await getAccessToken());
    handleElements(['course-filter-form', 'search-filter-form', 'show-all'], false, "flex");
    handleElements(['filter-help-requests'], true);
    pageElements['course-filter-form'].reset();
    pageElements['search-filter-form'].reset();
    pageElements['show-all'].innerHTML = `Show all`;
}

function handleElements(elements, show, display="block"){
    elements.forEach(e => {
        show ? pageElements[e].style.display = display : pageElements[e].style.display = "none";
    });
}

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
    const response = await fetch(config.apiRefreshTokenUrl, {
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
        handleElements(['login'], true);
        handleElements(['content', 'logout-link'], false);
        pageElements['message'].innerText = 'Session expired. Please log in again.';
        return null;
    }
}

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
    const response = await fetch(config.apiTokenUrl, {
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
        pageElements['message'].innerText = 'Login successful!';
        handleElements(['login', 'registration'], false);
        handleElements(['content', 'logout-link'], true);
        fetchUserData();
    }else{
        pageElements['message'].innerText = 'Login failed: ' + result.detail;
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

async function loadData(type, token, filter){
    let moduleURL = `${config.apiUrl}/${type}/${filter}`;

    const response = await fetch(moduleURL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if(response.ok){
        const data = await response.json();
        pageElements[type].innerHTML = data[type].map(item => {
            const itemId = 'show-modal' + modalCount;
            const itemHtml = `
                <li><a href="#" id="${itemId}">${item.concept}</a></li>
            `;
            setTimeout(() => { // setTimeout to make sure the id is available
                document.getElementById(itemId).addEventListener('click', () => {
                    showModal(item, type);
                });
            }, 0);

            modalCount++;
            return itemHtml;
        }).join('');
    }else{
        pageElements["message"].innerHTML = 'Failed to fetch data.';
    }
}

async function showModal(data, type = ""){
    pageElements["modal-content"].innerHTML = createModalContent(data, type);

    document.getElementById("modal_button").addEventListener('click', () => {
        pageElements["modal"].close();
    });

    if(type==="new-help-request"){
        document.getElementById('help_request_form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const token = await getAccessToken();
        
            const concept = document.getElementById('help_request_concept').value;
            const course = document.getElementById('help_request_course').value;
            const module_link = processModuleUrl(document.getElementById('help_request_module_link').value);
            const note = document.getElementById('help_request_note').value;
        
            const response = await fetch(config.apiUrl+"/help/request/", {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ concept, course, module_link, note }),
            });
        
            const result = await response.json();
        
            if(response.ok){
                updatePage(token);
                pageElements['message'].innerText = 'Help request added';
            }else{
                pageElements['message'].innerText = 'Failed to add help request: ' + result.detail;
            }
            pageElements["modal"].close();
        });
    }

    if(type==="new-review"){
        document.getElementById('new_review_form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const token = await getAccessToken();
            const concept = document.getElementById('new_review_concept').value;
            const course = document.getElementById('new_review_course').value;
            const module_link = processModuleUrl(document.getElementById('new_review_module_link').value);
            const note = document.getElementById('new_review_note').value;
            const duration = document.getElementById('new_review_duration').value;
        
            const response = await fetch(config.apiUrl+"/review/start/", {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ concept, course, module_link, note, duration }),
            });
        
            const result = await response.json();
        
            if(response.ok){
                updatePage(token);
                pageElements['message'].innerText = 'Review added';
            }else{
                pageElements['message'].innerText = 'Failed to add review: ' + result.detail;
            }
            pageElements["modal"].close();
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

    pageElements["modal"].showModal();
}

function processModuleUrl(fullUrl){
    try{
        return fullUrl.split(config['dojoUrl'])[1];
    }catch{
        return 'Invalid URL';
    }
}

async function deactivateHelpRequest(id){
    const token = await getAccessToken();
    const response = await fetch(config['apiUrl']+`/help-requests/${id}/delete`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    const result = await response.json();

    if(response.ok){
        updatePage(token);
        pageElements['message'].innerText = 'Help request removed';
    }else{
        pageElements['message'].innerText = 'Failed to remove help request: ' + result.detail;
    }
    pageElements["modal"].close();
}

function createModalContent(data, type){
    let modalContent = '';
    switch(type) {
        case 'help-requests':
            modalContent = createHelpRequestModal(data);
            setTimeout(() => { // setTimeout to make sure the id is available
                if(document.getElementById('delete_button')!=null){
                    document.getElementById('delete_button').addEventListener('click', function() {
                        deactivateHelpRequest(data.id);
                    });
                }
            }, 0);
            break;
        case 'reviews':
            modalContent = createReviewModal(data);
            break;
        case 'new-help-request':
            modalContent = createNewHelpRequestModal();
            break;
        case 'new-review':
            modalContent = createNewReviewModal();
            break;
        default:
            modalContent = `<p>${data}</p>`;
    }
    return modalContent;
}

function createHelpRequestModal(data) {
    const note = data.note.length > 0 ? data.note : 'No note provided';
    const buttons = data.user.username===config['loggedInUser'] ? `<button id="modal_button">Dismiss</button><button id="delete_button">Delete</button>` : `<button id="modal_button">Dismiss</button>`;
    return `
        <h3>${data.concept}</h3>
        <p>Added by: ${data.user.username}</p>
        <p>Email: <span class="user_data">${data.user.email}</span> <button class="copy_button" data-copy-target=".user_data">Copy</button></p>
        <p>Discord: <span class="user_data">${data.user.discord_handle}</span> <button class="copy_button" data-copy-target=".user_data">Copy</button></p>
        <p>Time Added: ${formatDate(data.created_at)}</p>
        <hr>
        <p>Course: ${data.course}</p>
        <p>Module Link: https://login.codingdojo.com/${data.module_link}</p>
        <p>Note: ${note}</p>
        <div>${buttons}</div>
    `;
}

function createReviewModal(data){
    const note = data.note.length > 0 ? data.note : 'No note provided';
    const createdAt = new Date(data.created_at);
    const durationInMs = data.duration * 60 * 1000;
    const expiresAt = new Date(createdAt.getTime() + durationInMs);
    const activeUntil = formatDate(expiresAt);
    return `
        <h3>${data.concept}</h3>
        <p>Added by: ${data.user.username}</p>
        <p>Email: <span class="user_data">${data.user.email}</span> <button class="copy_button" data-copy-target=".user_data">Copy</button></p>
        <p>Discord: <span class="user_data">${data.user.discord_handle}</span> <button class="copy_button" data-copy-target=".user_data">Copy</button></p>
        <hr>
        <p>Course: ${data.course}</p>
        <p>Module Link: https://login.codingdojo.com/${data.module_link}</p>
        <p>Note: ${note}</p>
        <p>Active until ${activeUntil}</p>
        <div><button id="modal_button">Dismiss</button></div>
    `
}

function createNewHelpRequestModal(){
    return `
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
            <input type="text" id="help_request_module_link" placeholder="https://login.codingdojo.com/m/612/13872/98853" required><br>
            <input type="text" id="help_request_note" placeholder="Add notes (optional)"><br>
            <input type="submit" value="Submit">
        </form>
        <div><button id="modal_button">Dismiss</button></div>
    `
}

function createNewReviewModal(){
    return `
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
            <input type="text" id="new_review_module_link" placeholder="https://login.codingdojo.com/m/612/13872/98853" required><br>
            <input type="text" id="new_review_note" placeholder="Add notes (optional)"><br>
            <input type="number" id="new_review_duration" placeholder="Duration (in minutes)" required><br>
            <input type="submit" value="Submit">
        </form>
        <div><button id="modal_button">Dismiss</button></div>
    `
}

async function fetchUserData(){
    if(loadingState.data) return;
    loadingState.data = true;

    const token = await getAccessToken();
    if(!token){
        pageElements["message"].innerHTML = 'Please log in to access this feature';
        return;
    }

    const response = await fetch(`${config.apiUrl}/user/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if(response.ok){
        const userData = await response.json();
        pageElements["login-message"].innerHTML = `Welcome, ${userData.user_data.username}`;
        config['loggedInUser'] = userData.user_data.username;
        updatePage(token);
    }else{
        pageElements["login-message"].innerHTML = 'Failed to fetch user data. Please log in.';
    }
}

async function updatePage(token, filter=''){
    modalCount = 0;
    await loadData('help-requests', token, filter);
    await loadData('reviews', token, filter);
}

setUpPage();