import React, { useState } from "react";
import "./InventoryModal.css";
import LanguageSelector from '../../components/LanguageSelector';
import TranslateText from '../../components/TranslateText';

export default function InventoryModal() {
    const [modal, setModal] = useState(false);
    const [inputValues, setInputValues] = useState({
        itemName: "",
        quantity: "",
        unitCost: ""
    });
    const [errorMessage, setErrorMessage] = useState(""); // State for error messages

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

    const handleSubmit = async () => {
        // Convert the input values to JSON format
        const jsonData = {
            itemName: inputValues.itemName,
            quantity: inputValues.quantity,
            unitCost: inputValues.unitCost
        };
    
        // Client-side validation: Check if itemName is empty
        if (!jsonData.itemName || jsonData.itemName.trim() === "") {
            setErrorMessage("Item name cannot be empty.");
            return;
        }
    
        // Client-side validation: Check if quantity is a positive number
        if (isNaN(jsonData.quantity) || jsonData.quantity <= 0) {
            setErrorMessage("Quantity must be a positive number.");
            return;
        }
    
        // Client-side validation: Check if unitCost is a positive number
        if (isNaN(jsonData.unitCost) || jsonData.unitCost <= 0) {
            setErrorMessage("Unit cost must be a positive number.");
            return;
        }

        try {
            const response = await fetch("https://project-3-a7za.onrender.com/inventory/postapi", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData)
            });
    
            // Check if response is okay
            if (!response.ok) {
                let errorMessage = `Error: ${response.status} - ${response.statusText}`;
                if (response.status === 400) {
                    errorMessage = 'Error: Item Already Exists.'
                }
                throw new Error(errorMessage);
            }
    
            // Clear any errors and close the modal on success
            setErrorMessage(""); 
            toggleModal(); 

            // Optionally you can trigger a refresh of the inventory list
            window.location.reload();
        } catch (error) {
            console.error("Error submitting Inventory data:", error);
            setErrorMessage(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <>
            <button
                onClick={toggleModal}
                className="inventory-modal-btn-modal"
            >
                <TranslateText>Add Inventory Item</TranslateText>
            </button>

            {modal && (
                <div className="inventory-modal-modal">
                    <div className="inventory-modal-overlay" onClick={toggleModal}></div>
                    <div className="inventory-modal-content">
                        {/* Close button (X) */}
                        <button
                            className="inventory-modal-close-button"
                            onClick={toggleModal}
                        >
                            &#10060;
                        </button>
                        <h3 className="inventory-modal-title">
                            <TranslateText>Add Inventory Item</TranslateText>
                        </h3>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="inventory-modal-error-message" style={{ color: "red", marginBottom: "10px" }}>
                                <TranslateText>{errorMessage}</TranslateText>
                            </div>
                        )}

                        {/* Input fields */}
                        <label className="inventory-modal-label">
                            <TranslateText>Item Name:</TranslateText>
                            <input
                                type="text"
                                name="itemName"
                                value={inputValues.itemName}
                                onChange={handleChange}
                                placeholder="Enter item name here"
                                className="inventory-modal-input"
                            />
                        </label>
                        <label className="inventory-modal-label">
                            <TranslateText>Quantity:</TranslateText>
                            <input
                                type="number"
                                name="quantity"
                                value={inputValues.quantity}
                                onChange={handleChange}
                                placeholder="Enter quantity here"
                                className="inventory-modal-input"
                            />
                        </label>
                        <label className="inventory-modal-label">
                            <TranslateText>Unit Cost:</TranslateText>
                            <input
                                type="number"
                                name="unitCost"
                                value={inputValues.unitCost}
                                onChange={handleChange}
                                placeholder="Enter unit cost here"
                                className="inventory-modal-input"
                            />
                        </label>
                        <button
                            className="inventory-modal-submit-button"
                            onClick={handleSubmit}
                        >
                            <TranslateText>Submit</TranslateText>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
