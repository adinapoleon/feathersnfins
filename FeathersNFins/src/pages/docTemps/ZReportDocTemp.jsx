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
     * Toggles the visibility of the modal and triggers the fetching of sales data when opened.
     * This function toggles the modal's visibility state, and when the modal is opened,
     * it calls `fetchSalesData` to load the sales data for the current day.
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
     * Asynchronously fetches the sales data for the current date, processes it, and updates the component state.
     * 
     * This function performs the following steps:
     * 1. Sets the loading state to true and clears any previous error messages.
     * 2. Fetches sales data from an external API, based on the current date formatted as `YYYY-MM-DD`.
     * 3. Maps the sales data into hourly intervals, based on the current hour.
     * 4. Updates the state with the formatted sales data, total sales, and the timestamp of when the data was generated.
     * 5. Handles errors during the fetch operation by updating the error state.
     * 6. Sets the loading state to false once the data has been processed or if an error occurs.
     * 
     * @async
     * @function
     * @returns {Promise<void>} No return value, but updates the component's state with the fetched data.
     * @example
     * fetchSalesData(); // Fetches and processes sales data for the current date
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


