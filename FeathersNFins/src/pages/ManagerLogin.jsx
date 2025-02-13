import React, { useEffect, useState } from 'react';
import './ManagerLogin.css';
import { useAuth } from '../context/AuthContext';

export default function ManagerLogin() {
    const [modal, setModal] = useState(true);
    const [fetchedEmployeeData, setFetchedEmployeeData] = useState([]);
    const [inputValue, setInputValues] = useState({
        input: ""
    });
    const [errorMessage, setErrorMessage] = useState('');
    const { isAuthenticated, user } = useAuth();

    let ismanager;

    const fetchEmployeeData = async (userID) => {
        try {
            const response = await fetch(
                `https://project-3-a7za.onrender.com/employee/empid?employeeid=${userID}`
            );
            if (!response.ok) {
                throw new Error(`Error fetching employee data: ${response.statusText}`);
            }
            const data = await response.json();
            let managerindex = (JSON.stringify(data)).search("manager");
            ismanager = (JSON.stringify(data)).at(managerindex+9); 

            setFetchedEmployeeData(data); // Store raw JSON data
            setErrorMessage(`${ismanager}`);
        } catch (err) {
            console.error('Failed to fetch employee data:', err);
            setErrorMessage(`Failed to fetch employee data: ${err.message}`);
        }
    };


    useEffect(() => {
        console.log('Auth State:', { isAuthenticated, user });
    }, [isAuthenticated, user]);

    const toggleModal = () => {
        setModal(!modal);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputValues({
            ...inputValue,
            [name]: value
        });
    };

    const checkManager = async () => {
        try {
            const currUser = user?.username;
            if (!currUser) {
                console.error('User is not authenticated');
                setErrorMessage('User is not authenticated. Please log in.');
                return;
            }

            const empResponse = await fetch(
                `https://project-3-a7za.onrender.com/employeeid/${encodeURIComponent(currUser)}`
            );
            if (!empResponse.ok) {
                throw new Error(`Error fetching employee ID: ${empResponse.statusText}`);
            }

            const fetchedEmpID = await empResponse.json();
            const empID = fetchedEmpID?.employeeid;

            if (empID) {
                await fetchEmployeeData(empID);

                if (ismanager === "t") {
                    setErrorMessage("Is Manager");
                    toggleModal();
                    
                } else {
                    setErrorMessage("Employee is not a Manager");
                }

            } else {
                console.error('Employee ID not found');
                setErrorMessage('Employee ID not found.');
            }
        } catch (err) {
            console.error('Error in checkManager:', err);
            setErrorMessage(`An error occurred while verifying the manager. ${err.message}`);
        }
    };

    // Run checkManager on page load
    useEffect(() => {
        if (isAuthenticated && user) {
            checkManager();
        }
    }, [isAuthenticated, user]); // Runs when authentication state or user changes

    const handleSubmit = () => {
        if(inputValue.input === "1234") {
            toggleModal();
        }
    }

    return (
        <>
            {modal && (
                <div className="manager-login-container">
                    <div className="login-modal-overlay"></div>
                    <div className="login-modal-content">
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <label className="bypass-code-label">Enter Bypass Code: 
                            <input
                                type="text"
                                className="bypass-code-input"
                                name="input"
                                value={inputValue.input}
                                onChange={handleChange}
                                placeholder='Enter Bypass Code'
                            />
                        </label>
                        <button className="bypass-code-submit" onClick={handleSubmit}>Submit</button>
                    </div>
                </div>
            )}
        </>
    );
}
