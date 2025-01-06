import React, { useEffect, useState } from 'react';
import { fetchData } from '../utils/api';
import Modal from './Modal';
import NewReview from './NewReview';
import { Link } from 'react-router-dom';

const Reviews = ({ token }) => {
    const [reviews, setReviews] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [modalData, setModalData] = useState(null);
    const [modalType, setModalType] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            if(!token){
                setErrorMessage('Access token is missing.');
                return;
            }

            try{
                const data = await fetchData('reviews', token);
                setReviews(data['reviews']);
            }catch(error){
                setErrorMessage('Failed to fetch reviews.');
            }
        };

        fetchReviews();
    }, [token]);

    const handleShowModal = (item, type) => {
        setModalData(item);
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleDeleteReview = (id) => {
        console.log('Deleting review with id:', id);
        handleCloseModal();
    };

    return(
        <div>
            <h3>Reviews</h3>
            <p><Link to="/new-review">Create a New Review</Link></p>

            {isFormOpen && <NewReview token={token} onSuccess={(newReview) => setReviews([...reviews, newReview])} />}

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <ul>
                {reviews.map((item, index) => (
                    <li key={index}>
                        <a href="#" onClick={() => handleShowModal(item, 'reviews')}>{item.concept}</a>
                    </li>
                ))}
            </ul>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} data={modalData} type={modalType} onDelete={handleDeleteReview} />
        </div>
    );
};

export default Reviews;
