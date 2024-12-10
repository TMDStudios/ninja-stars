function handleHomePage(){
    const help_request_form = document.getElementById('help_request_form');
    const review_form = document.getElementById('review_form');

    help_request_form.addEventListener('submit', function(event){
        event.preventDefault();
        const formData = new FormData(help_request_form);
        formData.forEach((value, key) => {
            console.log(key, value);
        });
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
                return response.json();
            }else{
                console.log(response)
                throw new Error('Unable to send request. Please check the form.');
            }
        })
        .then(data => {
            // showModal(data.message);
            fetchHelpRequests();
        })
        .catch(error => {
            // showModal('Error: ' + error.message);
            console.log(error);
        });
    });

    review_form.addEventListener('submit', function(event){
        event.preventDefault();
        const formData = new FormData(review_form);
        formData.forEach((value, key) => {
            console.log(key, value);
        });
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
                return response.json();
            }else{
                console.log(response)
                throw new Error('Unable to send request. Please check the form.');
            }
        })
        .then(data => {
            // showModal(data.message);
            fetchReviews();
        })
        .catch(error => {
            // showModal('Error: ' + error.message);
            console.log(error);
        });
    });

    fetchHelpRequests();
    fetchReviews();
}

function fetchHelpRequests(){
    fetch('/api/fetch-help-requests/')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            const helpLinksDiv = document.getElementById('help-requests');
            helpLinksDiv.innerHTML = '';

            data.help_requests.forEach(file => {
                const p = document.createElement('p');
                const a = document.createElement('a');
                a.href = '#';
                a.className = 'help-request';
                a.dataset.help_request = file.concept;
                a.textContent = file.concept;
                p.appendChild(a);
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
                const a = document.createElement('a');
                a.href = '#';
                a.className = 'review-request';
                a.dataset.review_request = file.concept;
                a.textContent = file.concept;
                p.appendChild(a);
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
    }else{
        document.getElementById('review_form_container').style.display = "flex";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if(window.location.pathname === '/') handleHomePage();
});