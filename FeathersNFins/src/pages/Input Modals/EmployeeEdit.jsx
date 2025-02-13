import React, { useState, useEffect } from "react";
import "./EmployeeModal.css"; // Rename CSS file as needed
import TranslateText from "../../components/TranslateText";

export default function EmployeeEditModal({ username }) {
    const [modal, setModal] = useState(false);
    const [inputValues, setInputValues] = useState({
        input1: "", // Employee name
        input2: false // Boolean value for checkbox (manager)
    });
    const [fetchedEmployeeData, setFetchedEmployeeData] = useState(null);
    const [errorMessage, setErrorMessage] = useState(""); // State for error messages

    // Populate inputValues when fetchedEmployeeData changes
    useEffect(() => {
        if (fetchedEmployeeData) {
            setInputValues({
                input1: fetchedEmployeeData.name || "",
                input2: fetchedEmployeeData.manager || false
            });
        }
    }, [fetchedEmployeeData]);

    const fetchEmployeeData = async (username) => {
        try {
            const response = await fetch(
                `https://project-3-a7za.onrender.com/employee/empid?employeeid=${username}`
            );
            if (!response.ok) {
                throw new Error(`Error fetching employee data: ${response.statusText}`);
            }
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                setFetchedEmployeeData(data[0]);
            } else {
                throw new Error("Invalid employee data structure.");
            }
        } catch (err) {
            console.error(err);
            setErrorMessage(err.message);
        }
    };

    const toggleModal = async () => {
        if (!modal) {
            // Fetch employee data only when opening the modal
            await fetchEmployeeData(username);
        } else {
            // Reset input values and errors when closing the modal
            setInputValues({
                input1: "",
                input2: false
            });
            setErrorMessage("");
        }
        setModal(!modal);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setInputValues({
            ...inputValues,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async () => {
        const updatedData = {
            id: username,
            name: inputValues.input1.trim(), // Use input1 for name
            manager: inputValues.input2 // Update manager with the checkbox value
        };

        if (!updatedData.name) {
            setErrorMessage("Employee name cannot be empty.");
            return;
        }
        console.log("Updated Data being sent:", updatedData);

        try {
            const response = await fetch(
                `https://project-3-a7za.onrender.com/employee/editapi`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedData) // Send the updated data
                }
            );

            if (!response.ok) {
                let errorMessage = `Error: ${response.status} - ${response.statusText}`;
                if (response.status === 400) {
                    errorMessage = "Error: Employee Already Exists.";
                }
                throw new Error(errorMessage);
            }

            toggleModal();
            localStorage.setItem("activeView", "Employee"); // Set active view to "Employee"
            window.location.reload(); // Refresh the page
        } catch (error) {
            console.error("Error submitting employee data:", error);
            setErrorMessage(error.message || "An unexpected error occurred.");
        }
    };

    const handleDelete = async () => {
        const deleteData = { id: username };

        try {
            const response = await fetch(
                `https://project-3-a7za.onrender.com/employee/deleteapi`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(deleteData)
                }
            );

            if (!response.ok) {
                let errorMessage = `Error: ${response.status} - ${response.statusText}`;
                if (response.status === 400) {
                    errorMessage = "Error: Employee Already Exists.";
                }
                throw new Error(errorMessage);
            }

            toggleModal();
            localStorage.setItem("activeView", "Employee"); // Set active view to "Employee"
            window.location.reload(); // Refresh the page
        } catch (error) {
            console.error("Error deleting employee data:", error);
            setErrorMessage(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <>
            <button onClick={toggleModal} className="employee-modal-btn-modal">
                <TranslateText>Edit</TranslateText>
            </button>

            {modal && (
                <div className="employee-modal-container">
                    <div className="employee-modal-overlay"></div>
                    <div className="employee-modal-content">
                        <button className="employee-modal-close-button" onClick={toggleModal}>
                            &#10060;
                        </button>
                        <h3 className="employee-modal-heading">
                            <TranslateText>Edit Employee</TranslateText>
                        </h3>

                        {errorMessage && (
                            <div
                                className="employee-modal-error"
                                style={{ color: "red", marginBottom: "10px" }}
                            >
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
                        <button className="employee-modal-delete-button" onClick={handleDelete}>
                            <TranslateText>Delete</TranslateText>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
