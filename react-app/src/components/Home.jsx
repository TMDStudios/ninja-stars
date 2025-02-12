import HelpRequests from './HelpRequests';
import Reviews from './Reviews';
import Filtering from './Filtering';
import { useState } from 'react';

const Home = ({ message, updateMessage, onLogout, token }) => {
    const [filter, setFilter] = useState('');

    const updateFilter = newFilter => {
        setFilter(newFilter);
    }

    return(
        <div>
            <h3>Welcome to Ninja Stars!</h3>
            <p>{message}</p>
            <a href="#" onClick={onLogout}>Log Out</a>
            <hr />
            <Filtering updateFilter={updateFilter} updateMessage={updateMessage} />
            <div className="data">
                <div className="left">
                    <HelpRequests token={token} updateMessage={updateMessage} filter={filter} />
                </div>
                <div className="right">
                    <Reviews token={token} filter={filter} />
                </div>
            </div>
        </div>
    );
};

export default Home;