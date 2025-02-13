import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AnalyticsDashboard.css';
import ProductUsageModal from './Reports/ProductUsage';
import XReportModal from './Reports/XReport';
import ZReportModal from './Reports/ZReport';

const AnalyticsDashboard = ({ analyticsData }) => {

  // Parse the JSON if it's a string and ensure we have valid data
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


  // Format customer data
  const customerData = React.useMemo(() => {
    if (!data.topFrequentCustomers || !Array.isArray(data.topFrequentCustomers)) return [];
    return data.topFrequentCustomers.map(customer => ({
      name: customer.name || 'Unknown',
      orders: parseInt(customer.order_count) || 0
    }));
  }, [data.topFrequentCustomers]);

  // Format item data
  const itemData = React.useMemo(() => {
    if (!data.popularItems || !Array.isArray(data.popularItems)) return [];
    return data.popularItems.map(item => ({
      name: item.name || 'Unknown',
      count: parseInt(item.item_count) || 0
    }));
  }, [data.popularItems]);

  // Format employee data
  const employeeData = React.useMemo(() => {
    if (!data.employeeOrderCounts || !Array.isArray(data.employeeOrderCounts)) return [];
    return data.employeeOrderCounts.map(employee => ({
      name: employee.name || 'Unknown',
      orders: parseInt(employee.order_count) || 0
    }));
  }, [data.employeeOrderCounts]);

  // Format total sales
  const totalSales = React.useMemo(() => {
    const sales = parseFloat(data.totalSales || 0);
    return isNaN(sales) ? 0 : sales;
  }, [data.totalSales]);

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


  return (
    <div className="analytics-dashboard">

      <ProductUsageModal/>

      <XReportModal/>

      <ZReportModal/>


      {/* Total Sales Card */}
      <div className="dashboard-card">
        <h3 className="card-title">Total Sales</h3>
        <div className="total-sales">
          ${totalSales.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
      </div>

      {/* Top Customers Chart */}
      <div className="dashboard-card">
        <h3 className="card-title">Top Customers by Orders</h3>
        {customerData.length > 0 ? (
          renderBarChart(customerData, 'orders', '#8884d8')
        ) : (
          <div className="no-data">No customer data available</div>
        )}
      </div>

      {/* Popular Items Chart */}
      <div className="dashboard-card">
        <h3 className="card-title">Most Popular Items</h3>
        {itemData.length > 0 ? (
          renderBarChart(itemData, 'count', '#82ca9d')
        ) : (
          <div className="no-data">No item data available</div>
        )}
      </div>

      {/* Employee Orders Chart */}
      <div className="dashboard-card">
        <h3 className="card-title">Employee Performance</h3>
        {employeeData.length > 0 ? (
          renderBarChart(employeeData, 'orders', '#ffc658')
        ) : (
          <div className="no-data">No employee data available</div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;