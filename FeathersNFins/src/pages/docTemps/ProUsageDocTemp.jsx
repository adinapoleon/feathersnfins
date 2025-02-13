import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./ProductUsage.css";
import TranslateText from "../../components/TranslateText";
/**
 * ProductUsageModal component that allows users to input a date range and fetch product usage data.
 * The data is then displayed in a bar chart format, and users are provided with feedback regarding 
 * errors or successful data retrieval.
 * 
 * State Variables:
 * - `modal`: A boolean indicating whether the modal is open or closed.
 * - `inputValues`: An object that holds the input values for the start and end date-time.
 * - `submittedJSON`: A string representing the JSON data submitted by the user (currently unused).
 * - `chartData`: An array that stores the fetched product usage data to be displayed on the chart.
 * - `errorMessage`: A string holding an error message if the data fetch fails or if the input values are invalid.
 * 
 * Functions:
 * - `fetchData`: Asynchronously fetches product usage data from the server based on the input date range.
 * - `toggleModal`: Toggles the modal's visibility (open/close).
 * - `handleChange`: Updates the input values state when the user changes the input fields.
 * - `isValidTimeFormat`: Validates the time format (YYYY-MM-DD HH:MM:SS) for the input values.
 * - `handleSubmit`: Validates the inputs and submits the data to fetch product usage information, displaying error messages when necessary.
 * 
 * Dependencies:
 * - `recharts`: Used for rendering the bar chart to display product usage data.
 * - `TranslateText`: A component for rendering text with translation support.
 * 
 * @component
 * @example
 * // Usage example of the ProductUsageModal component
 * <ProductUsageModal />
 */
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

    
}
