import React, { useState, useEffect } from "react";
import "./InventoryModal.css";
import TranslateText from "../../components/TranslateText";

export default function InventoryEditModal({ itemid }) {
    const [modal, setModal] = useState(false);
    const [inputValues, setInputValues] = useState({
        itemName: "",
        quantity: "",
        unitCost: ""
    });
    const [fetchedItemData, setFetchedItemData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (fetchedItemData) {
            setInputValues({
                itemName: fetchedItemData.itemname || "",
                quantity: fetchedItemData.quantity || "",
                unitCost: fetchedItemData.unitcost || ""
            });
        }
    }, [fetchedItemData]);

    const fetchItemData = async (itemid) => {
        try {
            const response = await fetch(
                `https://project-3-a7za.onrender.com/inventory/empid?itemid=${itemid}`
            );

            if (!response.ok) {
                throw new Error(`Error fetching inventory data: ${response.statusText}`);
            }

            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                setFetchedItemData(data[0]); // Extract the first item if it's an array
            } else {
                throw new Error("Invalid data structure received from API.");
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const toggleModal = async () => {
        if (!modal) {
            await fetchItemData(itemid);
        } else {
            setInputValues({
                itemName: "",
                quantity: "",
                unitCost: ""
            });
        }
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
        const updatedData = {
            id: itemid,
            itemName: inputValues.itemName,
            quantity: inputValues.quantity,
            unitCost: inputValues.unitCost
        };

        if (!updatedData.itemName || updatedData.itemName.trim() === "") {
            setError("Item name cannot be empty.");
            return;
        }

        if (isNaN(updatedData.quantity) || updatedData.quantity <= 0) {
            setError("Quantity must be a positive number.");
            return;
        }

        if (isNaN(updatedData.unitCost) || updatedData.unitCost <= 0) {
            setError("Unit cost must be a positive number.");
            return;
        }

        try {
            const response = await fetch(`https://project-3-a7za.onrender.com/inventory/editapi`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            toggleModal();
            window.location.reload();
        } catch (error) {
            console.error("Error submitting inventory data:", error);
            setError(error.message || "An unexpected error occurred.");
        }
    };
    const handleDelete = async () => {
        const deleteData = {
            id: itemid
        };

        try {
            const response = await fetch(`https://project-3-a7za.onrender.com/inventory/deleteapi`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deleteData) // Send the deletion data
            });

            if (!response.ok) {
                let errorMessage = `Error: ${response.status} - ${response.statusText}`;
                throw new Error(errorMessage);
            }
    
            const text = await response.text(); // Get raw text
            const responseData = text ? JSON.parse(text) : null;
    
            // Clear errors and close modal on success
            setError(""); 
            toggleModal();
            window.location.reload(); // Reload the page to reflect the changes
        } catch (error) {
            console.error("Error deleting item:", error);
            setError(error.message || "An unexpected error occurred.");
        }
    };
    return (
        <>
            <button onClick={toggleModal} className="inventory-modal-btn-modal">
                <TranslateText>Edit</TranslateText>
            </button>

            {modal && fetchedItemData && (
                <div className="inventory-modal-modal">
                    <div className="inventory-modal-overlay"></div>
                    <div className="inventory-modal-content">
                        <button
                            className="inventory-modal-close-button"
                            onClick={toggleModal}
                        >
                            &#10060;
                        </button>
                        <h3 className="inventory-modal-title">
                            <TranslateText>Edit Inventory Item</TranslateText>
                        </h3>

                        {error && (
                            <div className="inventory-modal-error" style={{ color: "red", marginBottom: "10px" }}>
                                <TranslateText>{error}</TranslateText>
                            </div>
                        )}

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
                                step="1"
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
                        <button
                            className="inventory-modal-delete-button"
                            onClick={handleDelete}
                        >
                            <TranslateText>Delete</TranslateText>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
