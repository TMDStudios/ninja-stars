function handleHomePage(){
    const form = document.getElementById('helpRequestForm');

    form.addEventListener('submit', function(event){
        event.preventDefault();
        const formData = new FormData(form);
        fetch(form.action,{
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            }
        })
        .then(response => {
            if(response.ok){
                form.reset();
                return response.json();
            }else{
                throw new Error('Unable to send request. Please check the form.');
            }
        })
        .then(data => {
            // showModal(data.message);
            fetchHelpRequests();
        })
        .catch(error => {
            showModal('Error: ' + error.message);
        });
    });

    fetchHelpRequests();
}

function fetchHelpRequests(){
    fetch('/api/fetch-help-requests/')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            const helpFileLinksDiv = document.getElementById('help-requests');
            helpFileLinksDiv.innerHTML = '';

            data.help_requests.forEach(file => {
                const p = document.createElement('p');
                const a = document.createElement('a');
                a.href = '#';
                a.className = 'help-request';
                a.dataset.help_request = file.concept;
                a.textContent = file.concept;
                p.appendChild(a);
                helpFileLinksDiv.appendChild(p);
            });

            if(data.help_files.length > 0){
                fetchHelpData(data.help_files[0]);
            }
        })
        .catch(error => {
            console.error('Error fetching help files:', error);
        });
}

handleHomePage()