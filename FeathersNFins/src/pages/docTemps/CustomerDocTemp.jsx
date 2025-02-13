import React, { useState, useEffect, useRef } from 'react';
import './CustomerPage.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import TranslateText from '../components/TranslateText';
import { useTranslation } from '../context/TranslationContext';

// Chicken images
import chicken1 from '../assets/image/chicken/chicken_2pc.jpg';
import chicken2 from '../assets/image/chicken/chicken_3pc.jpg';
import chicken3 from '../assets/image/chicken/chicken_5pc.png';
import chicken4 from '../assets/image/chicken/grilled_chicken_salad.jpg';
import chicken5 from '../assets/image/chicken/chicken_sandwich.jpg';
import chicken6 from '../assets/image/chicken/chicken_nuggets.jpg';

// Fish images
import fish1 from '../assets/image/fish/fish_fillet.jpg';
import fish2 from '../assets/image/fish/fish_chips.jpg';
import fish3 from '../assets/image/fish/fish_sandwich.jpg';
import fish4 from '../assets/image/fish/fish_tacos.jpg';

// Sides images
import sides1 from '../assets/image/sides/coleslaw.jpg';
import sides2 from '../assets/image/sides/mac_cheese.jpg';
import sides3 from '../assets/image/sides/onion_rings.jpg';
import sides4 from '../assets/image/sides/corn_on_cob.jpg';
import sides5 from '../assets/image/sides/tater_tots.jpg';

// Special image
import specialimg from '../assets/image/special.png';

// Drinks images
import drinks1 from '../assets/image/drinks/sweat_tea.jpg';
import drinks2 from '../assets/image/drinks/chocolate_shake.jpg';
import drinks3 from '../assets/image/drinks/lemonade.jpg';
import drinks4 from '../assets/image/drinks/iced_coffee.jpg';
import drinks5 from '../assets/image/drinks/water.jpg';

// Default image
import defaultimg from '../assets/image/default_image.jpg';



  const [menuItems, setMenuItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('Chicken');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCartItem, setSelectedCartItem] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const addressInputRef = useRef(null);
  const { isAuthenticated, user } = useAuth();
  const [modificationModalOpen, setModificationModalOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);
  const [modifications, setModifications] = useState([]);
  const [highlightedButtons, setHighlightedButtons] = useState({});
  const [showDrinkModal, setShowDrinkModal] = useState(false);
  const [currentComboItemIndex, setCurrentComboItemIndex] = useState(null);
  // Add new accessibility states
  const [showAccessibilityOptions, setShowAccessibilityOptions] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrastMode, setHighContrastMode] = useState(false);

  const { translate } = useTranslation();

  // Add state for placeholders
  const [placeholders, setPlaceholders] = useState({
    customerName: 'Customer Name',
    customerPhone: 'Phone Number (e.g. 123-456-7890)',
    address: 'Delivery Address',
    search: 'Search'
  });

  // Add useEffect to translate placeholders
