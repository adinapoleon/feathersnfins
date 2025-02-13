import React, { useState, useEffect } from 'react';
import './CashierPage.css';
import Header from '../Header';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import LanguageSelector from '../../components/LanguageSelector';
import TranslateText from '../../components/TranslateText';




  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [modificationModalOpen, setModificationModalOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);
  const [modifications, setModifications] = useState([]);
  const [highlightedButtons, setHighlightedButtons] = useState({});
  const [orderType, setOrderType] = useState(1); // Initialize with Drive Thru (1)

  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // so customer cant spam the Pay button and place the same order multiple times
  const { isAuthenticated, user } = useAuth();

  const [isAccessibilityPopupVisible, setIsAccessibilityPopupVisible] = useState(false);
  const [fontSize, setFontSize] = useState(16); // Base font size

  // Add translation hook
  const { translate } = useTranslation();
  const [placeholders, setPlaceholders] = useState({
    customerName: 'Customer Name',
    customerPhone: 'Customer Phone (e.g. 123-456-7890)'
  });

  /**
 * Increases the font size, capping it at 32px.
 */
const handleFontIncrease = () => {
  setFontSize((prevSize) => Math.min(prevSize + 2, 32));
};

/**
 * Decreases the font size, capping it at 10px.
 */
const handleFontDecrease = () => {
  setFontSize((prevSize) => Math.max(prevSize - 2, 10));
};

/**
 * Translates placeholder text for customer name and phone based on the current language.
 * Runs when the `translate` function changes.
 */
useEffect(() => {
  const translatePlaceholders = async () => {
    const translatedPlaceholders = {
      customerName: await translate('Customer Name'),
      customerPhone: await translate('Customer Phone (e.g. 123-456-7890)')
    };
    setPlaceholders(translatedPlaceholders);
  };

  translatePlaceholders();
}, [translate]);

/**
 * Logs the current authentication state when `isAuthenticated` or `user` changes.
 */
useEffect(() => {
  console.log('Auth State:', { isAuthenticated, user });
}, [isAuthenticated, user]);

/**
 * Fetches menu data from the server and updates state.
 * Populates the `menu`, `categories`, and `selectedCategory` states.
 * Runs once on component mount.
 */
useEffect(() => {
  fetch('https://project-3-a7za.onrender.com/menu')
    .then((response) => response.json())
    .then((data) => {
      setMenu(data);
      const uniqueCategories = [...new Set(data.map((item) => item.category))];
      setCategories(uniqueCategories);
      setSelectedCategory(uniqueCategories[0] || '');
    })
    .catch((error) => console.error('Error fetching menu items:', error));
}, []);

/**
 * Updates the `orderType` state based on user input.
 * 
 * @param {Object} event - The event triggered by changing the order type.
 */
const handleOrderTypeChange = (event) => {
  setOrderType(parseInt(event.target.value));
};

/**
 * Adds an item to the cart with no modifications.
 * 
 * @param {Object} item - The item to be added to the cart.
 */
const addToCart = (item) => {
  setCart([...cart, { ...item, modifications: [] }]);
};

/**
 * Removes an item from the cart by its index.
 * 
 * @param {number} index - The index of the item to remove.
 */
const removeFromCart = (index) => {
  const newCart = cart.filter((_, i) => i !== index);
  setCart(newCart);
};

/**
 * Opens the modification modal for the specified cart item index.
 * 
 * @param {number} index - The index of the item to modify.
 */
const openModificationModal = (index) => {
  setCurrentItemIndex(index);
  setModificationModalOpen(true);
  setModifications([]);
  setHighlightedButtons({});
};

/**
 * Handles ingredient modifications by toggling their state and updating modifications.
 * 
 * @param {string} ingredient - The ingredient to modify.
 * @param {string} action - The action to perform (e.g., "add", "remove").
 */
const handleIngredientAction = (ingredient, action) => {
  const actionKey = `${action} ${ingredient}`;
  const updatedButtons = {
    ...highlightedButtons,
    [actionKey]: !highlightedButtons[actionKey],
  };
  setHighlightedButtons(updatedButtons);

  if (updatedButtons[actionKey]) {
    setModifications((prev) => [...prev, actionKey]);
  } else {
    setModifications((prev) => prev.filter((mod) => mod !== actionKey));
  }
};

/**
 * Finalizes modifications for the current cart item and resets modal state.
 */
const finalizeModifications = () => {
  if (currentItemIndex !== null) {
    const updatedCart = [...cart];
    updatedCart[currentItemIndex].modifications = modifications.join(', ');
    setCart(updatedCart);
    setModifications([]);
    setCurrentItemIndex(null);
  }
  setModificationModalOpen(false);
  setHighlightedButtons({});
};

