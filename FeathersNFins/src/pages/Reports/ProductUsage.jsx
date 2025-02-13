import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./ProductUsage.css";
import TranslateText from "../../components/TranslateText";

export default function ProductUsageModal() {
    const [modal, setModal] = useState(false);
    const [inputValues, setInputValues] = useState({
        input1: "",
        input2: ""
    });
    const [submittedJSON, setSubmittedJSON] = useState("");
    const [chartData, setChartData] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");  // State for error message

    // Function to fetch product usage data
    const fetchData = async () => {
        const startDateTime = inputValues.input1;  // Get the start date from input
        const endDateTime = inputValues.input2;    // Get the end date from input

        try {
            const response = await fetch(`https://project-3-a7za.onrender.com/product-usage?startDateTime=${startDateTime}&endDateTime=${endDateTime}`);
            const data = await response.json();

            if (response.status === 404) {
                setErrorMessage(data.message);  // Update error message if data is not found
            } else {
                setChartData(data);  // Set the response data to chart data
            }
        } catch (error) {
            console.error("Error fetching product usage data:", error);
            setErrorMessage("Failed to fetch data.");
        }
    };

    const toggleModal = () => {
        setModal(!modal);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputValues({
            ...inputValues,
            [name]: value
        });
    };

    // Regular expression for validating the time format: YYYY-MM-DD HH:MM:SS
    const isValidTimeFormat = (time) => {
        const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        return regex.test(time);
    };

    const handleSubmit = () => {
        // Check if both input fields have the correct format
        if (!isValidTimeFormat(inputValues.input1) || !isValidTimeFormat(inputValues.input2)) {
            setErrorMessage("Please enter both start and end time in the format YYYY-MM-DD HH:MM:SS.");
            return;  // Don't proceed with submission if inputs are invalid
        }

        // Clear the error message if validation passes
        setErrorMessage("");

        const jsonData = {
            input1: inputValues.input1,
            input2: inputValues.input2
        };

        fetchData(); // Close the modal after submission, or you can keep it open if needed
    };

    return (
        <>
            <button onClick={toggleModal} className="product-modal-btn-modal">
                <TranslateText>View Product Usage</TranslateText>
            </button>

            {modal && (
                <div className="product-modal-modal">
                    <div className="product-modal-overlay"></div>
                    <div className="product-modal-content">
                        <button className="product-modal-close-button" onClick={toggleModal}>
                            &#10060;
                        </button>
                        <h3 className="product-modal-title">Product Usage Input</h3>

                        {/* Display error message if there is one */}
                        {errorMessage && (
                            <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
                                {errorMessage}
                            </div>
                        )}

                        <label className="product-modal-label">
                            Start Time (YYYY-MM-DD HH:MM:SS):
                            <input
                                type="text"
                                name="input1"
                                value={inputValues.input1}
                                onChange={handleChange}
                                placeholder="Enter Time"
                                className="product-modal-input1"
                            />
                        </label>
                        <label className="product-modal-label">
                            End Time (YYYY-MM-DD HH:MM:SS):
                            <input
                                type="text"
                                name="input2"
                                value={inputValues.input2}
                                onChange={handleChange}
                                placeholder="Enter Time"
                                className="product-modal-input2"
                            />
                        </label>
                        <button className="product-modal-submit-button" onClick={handleSubmit}>Submit</button>

                        {/* Conditionally render the chart if chartData is available */}
                        {chartData.length > 0 && (
                            <div className="product-modal-chart">
                                <h3>Product Usage Chart</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="itemname" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="total_quantity_used" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
