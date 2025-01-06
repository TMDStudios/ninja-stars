import React from 'react';
import '../index.css';

const Modal = ({ isOpen, onClose, data, type, onDelete }) => {
    if(!isOpen || !data) return null;

    const handleDelete = () => {
        if(onDelete && data.id){
            onDelete(data.id);
        }
    };

    const handleCopy = (textToCopy) => {
        navigator.clipboard
            .writeText(textToCopy)
            .then(() => alert(`Copied: ${textToCopy}`))
            .catch(() => alert('Failed to copy text'));
    };

    const renderContent = () => {
        let modalContent = '';
        switch (type) {
            case 'help-requests':
                modalContent = (
                    <>
                        <h3>{data.concept}</h3>
                        <p>Added by: {data.user.username}</p>
                        <p>Email: <span className="user_data_email">{data.user.email}</span>{' '} <button className="copy_button" onClick={() => handleCopy(data.user.email)} >Copy</button></p>
                        <p>Discord: <span className="user_data_discord">{data.user.discord_handle}</span>{' '} <button className="copy_button" onClick={() => handleCopy(data.user.discord_handle)} >Copy</button></p>
                        <hr />
                        <p>Course: {data.course}</p>
                        <p>Module Link:{' '}<a href={`https://login.codingdojo.com/${data.module_link}`} target="_blank" rel="noopener noreferrer" >https://login.codingdojo.com/{data.module_link}</a></p>
                        <p>Note: {data.note.length > 0 ? data.note : 'No note provided'}</p>
                        <div className="modalButtons">
                            <button onClick={onClose}>Dismiss</button>
                            {data.user.username === localStorage.getItem('loggedInUsername') && (<button onClick={handleDelete}>Delete</button>)}
                        </div>
                    </>
                );
                break;
            case 'reviews':
                const createdAt = new Date(data.created_at);
                const durationInMs = data.duration * 60 * 1000;
                const expiresAt = new Date(createdAt.getTime() + durationInMs);
                const activeUntil = formatDate(expiresAt);

                modalContent = (
                    <>
                        <h3>{data.concept}</h3>
                        <p>Added by: {data.user.username}</p>
                        <p>Email: <span className="user_data_email">{data.user.email}</span>{' '} <button className="copy_button" onClick={() => handleCopy(data.user.email)} >Copy</button></p>
                        <p>Discord: <span className="user_data_discord">{data.user.discord_handle}</span>{' '} <button className="copy_button" onClick={() => handleCopy(data.user.discord_handle)} >Copy</button></p>
                        <hr />
                        <p>Course: {data.course}</p>
                        <p>Module Link:{' '}<a href={`https://login.codingdojo.com/${data.module_link}`} target="_blank" rel="noopener noreferrer" >https://login.codingdojo.com/{data.module_link}</a></p>
                        <p>Note: {data.note.length > 0 ? data.note : 'No note provided'}</p>
                        <p>Active until: {activeUntil}</p>
                        <div className="modalButtons">
                            <button onClick={onClose}>Dismiss</button>
                        </div>
                    </>
                );
                break;
            default:
                modalContent = <p>{data}</p>;
        }
        return modalContent;
    };

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${month}/${day}/${year} - ${hour}:${minute}`;
    };

    return (
        <div className="modal">
            <div className="modal-content">{renderContent()}</div>
        </div>
    );
};

export default Modal;