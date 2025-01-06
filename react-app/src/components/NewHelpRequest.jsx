import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NewHelpRequest = ({ token, onSuccess }) => {
    const [concept, setConcept] = useState('');
    const [course, setCourse] = useState('all courses');
    const [moduleLink, setModuleLink] = useState('');
    const [note, setNote] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if(!token){
            setMessage('Access token is missing.');
            return;
        }

        try{
            const response = await fetch('http://localhost:8000/api/help/request/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ concept, course, module_link: processModuleUrl(moduleLink), note }),
            });

            const result = await response.json();

            if(response.ok){
                setMessage('Help request added successfully!');
                if (onSuccess) onSuccess(result);
                navigate('/');
            }else{
                setMessage('Failed to add help request: ' + result.detail);
            }
        }catch(error){
            setMessage("Error: "+error.message);
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
            <h3>Create Help Request</h3>
            <form onSubmit={handleSubmit}>
                <input type="text" id="help_request_concept" placeholder="Topic" value={concept} onChange={(e) => setConcept(e.target.value)} required /><br />
                <select name="help_request_course" id="help_request_course" value={course} onChange={(e) => setCourse(e.target.value)} >
                    <option value="all courses">All Courses</option>
                    <option value="programming basics">Programming Basics</option>
                    <option value="web fundamentals">Web Fundamentals</option>
                    <option value="python">Python</option>
                    <option value="js">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="c#">C#</option>
                    <option value="projects and algorithms">Projects and Algorithms</option>
                </select><br />
                <input type="text" id="help_request_module_link" placeholder="https://login.codingdojo.com/m/612/13872/98853" value={moduleLink} onChange={(e) => setModuleLink(e.target.value)} required /><br />
                <input type="text" id="help_request_note" placeholder="Add notes (optional)" value={note} onChange={(e) => setNote(e.target.value)} /><br />
                <input className="submitBtn" type="submit" value="Submit" />
            </form>
            {message && <p>{message}</p>}
            <div>
                <button onClick={() => navigate('/')}>Dismiss</button>
            </div>
        </div>
    );
};

export default NewHelpRequest;