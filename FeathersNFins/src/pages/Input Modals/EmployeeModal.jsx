import React, { useState } from "react";
import "./EmployeeModal.css";
import TranslateText from "../../components/TranslateText";

export default function EmployeeModal({ onEmployeeAdded }) {
    const [modal, setModal] = useState(false);
    const [inputValues, setInputValues] = useState({
        input1: "", // Employee name
        input2: false // Admin checkbox
    });
    const [errorMessage, setErrorMessage] = useState(""); // State for error message

    const toggleModal = () => {
        setModal(!modal);
        if (modal) {
            setInputValues({ input1: "", input2: false }); // Reset inputs when closing
            setErrorMessage(""); // Clear error messages
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setInputValues({
            ...inputValues,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async () => {
        const jsonData = {
            name: inputValues.input1,
            isAdmin: inputValues.input2
        };

        if (!jsonData.name) {
            setErrorMessage("Employee name cannot be empty.");
            return;
        }

        try {
            const response = await fetch("https://project-3-a7za.onrender.com/employee/postapi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonData)
            });

            if (!response.ok) {
                let errorMessage = `Error: ${response.status} - ${response.statusText}`;
                if (response.status === 400) {
                    errorMessage = "Error: Employee Already Exists.";
                }
                throw new Error(errorMessage);
            }

            setErrorMessage(""); // Clear any errors
            toggleModal(); // Close the modal
            //onEmployeeAdded(); // Notify the parent to refetch employees

            // Store the active view in localStorage
            localStorage.setItem('activeView', 'Employee');  // Set active view to "Employee"

            // Refresh the page to reflect the changes
            window.location.reload();
        } catch (error) {
            console.error("Error submitting employee data:", error);
            setErrorMessage(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <>
            <button onClick={toggleModal} className="employee-modal-btn-modal">
                <TranslateText>Add Employee</TranslateText>
            </button>

            {modal && (
                <div className="employee-modal-container">
                    <div className="employee-modal-overlay" onClick={toggleModal}></div>
                    <div className="employee-modal-content">
                        <button className="employee-modal-close-button" onClick={toggleModal}>
                            &#10060;
                        </button>
                        <h3 className="employee-modal-heading">
                            <TranslateText>Add Employee</TranslateText>
                        </h3>

                        {errorMessage && (
                            <div className="employee-modal-error" style={{ color: "red", marginBottom: "10px" }}>
                                <TranslateText>{errorMessage}</TranslateText>
                            </div>
                        )}

                        <label className="employee-modal-label-name">
                            <TranslateText>Employee Name:</TranslateText>
                            <input
                                type="text"
                                name="input1"
                                value={inputValues.input1}
                                onChange={handleChange}
                                placeholder="Enter employee name here"
                                className="employee-modal-input-name"
                            />
                        </label>
                        <label className="employee-modal-label-admin">
                            <TranslateText>Is Admin:</TranslateText>
                            <input
                                type="checkbox"
                                name="input2"
                                checked={inputValues.input2}
                                onChange={handleChange}
                                className="employee-modal-input-admin"
                            />
                        </label>
                        <button className="employee-modal-submit-button" onClick={handleSubmit}>
                            <TranslateText>Submit</TranslateText>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
