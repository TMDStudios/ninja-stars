import React from 'react';
import HelpRequests from './HelpRequests';
import Reviews from './Reviews';

const Home = ({ username, onLogout, token }) => {
    return(
        <div>
            <h3>Welcome to Ninja Stars!</h3>
            <p>Login successful. Hello, {username}!</p>
            <a href="#" onClick={onLogout}>Log Out</a>
            <hr />
            <div className="data">
                <div className="left">
                    <HelpRequests token={token} />
                </div>
                <div className="right">
                    <Reviews token={token} />
                </div>
            </div>
        </div>
    );
};

export default Home;