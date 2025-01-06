import React, { useEffect, useState } from 'react';
import { fetchData } from '../utils/api';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';

const HelpRequests = ({ token }) => {
    const [helpRequests, setHelpRequests] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedHelpRequest, setSelectedHelpRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHelpRequests = async () => {
            if(!token){
                setErrorMessage('Access token is missing.');
                return;
            }

            try{
                const data = await fetchData('help-requests', token);
                setHelpRequests(data['help-requests'] || []);
            }catch(error){
                setErrorMessage('Failed to fetch help requests.');
            }
        };

        fetchHelpRequests();
    }, [token]);

    const handleShowModal = (item) => {
        setSelectedHelpRequest(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedHelpRequest(null);
    };

    const handleDeleteRequest = async (id) => {
        try{
            const response = await fetch(`http://localhost:8000/api/help-requests/${id}/delete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const result = await response.json();
            if(response.ok){
                setHelpRequests(helpRequests.filter((request) => request.id !== id));
                handleCloseModal();
            }else{
                setErrorMessage('Failed to delete help request: ' + result.detail);
            }
        }catch(error){
            setErrorMessage('Error deleting help request.');
        }
    };

    return(
        <div>
            <h3>Help Requests</h3>
            <p><a href="#" onClick={() => navigate('/new-help-request')}>Create a New Help Request</a></p>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <ul>
                {Array.isArray(helpRequests) && helpRequests.length > 0 ? (
                    helpRequests.map((item, index) => (
                        item && item.concept ? (
                            <li key={index}>
                                <a href="#" onClick={() => handleShowModal(item)}>{item.concept}</a>
                            </li>
                        ) : null
                    ))
                ) : (
                    <p>No help requests available.</p>
                )}
            </ul>

            {selectedHelpRequest && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} data={selectedHelpRequest} type="help-requests" onDelete={handleDeleteRequest} />
            )}
        </div>
    );
};

export default HelpRequests;