/**
 * Renders category buttons for filtering menu items.
 * 
 * @returns {JSX.Element[]} A list of category button elements.
 */
const renderCategoryButtons = () => {
  return categories.map((category) => (
    <button className='category-button'
      key={category}
      onClick={() => setSelectedCategory(category)}
    >
      <TranslateText>{category}</TranslateText>
    </button>
  ));
};

/**
 * Renders menu items filtered by the selected category.
 * 
 * @returns {JSX.Element[]} A list of menu item elements.
 */
const renderMenuItems = () => {
  const filteredItems = menu.filter((item) => item.category === selectedCategory);
  return filteredItems.map((item) => (
    <div className='cart-div'
      key={item.name}
      onClick={() => addToCart(item)}
    >
      <h3 style={{ fontSize: '1.2em' }}><TranslateText>{item.name}</TranslateText></h3>
      <p style={{ fontSize: '1em' }}>${item.price.toFixed(2)}</p>
    </div>
  ));
};

  /**
   * Renders the cart items as a list of styled elements.
   * Each item includes name, price, modifications, and buttons for deleting or modifying the item.
   * @returns {JSX.Element[]} An array of JSX elements representing the cart items.
   */
  const renderCart = () => {
    return cart.map((item, index) => (
      <div key={index} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '5px', borderRadius: '4px' }}>
        <div style={{ fontWeight: 'bold' }}><TranslateText>{item.name}</TranslateText></div>
        <div style={{ color: '#666' }}>${item.price.toFixed(2)}</div>
        <div style={{ fontStyle: 'italic' }}><TranslateText>{item.modifications}</TranslateText></div>
        <div style={{ display: 'flex' }}>
          <button className='cart-delete'
            onClick={() => removeFromCart(index)}
          >
            <TranslateText>Delete</TranslateText>
          </button>
          <button className='cart-modify'
            onClick={() => openModificationModal(index)}
          >
            <TranslateText>Modify</TranslateText>
          </button>
        </div>
      </div>
    ));
  };
  /**
   * Calculates the total price of items in the cart.
   * @returns {string} The total price of the cart items formatted to two decimal places.
   */
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0).toFixed(2);
  };

  /**
   * Handles the payment process, including customer verification or insertion,
   * order and order items creation, and inventory updates.
   * Alerts the user in case of errors or success and resets the cart upon successful payment.
   * @async
   */
  const handlePayment = async () => {
    if (isProcessingPayment) {
      alert(await translate("Payment is already being processed. Please wait."));
      return;
    }

    setIsProcessingPayment(true); // Start processing payment

    const trimmedCustomerName = customerName.trim();
    const trimmedPhoneNumber = customerPhone.trim();
  
    if (!trimmedCustomerName || !trimmedPhoneNumber || trimmedPhoneNumber.length !== 12) {
      alert(await translate("Please enter a valid customer name and phone number (format: 123-456-7890)."));
      setIsProcessingPayment(false);
      return;
    }
  
    
    try {
      /* CUSTOMER INSERTION BLOCK BEGIN*/
      // Check if customer exists by phone number
      const response = await fetch(`https://project-3-a7za.onrender.com/customers?phonenumber=${trimmedPhoneNumber}`);
      const customerData = await response.json();
  
      let customer;
  
      if (response.status === 404) { // Checking if customer was not found
        //alert("New customer!");
  
        // Insert new customer if not exists
        const newCustomerResponse = await fetch('https://project-3-a7za.onrender.com/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: trimmedCustomerName, phonenumber: trimmedPhoneNumber }),
        });
  
        const newCustomerData = await newCustomerResponse.json();
        
        if (newCustomerResponse.ok) {
          customer = newCustomerData; // If insertion is successful
          //alert(`New customer added: ${customer.customerid}`);
        } else {
          alert(await translate("Failed to add new customer: ") + newCustomerData.error);
          setIsProcessingPayment(true);
          return; 
        }
      } else {
        //alert(`Customer already exists: ${customerData.customerid}`);
        customer = customerData; // If found, use the existing customer object
      }
      /* CUSTOMER INSERTION BLOCK END */

      /* ORDER INSERTION BLOCK BEGIN */
      /*
       need to collect these items to have a complete insert statement into orders
       - customerid (we can just use customer.customerid)
       - employeeid (lets just use the number 1 for now, because we need to do employee logins for this and that is later)
       - current date (formatted like 2024-10-27)
       - current time (formatted like 16:11:57)
       - cart total (we can call our calculateTotal() function, which may need to be converted into a double)
      */
      let custID = customer.customerid;
      //let employeeid = 1; //temporary value
      let currUser = user.username;
      console.log(currUser);
      const empResponse = await fetch(`https://project-3-a7za.onrender.com/employeeid/${encodeURIComponent(currUser)}`); //http://localhost:3001
      const fetchedEmpID = await empResponse.json(); 
      let empID;
      if (fetchedEmpID.employeeid !== undefined) {
        empID = fetchedEmpID.employeeid; 
        //console.log(empID); 
      } else {
        console.error('Employee ID not found or an error occurred');
      }

      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`; // YYYY-MM-DD
      const formattedTime = currentDate.toTimeString().split(' ')[0]; // HH:MM:SS
      const cartTotal = parseFloat(calculateTotal());
      const orderResponse = await fetch('https://project-3-a7za.onrender.com/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerid: custID, employeeid: empID, orderdate: formattedDate, ordertime: formattedTime, total: cartTotal, ordertype: orderType }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        alert(await translate("Failed to add order: ") + orderData.error);
        setIsProcessingPayment(true);
        return;
      }

      const orderid = orderData.orderid;
      console.log("Order inserted:", { orderid, custID, empID, formattedDate, formattedTime, cartTotal });


      /* ORDER INSERTION BLOCK END */

      /* ORDER ITEMS INSERTION BLOCK BEGIN */
      const orderItems = [];
      const itemMap = {};

      cart.forEach(item => {
        const key = item.name + (item.modifications || ''); // Unique key based on name and modifications
        if (itemMap[key]) {
          itemMap[key].quantity += 1;
        } else {
          itemMap[key] = {
            orderid,  // Use the order ID from the previous order insertion
            menuitemid: item.menuitemid,  // Ensure menuitemid is included from each cart item
            modifications: item.modifications || '',
            price: item.price,
            quantity: 1
          };
        }
      });

      Object.values(itemMap).forEach(orderItem => {
        orderItems.push(orderItem);
      });

      for (const orderItem of orderItems) {
        const orderItemResponse = await fetch('https://project-3-a7za.onrender.com/orderitems', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderItem),
        });

        if (!orderItemResponse.ok) {
          const orderItemData = await orderItemResponse.json();
          alert(await translate("Failed to add order item: ") + orderItemData.error);
          setIsProcessingPayment(true);
          return;
        }
      }

      console.log("Order items inserted:", orderItems);
      /* ORDER ITEMS INSERTION BLOCK END */

      /* INVENTORY UPDATE BLOCK BEGIN */
      try {
        for (const orderItem of orderItems) {
          const inventoryResponse = await fetch(`https://project-3-a7za.onrender.com/menuitem_inventory?menuitemid=${orderItem.menuitemid}`);
          const inventoryData = await inventoryResponse.json();

          // Assuming inventoryData is an array of objects containing inventoryid and quantity_needed
          if (inventoryResponse.ok && inventoryData.length > 0) {
            for (const inventory of inventoryData) {
              const quantityNeeded = inventory.quantity_needed;
              const inventoryid = inventory.inventoryid;

              // Calculate the total quantity to decrement
              const totalToDecrement = quantityNeeded * orderItem.quantity;

              // Update the inventory table
              const updateResponse = await fetch(`https://project-3-a7za.onrender.com/inventory/${inventoryid}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: -totalToDecrement }), // Decrementing the quantity
              });

              if (!updateResponse.ok) {
                const updateData = await updateResponse.json();
                alert(await translate("Failed to update inventory: ") + updateData.error);
                setIsProcessingPayment(true);
                return;
              }
            }
          } else {
            alert(await translate("No inventory found for menu item: ") + orderItem.menuitemid);
            setIsProcessingPayment(true);
            return;
          }
        }
        console.log("Inventory updated successfully for order items:", orderItems);
      } catch (error) {
        console.error("Error updating inventory:", error);
        alert(await translate("An error occurred while updating inventory."));
      }
      /* INVENTORY UPDATE BLOCK END */
  
      alert(await translate("Payment confirmed! Cart will now reset."));
      resetCart();

      // Reset the processing flag after cart reset
      setIsProcessingPayment(false);
  
    } catch (error) {
      console.error("Error processing payment:", error);
      alert(await translate("An error occurred during payment processing."));
    } finally {
      setIsProcessingPayment(false); // Always reset processing state at the end incase of error
    }
  };
  
  /**
   * Resets the shopping cart and clears customer information.
   * - Clears the customer name input.
   * - Clears the customer phone number input.
   * - Empties the shopping cart array.
   */
  const resetCart = () => {
    setCustomerName(""); // Clear customer name input
    setCustomerPhone(""); // Clear phone number input
    setCart([]);
  };

  


export default CashierPage;
