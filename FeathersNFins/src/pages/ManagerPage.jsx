import React, { useState, useEffect } from 'react';
import './ManagerPage.css';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import MenuItemModal from './Input Modals/MenuItemModal';
import MenuItemEditModal from './Input Modals/MenuItemEdit';
import EmployeeModal from './Input Modals/EmployeeModal';
import EmployeeEditModal from './Input Modals/EmployeeEdit';
import InventoryModal from './Input Modals/InventoryModal';
import InventoryEditModal from './Input Modals/InventoryEdit';
import LanguageSelector from '../components/LanguageSelector';
import TranslateText from '../components/TranslateText';
import AnalyticsDashboard from './AnalyticsDashboard';
import ManagerLogin from './ManagerLogin';

function ManagerPage() {
  const [activeView, setActiveView] = useState("Menu Items");
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [error, setError] = useState(null);

  const { isAuthenticated, user } = useAuth();

  // Auth state logging
  useEffect(() => {
    console.log('Auth State:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  // Fetch data when the active view changes
  useEffect(() => {
    if (activeView === "Menu Items") {
      fetchMenuItems();
    } else if (activeView === "Inventory") {
      fetchInventoryItems();
    } else if (activeView === "Employee") {
      fetchEmployees();
    } else if (activeView === "Analytics") {
      fetchAnalyticsData();
    }
  }, [activeView]);

  // Fetch functions for Menu, Inventory, Employee, and Analytics data
  const fetchMenuItems = async () => {
    try {
      const response = await fetch("https://project-3-a7za.onrender.com/menu");
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setMenuItems(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setError("Failed to fetch menu items.");
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch("https://project-3-a7za.onrender.com/inventory");
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setInventoryItems(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      setError("Failed to fetch inventory items.");
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch("https://project-3-a7za.onrender.com/employee");
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setEmployees(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Failed to fetch employees.");
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch("https://project-3-a7za.onrender.com/analytics");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Fetched Analytics Data:", data); // Add this line for debugging
      setAnalyticsData(data); // Set the raw data, don't stringify it
      setError(null);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError("Failed to fetch analytics data.");
    }
  };

  // Effect to retrieve the active view from localStorage when the page reloads
  useEffect(() => {
    const savedActiveView = localStorage.getItem('activeView');
    if (savedActiveView) {
      setActiveView(savedActiveView);  // Set the active view to the saved value
    } else {
      setActiveView("Menu Items");  // Default to Menu Items if nothing is saved
    }
  }, []);

  // Update the active view and store it in localStorage when changed
  const handleViewChange = (view) => {
    setActiveView(view);
    localStorage.setItem('activeView', view);  // Save the active view in localStorage
  };

  return (
    <>
      <Header />
      <div className="manager-page">
        <div className="sidebar">
          {["Menu Items", "Inventory", "Employee", "Analytics"].map((view, index) => (
            <button
              key={index}
              onClick={() => handleViewChange(view)} // Use the new handleViewChange function
              className={activeView === view ? "active" : ""}
            >
              <TranslateText>{view}</TranslateText>
            </button>
          ))}
        </div>
        <div className="view-content">
          <h1><TranslateText>{activeView}</TranslateText></h1>

          {error && <p className="error">{error}</p>}

          {activeView === "Menu Items" ? (
            <>
              <ManagerLogin/>
              <MenuItemModal />
              <table className="table menu-table">
                <thead>
                  <tr>
                    <th><TranslateText>ID</TranslateText></th>
                    <th><TranslateText>Name</TranslateText></th>
                    <th><TranslateText>Price</TranslateText></th>
                    <th><TranslateText>Category</TranslateText></th>
                    <th><TranslateText>Description</TranslateText></th>
                    <th><TranslateText>Is Vegetarian</TranslateText></th>
                    <th><TranslateText>Actions</TranslateText></th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.menuitemid}>
                      <td><TranslateText>{item.menuitemid}</TranslateText></td>
                      <td><TranslateText>{item.name}</TranslateText></td>
                      <td>${item.price.toFixed(2)}</td>
                      <td><TranslateText>{item.category}</TranslateText></td>
                      <td><TranslateText>{item.description}</TranslateText></td>
                      <td>
                        <TranslateText>{item.isvegetarian ? "Yes" : "No"}</TranslateText>
                      </td>
                      <td>
                        <MenuItemEditModal menuid={item.menuitemid} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : activeView === "Inventory" ? (
            <>
              <ManagerLogin/>
              <InventoryModal />
              <table className="table inventory-table">
                <thead>
                  <tr>
                    <th><TranslateText>ID</TranslateText></th>
                    <th><TranslateText>Item Name</TranslateText></th>
                    <th><TranslateText>Quantity</TranslateText></th>
                    <th><TranslateText>Unit Cost</TranslateText></th>
                    <th><TranslateText>Actions</TranslateText></th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item) => (
                    <tr key={item.inventoryid}>
                      <td><TranslateText>{item.inventoryid}</TranslateText></td>
                      <td><TranslateText>{item.itemname}</TranslateText></td>
                      <td><TranslateText>{item.quantity}</TranslateText></td>
                      <td>${item.unitcost.toFixed(2)}</td>
                      <td>
                        <InventoryEditModal itemid={item.inventoryid} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : activeView === "Employee" ? (
            <>
              <ManagerLogin/>
              <EmployeeModal />
              <table className="table employee-table">
                <thead>
                  <tr>
                    <th><TranslateText>ID</TranslateText></th>
                    <th><TranslateText>Name</TranslateText></th>
                    <th><TranslateText>Manager</TranslateText></th>
                    <th><TranslateText>Actions</TranslateText></th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.employeeid}>
                      <td><TranslateText>{employee.employeeid}</TranslateText></td>
                      <td>{employee.name}</td>
                      <td>
                        <input type="checkbox" checked={employee.manager} readOnly />
                      </td>
                      <td>
                        <EmployeeEditModal username={employee.employeeid} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : activeView === "Analytics" ? (
            <>
            <ManagerLogin/>
            <AnalyticsDashboard analyticsData={analyticsData} />
            </>
          ) : (
            <p><TranslateText>View not available.</TranslateText></p>
          )}
        </div>
      </div>
    </>
  );
}

export default ManagerPage;