useEffect(() => {
    /**
     * Translates placeholder texts and sets them in the component state.
     * This ensures that the form fields have localized placeholder values.
     * 
     * @async
     * @function translatePlaceholders
     * @returns {void}
     */
    const translatePlaceholders = async () => {
      const translatedPlaceholders = {
        customerName: await translate('Customer Name'),
        customerPhone: await translate('Phone Number (e.g. 123-456-7890)'),
        address: await translate('Delivery Address'),
        search: await translate('Search')
      };
      setPlaceholders(translatedPlaceholders);
    };
  
    translatePlaceholders();
  }, [translate]);
  
  // Add this useEffect hook with other useEffect declarations
  useEffect(() => {
    /**
     * Toggles the 'high-contrast' class on the document body based on the value of highContrastMode.
     * This is used to enable or disable high contrast mode for better accessibility.
     * 
     * @function
     * @returns {void}
     */
    if (highContrastMode) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrastMode]);
  
  // Auth state logging
  useEffect(() => {
    /**
     * Logs the authentication state whenever the authentication status or user information changes.
     * This is useful for debugging or monitoring authentication state in the component.
     * 
     * @function
     * @returns {void}
     */
    console.log('Auth State:', { isAuthenticated, user });
  }, [isAuthenticated, user]);
  
  // Google Maps initialization  
  useEffect(() => {
    /**
     * Initializes the Google Maps Places Autocomplete API for address input.
     * This sets up the address input field to auto-complete addresses using the Google Maps API.
     * 
     * @function
     * @returns {void}
     */
    const initializeAutocomplete = () => {
      if (!window.google || !addressInputRef.current) {
        console.log('Google Maps not initialized or ref not ready');
        return;
      }
  
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: 'us' },
        types: ['address']
      });
  
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setCustomerInfo(prev => ({
            ...prev,
            address: place.formatted_address
          }));
        }
      });
    };
  
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBDUHUq6zY0nqwC8c6-zF92qXJocH0t59E&libraries=places`;
      script.async = true;
      script.onload = () => {
        console.log('Google Maps loaded');
        initializeAutocomplete();
      };
      document.head.appendChild(script);
    } else {
      initializeAutocomplete();
    }
  }, []);
  
  
  // Fetch menu items from the backend API
  useEffect(() => {
    /**
     * Fetches menu items from the backend API and sets them in the component state.
     * This retrieves the menu items for display in the UI.
     * 
     * @function
     * @returns {void}
     */
    console.log('Fetching menu items...');
    fetch('https://project-3-a7za.onrender.com/menu')
      .then(response => {
        console.log('Menu response received:', response);
        return response.json();
      })
      .then(data => {
        console.log('Menu items with IDs:', data.map(item => ({
          id: item.menuitemid,
          name: item.name,
          category: item.category
        })));
        setMenuItems(data);
      })
      .catch(error => {
        console.error('Error fetching menu items:', error);
      });
  }, []);
  
  /**
   * Handles the change of the phone number input field.
   * The phone number is formatted as the user types, ensuring that it is in the correct format.
   * 
   * @function handlePhoneChange
   * @param {Object} e - The event object from the input change.
   * @param {string} e.target.value - The current value of the phone number input.
   * @returns {void}
   */
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      if (value.length > 6) {
        value = `${value.slice(0,3)}-${value.slice(3,6)}-${value.slice(6)}`;
      } else if (value.length > 3) {
        value = `${value.slice(0,3)}-${value.slice(3)}`;
      }
      setCustomerInfo(prev => ({ ...prev, phone: value }));
    }
  };
  
  /**
     * Handles the process of placing an order, including validation of customer information, 
     * checking if the customer exists, creating or updating the customer record, 
     * submitting the order and its items, and updating inventory accordingly.
     * 
     * The function ensures that all combo meals have a drink choice, 
     * validates the customer's name and phone number, 
     * and manages the interaction with the backend API to store and update relevant data.
     * 
     * Additionally, the function handles potential errors, provides appropriate alerts, 
     * and ensures that the UI reflects the current state (e.g., processing state, success, or failure).
     */
  const handlePlaceOrder = async () => {
    if (isProcessingOrder) {
      alert(await translate("Order is already being processed. Please wait."));
      return;
    }
  
    // First validate that all combo meals have a drink choice
    const pendingCombos = orderItems.filter(item => item.isCombo && !item.drinkChoice);
    if (pendingCombos.length > 0) {
      alert(await translate("Please select drinks for all combo meals before proceeding."));
      return;
    }
  
    setIsProcessingOrder(true);
  
    const trimmedName = customerInfo.name.trim();
    const trimmedPhone = customerInfo.phone.trim();
    const trimmedAddress = customerInfo.address ? customerInfo.address.trim() : '';
  
    if (!trimmedName || !trimmedPhone || trimmedPhone.length !== 12) {
      setIsProcessingOrder(false);
      alert(await translate("Please enter a valid customer name and phone number (format: 123-456-7890)."));
      return;
    }
  
    try {
      // Check if customer exists
      const response = await fetch(`https://project-3-a7za.onrender.com/customers?phonenumber=${trimmedPhone}`);
      const customerData = await response.json();
  
      let customer;
  
      if (response.status === 404) {
        const customerPayload = {
          name: trimmedName,
          phonenumber: trimmedPhone,
          ...(trimmedAddress && { address: trimmedAddress }),
        };
  
        const customerEndpoint = trimmedAddress
          ? 'https://project-3-a7za.onrender.com/customers_with_address'
          : 'https://project-3-a7za.onrender.com/customers';
  
        const newCustomerResponse = await fetch(customerEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerPayload),
        });
  
        if (!newCustomerResponse.ok) {
          const newCustomerData = await newCustomerResponse.json();
          setIsProcessingOrder(false);
          alert("Failed to add new customer: " + newCustomerData.error);
          return;
        }
  
        customer = await newCustomerResponse.json();
      } else {
        customer = customerData;
  
        if (!customer.address && trimmedAddress) {
          // Update the customer record with the new address
          const updateResponse = await fetch(`https://project-3-a7za.onrender.com/customers/${customer.customerid}/address`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: trimmedAddress }),
          });
  
          if (!updateResponse.ok) {
            const updateData = await updateResponse.json();
            setIsProcessingOrder(false);
            alert("Failed to update customer address: " + updateData.error);
            return;
          }
  
          customer.address = trimmedAddress;
        }
      }
  
      // Create order
      const currentDate = new Date();
      /*
      let currUser = user.username;
      const empResponse = await fetch(`https://project-3-a7za.onrender.com/employeeid/${encodeURIComponent(currUser)}`);
      const fetchedEmpID = await empResponse.json(); 
      let empID;
      if (response.ok && fetchedEmpID.employeeid !== undefined) {
        empID = fetchedEmpID.employeeid; 
        //console.log(empID); 
      } else {
        console.error('Employee ID not found or an error occurred');
      }
        */

      const orderResponse = await fetch('https://project-3-a7za.onrender.com/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerid: customer.customerid,
          employeeid: 1,
          orderdate: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`,
          ordertime: currentDate.toTimeString().split(' ')[0],
          total: orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          ordertype: 2
        }),
      });
  
      const orderData = await orderResponse.json();
  
      // Insert order items with proper handling of combo meals
      for (const item of orderItems) {
        // Insert the main item
        await fetch('https://project-3-a7za.onrender.com/orderitems', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderid: orderData.orderid,
            menuitemid: item.menuitemid,
            modifications: item.modifications || '',
            price: item.price,
            quantity: item.quantity
          }),
        });
  
        // If it's a combo meal and has a drink choice (not "No Drink"), add the drink
        if (item.isCombo && item.drinkChoice && item.drinkChoice.menuitemid) {
          await fetch('https://project-3-a7za.onrender.com/orderitems', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderid: orderData.orderid,
              menuitemid: item.drinkChoice.menuitemid,
              modifications: '',
              price: 0, // Free drink with combo
              quantity: item.quantity
            }),
          });
        }
      }
  
      // Update inventory
      try {
        for (const orderItem of orderItems) {
          // Get inventory requirements for the main item
          const inventoryResponse = await fetch(`https://project-3-a7za.onrender.com/menuitem_inventory?menuitemid=${orderItem.menuitemid}`);
          const inventoryData = await inventoryResponse.json();
  
          if (inventoryResponse.ok && inventoryData.length > 0) {
            for (const inventory of inventoryData) {
              const quantityNeeded = inventory.quantity_needed;
              const inventoryid = inventory.inventoryid;
              const totalToDecrement = quantityNeeded * orderItem.quantity;
  
              const updateResponse = await fetch(`https://project-3-a7za.onrender.com/inventory/${inventoryid}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: -totalToDecrement }),
              });
  
              if (!updateResponse.ok) {
                const updateData = await updateResponse.json();
                setIsProcessingOrder(false);
                alert("Failed to update inventory: " + updateData.error);
                return;
              }
            }
          }
  
          // If it's a combo with a drink, update inventory for the drink as well
          if (orderItem.isCombo && orderItem.drinkChoice && orderItem.drinkChoice.menuitemid) {
            const drinkInventoryResponse = await fetch(`https://project-3-a7za.onrender.com/menuitem_inventory?menuitemid=${orderItem.drinkChoice.menuitemid}`);
            const drinkInventoryData = await drinkInventoryResponse.json();
  
            if (drinkInventoryResponse.ok && drinkInventoryData.length > 0) {
              for (const inventory of drinkInventoryData) {
                const quantityNeeded = inventory.quantity_needed;
                const inventoryid = inventory.inventoryid;
                const totalToDecrement = quantityNeeded * orderItem.quantity;
  
                const updateResponse = await fetch(`https://project-3-a7za.onrender.com/inventory/${inventoryid}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ quantity: -totalToDecrement }),
                });
  
                if (!updateResponse.ok) {
                  const updateData = await updateResponse.json();
                  setIsProcessingOrder(false);
                  alert("Failed to update inventory: " + updateData.error);
                  return;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error updating inventory:", error);
        setIsProcessingOrder(false);
        alert("An error occurred while updating inventory.");
        return;
      }
  
      // Show success message and reset
      setShowReviewModal(false);
      setShowThankYouModal(true);
      setIsProcessingOrder(false);
  
    } catch (error) {
      console.error("Error processing order:", error);
      setIsProcessingOrder(false);
      alert("An error occurred while processing the order.");
    }
  };

  /**
 * Handles the review click event by checking if customer information and order items are valid.
 * If valid, it opens the review modal, otherwise it displays an alert.
 */
const handleReviewClick = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert("Please fill in all customer information before reviewing order.");
      return;
    }
    if (orderItems.length === 0) {
      alert("Please add items to your order before reviewing.");
      return;
    }
    setShowReviewModal(true);
  };
  
  /**
   * Filters the menu items by category and search term.
   * If a search term is provided, it filters the items by category and name.
   * @param {string} category - The category of the items to filter (e.g., 'Chicken', 'Drink').
   * @returns {Array} The filtered list of menu items that match the category and search term.
   */
  const getItemsByCategory = (category) => {
    if (searchTerm) {
      return menuItems.filter(item => 
        item.category === category &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return menuItems.filter(item => item.category === category);
  };
  
  /**
   * Determines whether the item belongs to the 'Chicken' or 'Fish' category.
   * @param {string} category - The category of the item.
   * @returns {boolean} True if the item is a combo meal (either 'Chicken' or 'Fish'), otherwise false.
   */
  const isComboMeal = (category) => {
    return category === 'Chicken' || category === 'Fish';
  };
  
  /**
   * Handles the item selection event by adding the item to the order list.
   * If the item is a combo meal, it triggers the drink selection modal. 
   * Otherwise, it adds the item to the order without requiring a drink selection.
   * @param {Object} item - The selected menu item to add to the order.
   */
  const handleChooseItem = (item) => {
    if (isComboMeal(item.category)) {
      // Add item to cart with pending status
      const newItemIndex = orderItems.length;
      setOrderItems(prevItems => [
        ...prevItems,
        { ...item, quantity: 1, isCombo: true, drinkChoice: null, isPending: true } // Add isPending flag
      ]);
      // Show drink selection modal
      setCurrentComboItemIndex(newItemIndex);
      setShowDrinkModal(true);
    } else if (item.category === 'Drink') {
      // Check if this drink is being added as a combo drink
      if (currentComboItemIndex !== null) {
        handleDrinkSelection(item);
      } else {
        // Regular drink addition
        setOrderItems(prevItems => {
          const existingItem = prevItems.find(i => i.menuitemid === item.menuitemid);
          if (existingItem) {
            return prevItems.map(i => 
              i.menuitemid === item.menuitemid 
                ? { ...i, quantity: i.quantity + 1 }
                : i
            );
          }
          return [...prevItems, { ...item, quantity: 1 }];
        });
      }
    } else {
      // Regular item addition
      setOrderItems(prevItems => {
        const existingItem = prevItems.find(i => i.menuitemid === item.menuitemid);
        if (existingItem) {
          return prevItems.map(i => 
            i.menuitemid === item.menuitemid 
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [...prevItems, { ...item, quantity: 1 }];
      });
    }
  };
  
  /**
   * Toggles the visibility of the accessibility options modal.
   */
  const toggleAccessibilityOptions = () => {
    setShowAccessibilityOptions(prevState => !prevState);
  };
  
  /**
   * Increases the font size for better readability, with a maximum font size of 26.
   */
  const handleFontIncrease = () => {
    setFontSize(prevSize => Math.min(prevSize + 2, 26));
  };
  
  /**
   * Decreases the font size for better readability, with a minimum font size of 10.
   */
  const handleFontDecrease = () => {
    setFontSize(prevSize => Math.max(prevSize - 2, 10));
  };
  
  /**
   * Toggles the high contrast mode for better visibility, adjusting the UI's contrast.
   */
  const toggleHighContrastMode = () => {
    setHighContrastMode(prevMode => !prevMode);
  };
  
  /**
   * Handles the selection of a drink for a combo meal.
   * If no drink is selected, it sets the drink choice to 'No Drink'.
   * @param {Object|null} drinkItem - The selected drink item. If null, it sets the drink to 'No Drink'.
   */
  const handleDrinkSelection = (drinkItem = null) => {
    if (currentComboItemIndex !== null) {
      setOrderItems(prevItems => {
        const updatedItems = [...prevItems];
        updatedItems[currentComboItemIndex] = {
          ...updatedItems[currentComboItemIndex],
          drinkChoice: drinkItem ? {
            name: drinkItem.name,
            menuitemid: drinkItem.menuitemid
          } : {
            name: 'No Drink',
            menuitemid: null
          },
          isPending: false
        };
        return updatedItems;
      });
      setShowDrinkModal(false);
      setCurrentComboItemIndex(null);
    }
  };
  
  /**
   * Cancels the drink selection for a combo meal and removes the pending combo item from the cart.
   */
  const handleDrinkSelectionCancel = () => {
    // Remove the pending combo item from the cart
    if (currentComboItemIndex !== null) {
      setOrderItems(prevItems => prevItems.filter((_, index) => index !== currentComboItemIndex));
    }
    setShowDrinkModal(false);
    setCurrentComboItemIndex(null);
  };
  
  /**
   * Removes an item from the order by its index.
   * @param {number} index - The index of the item to be removed from the order.
   */
  const removeItem = (index) => {
    setOrderItems(prevItems => prevItems.filter((_, i) => i !== index));
    setSelectedCartItem(null);
  };
  

  /**
 * Mapping between menuitemid and their respective images.
 * @type {Object<number, string>}
 * @property {string} 1 - 2 Piece Chicken Meal image
 * @property {string} 2 - 3 Piece Chicken Meal image
 * @property {string} 3 - 5 Piece Chicken Meal image
 * @property {string} 4 - Grilled Chicken Salad image
 * @property {string} 5 - Chicken Sandwich image
 * @property {string} 6 - Chicken Nuggets image
 * @property {string} 7 - Fish Fillet image
 * @property {string} 8 - Fish & Chips image
 * @property {string} 9 - Fish Sandwich image
 * @property {string} 10 - Fish Tacos image
 * @property {string} 11 - Special item image
 * @property {string} 12 - Coleslaw image
 * @property {string} 13 - Mac & Cheese image
 * @property {string} 14 - Onion Rings image
 * @property {string} 15 - Corn on Cob image
 * @property {string} 16 - Tater Tots image
 * @property {string} 17 - Sweet Tea image
 * @property {string} 18 - Chocolate Shake image
 * @property {string} 19 - Lemonade image
 * @property {string} 20 - Iced Coffee image
 * @property {string} 31 - Water image
 */
const menuItemImages = {
    1: chicken1,
    2: chicken2,
    3: chicken3,
    4: chicken4,
    5: chicken5,
    6: chicken6,
    7: fish1,
    8: fish2,
    9: fish3,
    10: fish4,
    11: specialimg,
    12: sides1,
    13: sides2,
    14: sides3,
    15: sides4,
    16: sides5,
    17: drinks1,
    18: drinks2,
    19: drinks3,
    20: drinks4,
    31: drinks5,
  };
  
  /**
   * Renders a menu item with image, name, price, and an option to add to cart.
   * @param {Object} props - Component props
   * @param {Object} props.item - The item data to display
   * @param {Function} props.onChoose - Function to call when the item is selected
   * @returns {JSX.Element} The rendered MenuItem component
   */
  const MenuItem = ({ item, onChoose }) => {
    const imageSrc = menuItemImages[item.menuitemid];
    const isCombo = isComboMeal(item.category);
  
    return (
      <div className={`item-card ${highContrastMode ? 'high-contrast' : ''}`} style={{ fontSize: `${fontSize}px` }}>
        <div className="image-container">
          <img 
            src={imageSrc || defaultimg}
            alt={item.name} 
            className="item-image"
            onError={(e) => {
              e.target.src = defaultimg;
              e.target.onerror = null;
            }}
          />
        </div>
        <div className="item-content">
          <div className="item-name"><TranslateText>{item.name}</TranslateText></div>
          {isCombo && (
            <div className="combo-info"><TranslateText>Comes with Fries and Drink</TranslateText></div>
          )}
          <div className="item-bottom">
            <div className="item-price">${item.price.toFixed(2)}</div>
            <button onClick={() => onChoose(item)} className="cart-button">
              <i className="bi bi-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  /**
   * Modal component to review the order before placing it.
   * Displays customer details, ordered items, and total.
   * @returns {JSX.Element | null} The rendered ReviewModal component or null if not shown
   */
  const ReviewModal = () => {
    if (!showReviewModal) return null;
  
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
    const renderOrderItem = (item) => (
      <div className="order-item">
        <div className="order-item-main">
          <span>{item.name} x {item.quantity}</span>
          <span>${(item.price * item.quantity).toFixed(2)}</span>
        </div>
        {item.isCombo && (
          <div className="order-item-details">
            <div className="combo-item">+ Fries</div>
            <div className="combo-item">
              <TranslateText>
              {item.drinkChoice ? 
                (item.drinkChoice.name === 'No Drink' ? 
                  '- No Drink Selected' : 
                  `+ ${item.drinkChoice.name}`
                ) : 
                '(Drink not selected)'
              }
              </TranslateText>
            </div>
            {item.modifications && (
              <div className="combo-item modifications">
                Modifications: {item.modifications}
              </div>
            )}
          </div>
        )}
        {!item.isCombo && item.modifications && (
          <div className="order-item-details">
            <div className="modifications">
              <TranslateText>Modifications: {item.modifications}</TranslateText>
            </div>
          </div>
        )}
      </div>
    );
  
    return (
      <div className="review-modal-overlay">
        <div className="review-modal">
          <div className="review-modal-header">
            <button 
              className="back-button" 
              onClick={() => setShowReviewModal(false)}
              disabled={isProcessingOrder}
            >
              <TranslateText>Back</TranslateText>
            </button>
            <h2><TranslateText>Information for review</TranslateText></h2>
          </div>
  
          <div className="review-modal-content">
            <div className="customer-details">
              <p><strong><TranslateText>Customer Name:</TranslateText> </strong>{customerInfo.name}</p>
              <p><strong><TranslateText>Phone Number:</TranslateText> </strong>{customerInfo.phone}</p>
              <p><strong><TranslateText>Delivery Address:</TranslateText> </strong>{customerInfo.address}</p>
            </div>
  
            <div className="order-details">
              <h3><TranslateText>Order Details</TranslateText></h3>
              {orderItems.map((item, index) => (
                <React.Fragment key={index}>
                  {renderOrderItem(item)}
                </React.Fragment>
              ))}
              <div className="order-total">
                <strong><TranslateText>Total:</TranslateText> ${total.toFixed(2)}</strong>
              </div>
            </div>
          </div>
  
          <div className="review-modal-actions">
            <button 
              className="place-order-button" 
              onClick={handlePlaceOrder}
              disabled={isProcessingOrder}
            >
              <TranslateText>{isProcessingOrder ? 'Processing...' : 'Place Order'}</TranslateText>
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  /**
   * Modal component that shows a "Thank You" message after the purchase.
   * @returns {JSX.Element | null} The rendered ThankYouModal component or null if not shown
   */
  const ThankYouModal = () => {
    if (!showThankYouModal) return null;
  
    return (
      <div className="thank-you-modal-overlay">
        <div className="thank-you-modal">
          <h1><TranslateText>Thank you for your purchase</TranslateText></h1>
          <button 
            className="continue-shopping-button"
            onClick={() => {
              setShowThankYouModal(false);
              setCustomerInfo({ name: '', phone: '', address: '' });
              setOrderItems([]);
            }}
          >
            <TranslateText>Continue Shopping</TranslateText>
          </button>
        </div>
      </div>
    );
  };
  