import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NewReview = ({ token, onSuccess }) => {
    const [concept, setConcept] = useState('');
    const [course, setCourse] = useState('all courses');
    const [moduleLink, setModuleLink] = useState('');
    const [note, setNote] = useState('');
    const [duration, setDuration] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if(!token){
            setMessage('Access token is missing.');
            return;
        }

        try{
            const response = await fetch('http://localhost:8000/api/review/start/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ concept, course, module_link: processModuleUrl(moduleLink), note, duration }),
            });

            const result = await response.json();

            if(response.ok){
                setMessage('Review added successfully!');
                if (onSuccess) onSuccess(result);
                navigate('/');
            }else{
                setMessage(`Failed to add review: ${result.detail}`);
            }
        }catch(error){
            setMessage('An error occurred while submitting the review');
        }
    };

    function processModuleUrl(fullUrl){
        try{
            return fullUrl.split('https://login.codingdojo.com/')[1];
        }catch{
            return 'Invalid URL';
        }
    }

    return (
        <div>
            <h3>Start Review Session</h3>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" id="new_review_concept" placeholder="Review topic" value={concept} onChange={(e) => setConcept(e.target.value)} required /><br />
                <select name="new_review_course" id="new_review_course" value={course} onChange={(e) => setCourse(e.target.value)} >
                    <option value="all courses">All Courses</option>
                    <option value="programming basics">Programming Basics</option>
                    <option value="web fundamentals">Web Fundamentals</option>
                    <option value="python">Python</option>
                    <option value="js">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="c#">C#</option>
                    <option value="projects and algorithms">Projects and Algorithms</option>
                </select><br />
                <input type="text" id="new_review_module_link" placeholder="https://login.codingdojo.com/m/612/13872/98853" value={moduleLink} onChange={(e) => setModuleLink(e.target.value)} required /><br />
                <input type="text" id="new_review_note" placeholder="Add notes (optional)" value={note} onChange={(e) => setNote(e.target.value)} /><br />
                <input type="number" id="new_review_duration" placeholder="Duration (in minutes)" value={duration} onChange={(e) => setDuration(e.target.value)} required /><br />
                <input className="submitBtn" type="submit" value="Submit" />
            </form>
            <div>
                <button onClick={() => navigate('/')}>Dismiss</button>
            </div>
        </div>
    );
};

export default NewReview;