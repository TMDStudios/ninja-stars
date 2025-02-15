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

export const setRefreshToken = (token) => {
    localStorage.setItem('refresh_token', token);
};

export const getRefreshToken = () => {
    return localStorage.getItem('refresh_token');
};

export const removeTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('loggedInUsername');
};