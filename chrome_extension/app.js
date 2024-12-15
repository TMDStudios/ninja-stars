const dojoUrl = 'https://login.codingdojo.com/';

async function fetchData(currentUrl) {
    console.log(currentUrl)
    if (!currentUrl || !currentUrl.includes(dojoUrl)) {
        console.error("This does not look like a coding dojo page");
        document.getElementById("message").innerHTML = 'Please navigate to a Coding Dojo page';
        return;
    }

    if (currentUrl.includes('m/684/7941/81713')) {
        document.getElementById("message").innerHTML = '';
        const helpRequestElement = document.getElementById("help-requests");
        helpRequestElement.innerHTML = `<li><a href='#'>This is a help request</a></li>`;
    } else {
        document.getElementById("message").innerHTML = 'No help requests found';
    }
}

function getCurrentUrl() {
    return new Promise(resolve => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0].url);
        });
    });
}

async function handleUrl() {
    const currentUrl = await getCurrentUrl();
    fetchData(currentUrl);
}

handleUrl();