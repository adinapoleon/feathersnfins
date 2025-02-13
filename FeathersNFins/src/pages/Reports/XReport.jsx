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

export default function XReportModal() {
    const [modal, setModal] = useState(false);
    const [salesData, setSalesData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedTime, setGeneratedTime] = useState("");
    const [totalSales, setTotalSales] = useState(0);

    const toggleModal = () => {
        setModal(!modal);
        if (!modal) {
            fetchSalesData();
        }
    };

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

    return (
        <>
            <button onClick={toggleModal} className="XReport-modal-btn-modal">
                Generate X Report
            </button>

            {modal && (
                <div className="XReport-modal-modal">
                    <div className="XReport-modal-overlay"></div>
                    <div className="XReport-modal-content">
                        <button className="XReport-modal-close-button" onClick={toggleModal}>
                            &#10060;
                        </button>
                        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                            Sales Per Hour
                        </h3>
                        <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "18px" }}>
                            Report Generated At: {generatedTime} <br />
                            Total Sales: ${totalSales.toFixed(2)}
                        </h2>

                        {loading && <p>Loading...</p>}
                        {error && <p className="error">{error}</p>}
                        {salesData ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="sales" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            !loading && <p>No data available</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
