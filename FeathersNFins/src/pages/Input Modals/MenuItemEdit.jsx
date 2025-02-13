import React, { useState, useEffect } from "react";
import "./MenuItemModal.css";
import TranslateText from "../../components/TranslateText";

export default function MenuItemEditModal({ menuid }) {
    const [modal, setModal] = useState(false);
    const [inputValues, setInputValues] = useState({
        input1: "",
        input2: "",
        input3: "",
        input4: "",
        input5: false  // This will be for the checkbox (isvegetarian)
    });
    const [fetchedmenuitem, setfetchedmenuitem] = useState(null);
    const [error, setError] = useState(""); // Add error state

    // Fetch menu item data when modal is opened
    useEffect(() => {
        if (modal && menuid) {
            fetchmenuitemdata(menuid);
        }
    }, [modal, menuid]);

    const fetchmenuitemdata = async (menuid) => {
        try {
            const response = await fetch(`https://project-3-a7za.onrender.com/menu/empid?menuid=${menuid}`);
            if (!response.ok) {
                throw new Error(`Error fetching menu item data: ${response.statusText}`);
            }
            const data = await response.json();

            // Assuming the data structure is flat and contains the necessary fields
            if (Array.isArray(data) && data.length > 0) {
                const menuItem = data[0]; // Access the first item if data is an array
                setfetchedmenuitem(menuItem);

                // Populate inputValues with the fetched data
                setInputValues({
                    input1: menuItem.name || "",
                    input2: menuItem.description || "",
                    input3: menuItem.price || "",
                    input4: menuItem.category || "",
                    input5: menuItem.isvegetarian || false
                });
            } else {
                throw new Error("Invalid data structure received from API.");
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const toggleModal = () => {
        if (!modal) {
            setInputValues({
                input1: "",
                input2: "",
                input3: "",
                input4: "",
                input5: false
            });
            setError(""); // Reset error when opening modal
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

    const handleCheckboxChange = (e) => {
        const { checked } = e.target;
        setInputValues({
            ...inputValues,
            input5: checked
        });
    };

    const handleSubmit = async () => {
        const updatedData = {
            id: menuid,
            name: inputValues.input1.trim(),
            description: inputValues.input2.trim(),
            price: parseFloat(inputValues.input3),
            category: inputValues.input4,
            isveg: inputValues.input5
        };

        // Input Validation
        if (!updatedData.name) {
            setError("Menu item name cannot be empty.");
            return;
        }
        if (!updatedData.description) {
            setError("Description cannot be empty.");
            return;
        }
        if (isNaN(updatedData.price) || updatedData.price <= 0) {
            setError("Price must be a positive number.");
            return;
        }
        if (!updatedData.category) {
            setError("Please select a category.");
            return;
        }

        try {
            const response = await fetch(`https://project-3-a7za.onrender.com/menu/editapi`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                let errorMessage = `Error: ${response.status} - ${response.statusText}`;
                throw new Error(errorMessage);
            }

            setError(""); // Clear error on success
            toggleModal(); // Close the modal on success
            window.location.reload(); // Reload the page to reflect the changes
        } catch (error) {
            console.error("Error submitting menu data:", error);
            setError(error.message || "An unexpected error occurred.");
        }
    };

    const handleDelete = async () => {
        const deleteData = { id: menuid };

        try {
            const response = await fetch(`https://project-3-a7za.onrender.com/menu/deleteapi`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(deleteData)
            });

            if (!response.ok) {
                let errorMessage = `Error: ${response.status} - ${response.statusText}`;
                throw new Error(errorMessage);
            }

            setError(""); // Clear error on success
            toggleModal();
            window.location.reload();
        } catch (error) {
            console.error("Error deleting menu item:", error);
            setError(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <>
            <button onClick={toggleModal} className="menu-item-modal-btn-modal">
                <TranslateText>Edit</TranslateText>
            </button>

            {modal && fetchedmenuitem && (
                <div className="menu-item-modal-modal">
                    <div className="menu-item-modal-overlay"></div>
                    <div className="menu-item-modal-content">
                        <button className="menu-item-modal-close-button" onClick={toggleModal}>
                            &#10060;
                        </button>
                        <h3 className="menu-item-modal-title">Edit Menu Item</h3>

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
                                type="text"
                                name="input3"
                                value={inputValues.input3}
                                onChange={handleChange}
                                placeholder="Enter price here"
                                className="menu-item-modal-input-price"
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
                        <label className="menu-item-modal-checkbox-label">
                            <TranslateText>Is Vegetarian:</TranslateText>
                            <input
                                type="checkbox"
                                checked={inputValues.input5}
                                onChange={handleCheckboxChange}
                                className="menu-item-modal-input-checkbox"
                            />
                        </label>

                        <button className="menu-item-modal-submit-button" onClick={handleSubmit}>
                            <TranslateText>Submit</TranslateText>
                        </button>
                        <button className="menu-item-modal-delete-button" onClick={handleDelete}>
                            <TranslateText>Delete</TranslateText>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
