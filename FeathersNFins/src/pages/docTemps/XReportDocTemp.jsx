import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import "./XReport.css";


    const [modal, setModal] = useState(false);
    const [salesData, setSalesData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedTime, setGeneratedTime] = useState("");
    const [totalSales, setTotalSales] = useState(0);

    /**
 * Toggles the modal visibility and fetches the sales data when the modal is opened.
 * This function is responsible for triggering the fetch of sales data when the modal is opened.
 * 
 * It checks if the modal is not already open, and if so, calls `fetchSalesData` to load the sales data.
 * 
 * @function
 * @example
 * toggleModal(); // Toggles the modal visibility and fetches data if necessary
 */
const toggleModal = () => {
    setModal(!modal);
    if (!modal) {
        fetchSalesData();
    }
};

/**
 * Asynchronously fetches sales data for the current day, formats it, and updates the state variables.
 * 
 * This function performs the following:
 * 1. Sets loading state to true and resets any previous error messages.
 * 2. Fetches sales data from an external API for the current date, formatted as `YYYY-MM-DD`.
 * 3. Processes the response data and creates an array of hourly sales data.
 * 4. Updates the state variables with the formatted data, total sales, and timestamp for data generation.
 * 5. Handles any errors during the fetch process and updates the error state if necessary.
 * 6. Sets loading state to false after the data is processed.
 * 
 * @async
 * @function
 * @returns {Promise<void>} No return value, but updates the component's state.
 * @example
 * fetchSalesData(); // Fetches and processes the sales data for the current day
 */
const fetchSalesData = async () => {
    setLoading(true);
    setError(null);

    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const day = String(now.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        const response = await fetch(`https://project-3-a7za.onrender.com/sales-per-hour?date=${formattedDate}`);
        if (!response.ok) {
            throw new Error("Failed to fetch sales data");
        }
        const data = await response.json();

        const currentHour = now.getHours();
        const hoursArray = Array.from({ length: currentHour + 1 }, (_, i) => `${i}:00`);

        const formattedData = hoursArray.map((hour) => {
            const hourKey = hour.split(":")[0];
            return {
                hour,
                sales: parseFloat(data[hourKey]) || 0,
            };
        });

        setSalesData(formattedData);
        setGeneratedTime(now.toLocaleString());
        setTotalSales(formattedData.reduce((sum, { sales }) => sum + sales, 0));
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
