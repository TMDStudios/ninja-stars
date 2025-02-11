import HelpRequests from './HelpRequests';
import Reviews from './Reviews';

const Home = ({ message, updateMessage, onLogout, token }) => {
    return(
        <div>
            <h3>Welcome to Ninja Stars!</h3>
            <p>{message}</p>
            <a href="#" onClick={onLogout}>Log Out</a>
            <hr />
            <div className="data">
                <div className="left">
                    <HelpRequests token={token} updateMessage={updateMessage} />
                </div>
                <div className="right">
                    <Reviews token={token} />
                </div>
            </div>
        </div>
    );
};

export default Home;