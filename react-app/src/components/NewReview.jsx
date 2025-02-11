import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { postData, profanityDetected } from '../utils/api';

const NewReview = ({ message, updateMessage, token, onSuccess }) => {
    const [concept, setConcept] = useState('');
    const [course, setCourse] = useState('all courses');
    const [moduleLink, setModuleLink] = useState('');
    const [note, setNote] = useState('');
    const [duration, setDuration] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if(!token){
            updateMessage('Access token is missing.');
            return;
        }

        let containsProfanity = false;
        if(await profanityDetected(concept) || await profanityDetected(moduleLink) || await profanityDetected(note)) containsProfanity = true;
        if(containsProfanity){
            alert('Submission failed: Please refrain from using profanity.');
            return;
        }

        const data = {
            concept,
            course,
            module_link: processModuleUrl(moduleLink),
            note,
            duration,
        };

        try{
            const result = await postData('review/start', token, data);
            updateMessage('Review added successfully!');
            if(onSuccess) onSuccess(result);
            updateMessage(`Review added successfully!`);
            navigate('/');
        }catch(error){
            updateMessage(`Error: ${error.message}`);
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