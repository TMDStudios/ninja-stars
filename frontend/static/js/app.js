function handleHomePage(){
    const help_request_form = document.getElementById('help_request_form');
    const review_form = document.getElementById('review_form');

    help_request_form.addEventListener('submit', function(event){
        event.preventDefault();
        const formData = new FormData(help_request_form);
        fetch(help_request_form.action,{
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            }
        })
        .then(response => {
            if(response.ok){
                help_request_form.reset();
                document.getElementById('help_request_form_container').style.display = "none";
                document.getElementById('help_request_btn').style.display = "block";
                return response.json();
            }else{
                throw new Error('Unable to send request. Please check the form.');
            }
        })
        .then(data => {
            showModal("Help Request Submitted");
            fetchHelpRequests();
        })
        .catch(error => {
            showModal('Error: ' + error.message);
        });
    });

    review_form.addEventListener('submit', function(event){
        event.preventDefault();
        const formData = new FormData(review_form);
        fetch(review_form.action,{
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            }
        })
        .then(response => {
            if(response.ok){
                review_form.reset();
                document.getElementById('review_form_container').style.display = "none";
                document.getElementById('review_btn').style.display = "block";
                return response.json();
            }else{
                throw new Error('Unable to send request. Please check the form.');
            }
        })
        .then(data => {
            showModal("Review Session Added");
            fetchReviews();
        })
        .catch(error => {
            showModal('Error: ' + error.message);
        });
    });

    fetchHelpRequests();
    fetchReviews();
}

function fetchHelpRequests(){
    fetch('/api/fetch-help-requests/')
        .then(response => response.json())
        .then(data => {
            const helpLinksDiv = document.getElementById('help-requests');
            helpLinksDiv.innerHTML = '';

            data.help_requests.forEach(file => {
                const p = document.createElement('p');
                p.className = 'help-request';
                p.dataset.help_request = file.concept;
                p.textContent = file.concept;
                p.onclick = function() {
                    showModal(file, type="help-request");
                };
                helpLinksDiv.appendChild(p);
            });
        })
        .catch(error => {
            console.error('Error fetching help files:', error);
        });
}

function fetchReviews(){
    fetch('/api/fetch-reviews/')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            const reviewLinksDiv = document.getElementById('reviews');
            reviewLinksDiv.innerHTML = '';

            data.reviews.forEach(file => {
                const p = document.createElement('p');
                p.className = 'review-request';
                p.dataset.review_request = file.concept;
                p.textContent = file.concept;
                p.onclick = function() {
                    showModal(file, type="help-request");
                };
                reviewLinksDiv.appendChild(p);
            });
        })
        .catch(error => {
            console.error('Error fetching review files:', error);
        });
}

function showForm(form){
    if(form==="help-request"){
        document.getElementById('help_request_form_container').style.display = "flex";
        document.getElementById('help_request_btn').style.display = "none";
    }else{
        document.getElementById('review_form_container').style.display = "flex";
        document.getElementById('review_btn').style.display = "none";
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} - ${hour}:${minute}`;
}

function showModal(data, type="") {
    let modalContent = '';

    if (type === "help-request") {
        modalContent = `
            <h3>${data.concept}</h3>
            <p>Added by: ${data.user.username}</p>
            <p>Email: <span class="user_data">${data.user.email}</span> <button class="copy_button" data-copy-target=".user_data">Copy</button></p>
            <p>Discord: <span class="user_data">${data.user.discord_handle}</span> <button class="copy_button" data-copy-target=".user_data">Copy</button></p>
            <p>${formatDate(data.created_at)}</p>
            <hr>
            <p>Course: ${data.course}</p>
            <p>Module Link: ${data.module_link}</p>
            <p>Note: ${data.note}</p>
            <div><button id="modal_button">Dismiss</button></div>
        `;
    } else if (type === "review") {
        modalContent = `
            <h3>${data.concept}</h3>
            <p>Added by: ${data.user.username}</p>
            <p>Email: <span class="user_data">${data.user.email}</span> <button class="copy_button" data-copy-target=".user_data">Copy</button></p>
            <p>Discord: <span class="user_data">${data.user.discord_handle}</span> <button class="copy_button" data-copy-target=".user_data">Copy</button></p>
            <p>${data.created_at}</p>
            <hr>
            <p>Course: ${data.course}</p>
            <p>Module Link: ${data.module_link}</p>
            <p>Note: ${data.note}</p>
            <p>Active until: ${data.duration}</p>
            <div><button id="modal_button">Dismiss</button></div>
        `;
    } else {
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

document.addEventListener('DOMContentLoaded', () => {
    if(window.location.pathname === '/') handleHomePage();
});