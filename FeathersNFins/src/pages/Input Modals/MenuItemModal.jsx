import React, { useState } from "react";
import "./MenuItemModal.css";
import LanguageSelector from '../../components/LanguageSelector';
import TranslateText from '../../components/TranslateText';

export default function MenuItemModal() {
    const [modal, setModal] = useState(false);
    const [inputValues, setInputValues] = useState({
        input1: "",
        input2: "",
        input3: "",
        input4: "",
        input5: "",
        input6: false // New input for vegetarian checkbox state
    });

    const [error, setError] = useState(""); // Add error state

    const toggleModal = () => {
        setModal(!modal);
        setError(""); // Clear error on success
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputValues({
            ...inputValues,
            [name]: value
        });
    };

    const handleCheckboxChange = () => {
        setInputValues((prevState) => {
            const newValue = !prevState.input6;
            console.log("Checkbox toggled. New value:", newValue);
            return {
                ...prevState,
                input6: newValue,
            };
        });
    };

    const parseInventoryList = (inventoryListString) => {
        return inventoryListString.split(',').map(item => {
            // Split into parts by the last space to get the name and quantity
            const trimmedItem = item.trim();
            const lastSpaceIndex = trimmedItem.lastIndexOf(' ');
            
            if (lastSpaceIndex === -1) {
                // If no space is found, the input format is invalid
                return null;
            }
            
            const inventoryName = trimmedItem.slice(0, lastSpaceIndex).trim();
            const quantity = parseInt(trimmedItem.slice(lastSpaceIndex + 1), 10);
            
            return { inventoryName, quantity };
        }).filter(item => item && item.inventoryName && !isNaN(item.quantity));
    };
    

    const handleSubmit = async () => {
        const parsedInventoryList = parseInventoryList(inputValues.input5);
        console.log("Parsed Inventory List:", parsedInventoryList);
    
        // Validate parsed inventory list
        if (!parsedInventoryList || parsedInventoryList.length === 0) {
            setError("Inventory list is empty or invalid.");
            return;
        }
    
        // Check if all inventory items exist
        for (const { inventoryName, quantity } of parsedInventoryList) {
            if (!Number.isInteger(quantity) || quantity <= 0) {
                setError(`Quantity for item "${inventoryName}" must be a positive whole number.`);
                return;
            }
    
            try {
                const response = await fetch(
                    `https://project-3-a7za.onrender.com/inventory/check?itemname=${encodeURIComponent(inventoryName)}`
                );
    
                if (!response.ok) {
                    throw new Error(`Error checking inventory item: ${response.statusText}`);
                }
    
                const { exists } = await response.json();
    
                if (!exists) {
                    setError(`Inventory item "${inventoryName}" does not exist.`);
                    return;
                }
            } catch (error) {
                console.error("Error validating inventory item:", error);
                setError("An error occurred while validating inventory items.");
                return;
            }
        }
    
        // Prepare JSON data for submission
        const jsonData = {
            name: inputValues.input1,
            description: inputValues.input2,
            price: inputValues.input3,
            category: inputValues.input4,
            inventoryList: parsedInventoryList,
            isVegetarian: inputValues.input6
        };
    
        // Validate menu item fields
        if (!jsonData.name || jsonData.name.trim() === "") {
            setError("Menu item name cannot be empty.");
            return;
        }
    
        if (!jsonData.price || isNaN(jsonData.price) || jsonData.price <= 0) {
            setError("Price must be a positive number.");
            return;
        }
    
        if (!jsonData.category || jsonData.category.trim() === "") {
            setError("Please select a category.");
            return;
        }
    
        try {
            const response = await fetch("https://project-3-a7za.onrender.com/menu/postapi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonData)
            });
    
            if (!response.ok) {
                let errorMessage = `Error: ${response.status} - ${response.statusText}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
    
            const responseData = await response.json();
            console.log("Response Data:", responseData);
    
            setError(""); // Clear error on success
            toggleModal(); // Close the modal on success
    
            window.location.reload(); // Reload the page to reflect the changes
        } catch (error) {
            console.error("Error submitting data:", error);
            setError("An error occurred while submitting the menu item.");
        }
    };
    

    return (
        <>
            <button onClick={toggleModal} className="menu-item-modal-btn-modal">
                <TranslateText>Add Menu Item</TranslateText>
            </button>

            {modal && (
                <div className="menu-item-modal-modal">
                    <div className="menu-item-modal-overlay"></div>
                    <div className="menu-item-modal-content">
                        <button className="menu-item-modal-close-button" onClick={toggleModal}>
                            &#10060;
                        </button>
                        <h3 className="menu-item-modal-title">Add Menu Item</h3>

                        {error && (
                            <div className="menu-item-modal-error" style={{ color: "red", marginBottom: "10px" }}>
                                <TranslateText>{error}</TranslateText>
                            </div>
                        )}

                        <label className="menu-item-modal-label">
                            <TranslateText>Menu Item Name:</TranslateText>
                            <input
                                type="text"
                                name="input1"
                                value={inputValues.input1}
                                onChange={handleChange}
                                placeholder="Enter menu item name here"
                                className="menu-item-modal-input-name"
                            />
                        </label>
                        <label className="menu-item-modal-label">
                            <TranslateText>Description:</TranslateText>
                            <input
                                type="text"
                                name="input2"
                                value={inputValues.input2}
                                onChange={handleChange}
                                placeholder="Enter description here"
                                className="menu-item-modal-input-description"
                            />
                        </label>
                        <label className="menu-item-modal-label">
                            <TranslateText>Price:</TranslateText>
                            <input
                                type="number"
                                name="input3"
                                value={inputValues.input3}
                                onChange={handleChange}
                                placeholder="Enter price here"
                                className="menu-item-modal-input-price"
                                min="0"
                                step="0.01"
                            />
                        </label>
                        <label className="menu-item-modal-label">
                            <TranslateText>Category:</TranslateText>
                            <select
                                name="input4"
                                value={inputValues.input4}
                                onChange={handleChange}
                                className="menu-item-modal-select-category"
                            >
                                <option value="" disabled>Select Category</option>
                                <option value="Sides/Extras">Sides/Extras</option>
                                <option value="Drink">Drink</option>
                                <option value="Chicken">Chicken</option>
                                <option value="Fish">Fish</option>
                                <option value="Special">Special</option>
                            </select>
                        </label>
                        <label className="menu-item-modal-label">
                            <TranslateText>Inventory Items and Quantities:</TranslateText>
                            <input
                                type="text"
                                name="input5"
                                value={inputValues.input5}
                                onChange={handleChange}
                                placeholder="Enter inventory items and quantities (e.g. Water 1, Napkin 3, etc.)"
                                className="menu-item-modal-input-inventory"
                            />
                        </label>

                        <label className="menu-item-modal-checkbox-label">
                            <TranslateText>Is Vegetarian:</TranslateText>
                            <input
                                type="checkbox"
                                checked={inputValues.input6}
                                onChange={handleCheckboxChange}
                                className="menu-item-modal-input-checkbox"
                            />
                        </label>

                        <button className="menu-item-modal-submit-button" onClick={handleSubmit}>
                            <TranslateText>Submit</TranslateText>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
