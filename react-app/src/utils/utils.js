export const setAccessToken = (token) => {
    localStorage.setItem('access_token', token);
};

export const getAccessToken = () => {
    return localStorage.getItem('access_token');
};

export const setLoggedInUser = (username) => {
    localStorage.setItem('loggedInUsername', username);
};

export const getLoggedInUser = () => {
    return localStorage.getItem('loggedInUsername');
};