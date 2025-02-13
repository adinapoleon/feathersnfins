import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AnalyticsDashboard.css';
import ProductUsageModal from './Reports/ProductUsage';
import XReportModal from './Reports/XReport';
import ZReportModal from './Reports/ZReport';

/**
 * Component for rendering an analytics dashboard with various charts.
 * 
 * @component
 * @example
 * return (
 *   <AnalyticsDashboard analyticsData={data} />
 * )
 */
const AnalyticsDashboard = ({ analyticsData }) => {

  /**
   * Parses the provided analytics data and ensures it is in valid JSON format.
   * If the data is a string, it is parsed, otherwise the original data is returned.
   * 
   * @returns {Object} The parsed analytics data or an empty object if parsing fails.
   */
  const data = React.useMemo(() => {
    try {
      const parsed = typeof analyticsData === 'string' 
        ? JSON.parse(analyticsData) 
        : analyticsData;
      return parsed || {};
    } catch (error) {
      console.error('Error parsing analytics data:', error);
      return {};
    }
  }, [analyticsData]);

  /**
   * Formats the customer data for chart rendering.
   * 
   * @returns {Array} Array of formatted customer data with name and order count.
   */
  const customerData = React.useMemo(() => {
    if (!data.topFrequentCustomers || !Array.isArray(data.topFrequentCustomers)) return [];
    return data.topFrequentCustomers.map(customer => ({
      name: customer.name || 'Unknown',
      orders: parseInt(customer.order_count) || 0
    }));
  }, [data.topFrequentCustomers]);

  /**
   * Formats the item data for chart rendering.
   * 
   * @returns {Array} Array of formatted item data with name and item count.
   */
  const itemData = React.useMemo(() => {
    if (!data.popularItems || !Array.isArray(data.popularItems)) return [];
    return data.popularItems.map(item => ({
      name: item.name || 'Unknown',
      count: parseInt(item.item_count) || 0
    }));
  }, [data.popularItems]);

  /**
   * Formats the employee data for chart rendering.
   * 
   * @returns {Array} Array of formatted employee data with name and order count.
   */
  const employeeData = React.useMemo(() => {
    if (!data.employeeOrderCounts || !Array.isArray(data.employeeOrderCounts)) return [];
    return data.employeeOrderCounts.map(employee => ({
      name: employee.name || 'Unknown',
      orders: parseInt(employee.order_count) || 0
    }));
  }, [data.employeeOrderCounts]);

  /**
   * Calculates the total sales from the provided data.
   * 
   * @returns {number} The total sales or 0 if the data is invalid.
   */
  const totalSales = React.useMemo(() => {
    const sales = parseFloat(data.totalSales || 0);
    return isNaN(sales) ? 0 : sales;
  }, [data.totalSales]);

  /**
   * Renders a bar chart with the provided data, data key, and fill color.
   * 
   * @param {Array} data - The data to be displayed in the chart.
   * @param {string} dataKey - The key in the data for the values to be plotted.
   * @param {string} fill - The fill color of the bars in the chart.
   * 
   * @returns {JSX.Element} The rendered BarChart component.
   */
  const renderBarChart = (data, dataKey, fill) => (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill={fill} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  // Additional render logic and JSX for the dashboard component would go here.

};

export default AnalyticsDashboard;
