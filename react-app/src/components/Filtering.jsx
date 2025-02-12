import React, { useEffect, useState } from 'react';

const Filtering = ({ updateFilter, updateMessage }) => {
    const [active, setActive] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('all courses');
    const [search, setSearch] = useState('');

    const toggleActive = () => {
        if(active) updateFilter('');
        updateMessage(`Displaying all`);
        setActive((prevState) => !prevState);
    };

    const handleChange = (event) => {
        setSelectedCourse(event.target.value);
    };

    const filterByCourse = (event) => {
        event.preventDefault();
        updateMessage(`Current filter: Course (${selectedCourse})`);
        updateFilter({ course: selectedCourse });
    };

    const filterWithSearch = (event) => {
        event.preventDefault();
        updateMessage(`Current filter: Search (${search})`);
        updateFilter({ search: search });
    };

    const renderApp = _ => {
        if(active){ //() => handleText("Goodbye")
            return  <div className="filtering">
                        <a href="#" onClick={toggleActive}>Show all</a>
                        <div id="filter-forms">
                            <form onSubmit={filterByCourse}>
                                <select value={selectedCourse} onChange={handleChange}>
                                <option value="all courses">All Courses</option>
                                <option value="programming basics">Programming Basics</option>
                                <option value="web fundamentals">Web Fundamentals</option>
                                <option value="python">Python</option>
                                <option value="js">JavaScript</option>
                                <option value="java">Java</option>
                                <option value="c#">C#</option>
                                <option value="projects and algorithms">Projects and Algorithms</option>
                                </select>
                                <button type="submit">Filter by course</button>
                            </form>
                            <form onSubmit={filterWithSearch}>
                                <input type="text" value={search} placeholder="Search by concept" onChange={e => { setSearch(e.target.value); }} required /><br />
                                <button type="submit">Search</button>
                            </form>
                        </div>
                    </div>;
        }
        return  <div className="filtering">
                    <a href="#" onClick={toggleActive}>Filter</a>
                </div>;
    }

    return(
        <>
            {renderApp()}
        </>
    );
};

export default Filtering;