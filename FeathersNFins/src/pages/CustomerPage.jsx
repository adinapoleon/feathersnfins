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
import sides6 from '../assets/image/sides/side_salad.jpg';

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


function CustomerPage() {
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
    if (highContrastMode) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrastMode]);

  // Auth state logging
  useEffect(() => {
    console.log('Auth State:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  // Google Maps initialization  
  useEffect(() => {
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

  const getItemsByCategory = (category) => {
    if (searchTerm) {
      return menuItems.filter(item => 
        item.category === category &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return menuItems.filter(item => item.category === category);
  };

  // Function to check if item is from Chicken or Fish category
  const isComboMeal = (category) => {
    return category === 'Chicken' || category === 'Fish';
  };

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

  // Add these handler functions with other function declarations
  const toggleAccessibilityOptions = () => {
    setShowAccessibilityOptions(prevState => !prevState);
  };

  const handleFontIncrease = () => {
    setFontSize(prevSize => Math.min(prevSize + 2, 26));
  };

  const handleFontDecrease = () => {
    setFontSize(prevSize => Math.max(prevSize - 2, 10));
  };

  const toggleHighContrastMode = () => {
    setHighContrastMode(prevMode => !prevMode);
  };

  // Function to handle drink selection for combo
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
  
  // Add a new function to handle drink selection cancellation
  const handleDrinkSelectionCancel = () => {
    // Remove the pending combo item from the cart
    if (currentComboItemIndex !== null) {
      setOrderItems(prevItems => prevItems.filter((_, index) => index !== currentComboItemIndex));
    }
    setShowDrinkModal(false);
    setCurrentComboItemIndex(null);
  };

  const removeItem = (index) => {
    setOrderItems(prevItems => prevItems.filter((_, i) => i !== index));
    setSelectedCartItem(null);
  };

  //create the mapping between menuitemid and images
  const menuItemImages = {
    // Chicken items (1-6)
    1: chicken1,  // 2 Piece Chicken Meal
    2: chicken2,  // 3 Piece Chicken Meal
    3: chicken3,  // 5 Piece Chicken Meal
    4: chicken4,  // Grilled Chicken Salad
    5: chicken5,  // Chicken Sandwich
    6: chicken6,  // Chicken Nuggets
    
    // Fish items (7-10)
    7: fish1,    // Fish Fillet
    8: fish2,    // Fish & Chips
    9: fish3,    // Fish Sandwich
    10: fish4,   // Fish Tacos
    
    // Special item (11)
    11: specialimg, // Special item
    
    // Sides items (12-16)
    12: sides1,  // Coleslaw
    13: sides2,  // Mac & Cheese
    14: sides3,  // Onion Rings
    15: sides4,  // Corn on Cob
    16: sides5,  // Tater Tots
    92: sides6,  // Salad
    
    // Drinks items (17-21)
    17: drinks1, // Sweet Tea
    18: drinks2, // Chocolate Shake
    19: drinks3, // Lemonade
    20: drinks4, // Iced Coffee
    91: drinks5, // Water
  };
  
  // Modified MenuItem component
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
            aria-label={`Image of ${item.name}`} // Added accessibility label for the image
          />
        </div>
        <div className="item-content">
          <div className="item-name" style={{ fontSize: `${fontSize}px` }}><TranslateText>{item.name}</TranslateText></div>
          {isCombo && (
            <div className="combo-info">
              <TranslateText>Comes with Fries and Drink</TranslateText>
            </div>
          )}
          <div className="item-bottom">
            <div className="item-price">${item.price.toFixed(2)}</div>
            <button 
              onClick={() => onChoose(item)} 
              className="cart-button"
              aria-label={`Add ${item.name} to cart`} // Added accessibility label for the button
            >
              <i className="bi bi-cart-plus" aria-hidden="true"></i> {/* Set icon to be hidden from screen readers */}
            </button>
          </div>
        </div>
      </div>
    );
};


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
    <div className="review-modal-overlay" aria-labelledby="review-modal-header" role="dialog" aria-modal="true">
      <div className="review-modal">
        <div className="review-modal-header">
          <button 
            className="back-button" 
            onClick={() => setShowReviewModal(false)}
            disabled={isProcessingOrder}
            aria-label="Go back to previous screen"
          >
            <TranslateText>Back</TranslateText>
          </button>
          <h2 id="review-modal-header"><TranslateText>Information for review</TranslateText></h2>
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
            aria-label={isProcessingOrder ? 'Order is being processed' : 'Place the order'}
          >
            <TranslateText>{isProcessingOrder ? 'Processing...' : 'Place Order'}</TranslateText>
          </button>
        </div>
      </div>
    </div>
  );
};


const ThankYouModal = () => {
  if (!showThankYouModal) return null;

  return (
    <div className="thank-you-modal-overlay" aria-labelledby="thank-you-modal-header" role="dialog" aria-modal="true">
      <div className="thank-you-modal">
        <h1 id="thank-you-modal-header"><TranslateText>Thank you for your purchase</TranslateText></h1>
        <button 
          className="continue-shopping-button"
          onClick={() => {
            setShowThankYouModal(false);
            setCustomerInfo({ name: '', phone: '', address: '' });
            setOrderItems([]);
          }}
          aria-label="Return to shopping page"
        >
          <TranslateText>Continue Shopping</TranslateText>
        </button>
      </div>
    </div>
  );
};


const renderCategorySection = (category, title = category) => {
  if (category === selectedCategory) {
    const items = getItemsByCategory(category);
    
    if (items.length === 0 && searchTerm) {
      return (
        <div className="category-section" aria-live="polite">
          <h2 className="section-title"><TranslateText>{title}</TranslateText></h2>
          <p><TranslateText>No items found matching "{searchTerm}"</TranslateText></p>
        </div>
      );
    }
    return (
      <div className="category-section" aria-labelledby={`section-title-${category}`}>
        <h2 id={`section-title-${category}`} className="section-title">
          <TranslateText>{title}</TranslateText>
        </h2>
        <div className="item-grid" role="list" aria-label={`Items in ${title} category`}>
          {items.map((item) => (
            <div role="listitem" key={item.menuitemid}>
              <MenuItem
                item={item}
                onChoose={handleChooseItem}
                aria-label={`Choose ${item.name} from ${title}`}
              />
            </div>
          ))}
        </div>
      </div>
    );
    
  }
  return null;
};


  // Place holder condiments
  const condiments = ['Ketchup', 'Mustard', 'Mayo', 'Relish', 'Hot Sauce'];

  const openModificationModal = (index, e) => {
    e.stopPropagation(); // Prevent triggering the cart item selection
    setCurrentItemIndex(index);
    setModificationModalOpen(true);
    setModifications([]); // Clear previous modifications
    setHighlightedButtons({}); // Reset highlighted buttons
  };

  const handleIngredientAction = (ingredient, action) => {
    const actionKey = `${action} ${ingredient}`;
    const updatedButtons = {
      ...highlightedButtons,
      [actionKey]: !highlightedButtons[actionKey],
    };
    setHighlightedButtons(updatedButtons);

    if (updatedButtons[actionKey]) {
      setModifications(prev => [...prev, actionKey]);
    } else {
      setModifications(prev => prev.filter(mod => mod !== actionKey));
    }
  };

  const finalizeModifications = () => {
    if (currentItemIndex !== null) {
      const updatedOrderItems = [...orderItems];
      updatedOrderItems[currentItemIndex] = {
        ...updatedOrderItems[currentItemIndex],
        modifications: modifications.join(', ')
      };
      setOrderItems(updatedOrderItems);
      setModifications([]);
      setCurrentItemIndex(null);
    }
    setModificationModalOpen(false);
    setHighlightedButtons({}); // Reset highlighted buttons
  };

  // Drink Selection Modal Component
  const DrinkSelectionModal = () => {
    if (!showDrinkModal) return null;
  
    const drinkItems = menuItems.filter(item => item.category === 'Drink');
  
    return (
      <div className="drink-modal-overlay" role="dialog" aria-labelledby="drink-selection-title" aria-hidden={!showDrinkModal}>
        <div className="drink-modal">
          <h2 id="drink-selection-title"><TranslateText>Select Your Free Drink</TranslateText></h2>
          <div className="drink-grid" role="list" aria-label="Available drinks">
            {/* Add None option */}
            <div 
              className="drink-option none-option"
              onClick={() => handleDrinkSelection()}
              role="option"
              aria-label="No drink selected"
            >
              <div className="none-icon">
                <i className="bi bi-slash-circle" aria-hidden="true"></i>
              </div>
              <div className="none-text"><TranslateText>No Drink</TranslateText></div>
            </div>
  
            {/* Existing drink options */}
            {drinkItems.map((drink) => (
              <div 
                key={drink.menuitemid} 
                className="drink-option"
                onClick={() => handleDrinkSelection(drink)}
                role="option"
                aria-label={`Select ${drink.name} drink`}
              >
                <img 
                  src={menuItemImages[drink.menuitemid] || defaultimg}
                  alt={drink.name}
                  className="drink-image"
                  aria-hidden="true"
                />
                <div className="drink-name"><TranslateText>{drink.name}</TranslateText></div>
              </div>
            ))}
          </div>
          <button 
            className="drink-modal-close"
            onClick={handleDrinkSelectionCancel}
            aria-label="Close drink selection modal"
          >
            <TranslateText>Cancel</TranslateText>
          </button>
        </div>
      </div>
    );
};


  // Modified renderCartItems function
  const renderCartItems = () => (
  <div className="cart-items-container">
    {orderItems.filter(item => !item.isPending).map((item, index) => (
      <div 
        key={index} 
        className={`order-grid cart-item ${selectedCartItem === index ? 'selected' : ''} ${highContrastMode ? 'high-contrast' : ''}`}
        style={{ fontSize: `${fontSize}px` }}
        onClick={() => setSelectedCartItem(selectedCartItem === index ? null : index)}
        role="listitem"
        aria-selected={selectedCartItem === index}
      >
        <div>
          <TranslateText>{item.name}</TranslateText>
          {item.isCombo && (
            <div className="combo-details">
              <div><TranslateText>+ Fries</TranslateText></div>
              <div>
                <TranslateText>{item.drinkChoice ? 
                  (item.drinkChoice.name === 'No Drink' ? '- No Drink Selected' : `+ ${item.drinkChoice.name}`) 
                  : '(Select drink)'}</TranslateText>
              </div>
            </div>
          )}
        </div>
        <div><TranslateText>{item.quantity}</TranslateText></div>
        <div>${(item.price * item.quantity).toFixed(2)}</div>
        <div style={{ display: 'flex', gap: '5px' }}>
          {item.isCombo && !item.drinkChoice && (
            <button 
              className="select-drink-button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentComboItemIndex(index);
                setShowDrinkModal(true);
              }}
              aria-label="Select a drink for this combo"
            >
              <i className="bi bi-cup-straw" aria-hidden="true"></i>
            </button>
          )}
          <button 
            className="modify-button"
            onClick={(e) => openModificationModal(index, e)}
            aria-label="Modify item"
          >
            <i className="bi bi-pencil" aria-hidden="true"></i>
          </button>
          <button 
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation();
              removeItem(index);
            }}
            aria-label="Remove item from cart"
          >
            <i className="bi bi-trash" aria-hidden="true"></i>
          </button>
        </div>
        {item.modifications && (
          <div className="modifications-text">
            <TranslateText>{item.modifications}</TranslateText>
          </div>
        )}
      </div>
    ))}
  </div>
);

return (
  <div className={`customer-container ${highContrastMode ? 'high-contrast' : ''}`} role="region" aria-labelledby="customer-container">
    <Header />
    <div className={`customer-content ${highContrastMode ? 'high-contrast' : ''}`} style={{ fontSize: `${fontSize}px` }}>
      <nav className="navbar" aria-label="Main Navigation">
        <div className="menu-items-container" role="navigation">
          {['Chicken', 'Fish', 'Sides/Extras', 'Special', 'Drink'].map((item) => (
            <button 
              key={item} 
              className={`menu-item ${selectedCategory === item ? 'active' : ''} ${highContrastMode ? 'high-contrast' : ''}`}
              onClick={() => {
                setSelectedCategory(item);
                setSearchTerm('');
              }}
              aria-label={`Select ${item} category`}
            >
              <TranslateText>{item}</TranslateText>
            </button>
          ))}
        </div>
        <input 
          type="search" 
          placeholder={placeholders.search}
          className={`search-box ${highContrastMode ? 'high-contrast' : ''}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ fontSize: `${fontSize}px` }}
          aria-label="Search menu items"
        />
      </nav>

      <div className="main-content">
        <div className="menu-section" role="region" aria-labelledby="menu-section">
          {renderCategorySection('Chicken')}
          {renderCategorySection('Fish')}
          {renderCategorySection('Sides/Extras')}
          {renderCategorySection('Special')}
          {renderCategorySection('Drink', 'Drinks')}
        </div>

        <div className={`order-form ${highContrastMode ? 'high-contrast' : ''}`} aria-live="polite">
          <div className="customer-info-section">
            <input
              type="text"
              placeholder={placeholders.customerName}
              className={`input-field ${highContrastMode ? 'high-contrast' : ''}`}
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              style={{ fontSize: `${fontSize}px` }}
              aria-label="Customer's name"
            />
            <input
              type="text"
              placeholder={placeholders.customerPhone}
              className={`input-field ${highContrastMode ? 'high-contrast' : ''}`}
              value={customerInfo.phone}
              onChange={handlePhoneChange}
              style={{ fontSize: `${fontSize}px` }}
              aria-label="Customer's phone number"
            />
            <input
              ref={addressInputRef}
              type="text"
              placeholder={placeholders.address}
              className={`input-field ${highContrastMode ? 'high-contrast' : ''}`}
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
              style={{ fontSize: `${fontSize}px` }}
              aria-label="Customer's address"
            />
          </div>

          <div className="cart-section">
            <div className={`order-grid order-grid-header ${highContrastMode ? 'high-contrast' : ''}`} 
                style={{ fontSize: `${fontSize}px` }}>
              <div><TranslateText>Order Description</TranslateText></div>
              <div><TranslateText>Quantity</TranslateText></div>
              <div><TranslateText>Price</TranslateText></div>
              <div><TranslateText>Action</TranslateText></div>
            </div>
            {renderCartItems()}
          </div>

          <div className={`cart-footer ${highContrastMode ? 'high-contrast' : ''}`}>
            <div className="total-section" style={{ fontSize: `${fontSize}px` }}>
              <span><TranslateText>Total</TranslateText></span>
              <span>
                ${orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
              </span>
            </div>
            <button 
              className={`review-button ${highContrastMode ? 'high-contrast' : ''}`}
              onClick={handleReviewClick}
              style={{ fontSize: `${fontSize}px` }}
              aria-label="Review your order"
            >
              <TranslateText>Review Order</TranslateText>
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Accessibility Controls */}
    <div className='accessibility-container'>
      <button 
        onClick={toggleAccessibilityOptions} 
        className="accessibility-button"
        aria-label="Toggle Accessibility Options"
      >
        <i className="bi bi-universal-access" aria-hidden="true"></i>
      </button>
      {showAccessibilityOptions && (
        <div className={`accessibility-popup ${highContrastMode ? 'high-contrast' : ''}`} role="dialog" aria-labelledby="accessibility-options">
          <h4><TranslateText>Accessibility Options</TranslateText></h4>
          <button onClick={handleFontIncrease} style={{ margin: '3px' }} aria-label="Increase font size">
            <TranslateText>A+</TranslateText>
          </button>
          <button onClick={handleFontDecrease} style={{ margin: '3px' }} aria-label="Decrease font size">
            <TranslateText>A-</TranslateText>
          </button>
          <button onClick={toggleHighContrastMode} style={{ margin: '5px' }} aria-label={highContrastMode ? "Disable High Contrast" : "Enable High Contrast"}>
            <TranslateText>{highContrastMode ? "Disable High Contrast" : "Enable High Contrast"}</TranslateText>
          </button>
          <button onClick={() => toggleAccessibilityOptions(false)} style={{ marginTop: '10px' }} aria-label="Close accessibility options">
            <TranslateText>Close</TranslateText>
          </button>
        </div>
      )}
    </div>

    {/* Add Modification Modal */}
    {modificationModalOpen && (
      <div className={`modification-popup ${highContrastMode ? 'high-contrast' : ''}`} 
        style={{ fontSize: `${fontSize}px` }} 
        role="dialog" aria-labelledby="modification-modal">
        <h2><TranslateText>Modify Item</TranslateText></h2>
        <div>
          {condiments.map((condiment) => (
            <div key={condiment} style={{ marginBottom: '10px' }}>
              <button
                onClick={() => handleIngredientAction(condiment, 'NO')}
                style={{
                  backgroundColor: highlightedButtons[`NO ${condiment}`] ? 'red' : 'lightgray',
                  color: 'white',
                  padding: '8px',
                  border: 'none',
                  borderRadius: '4px',
                  marginRight: '10px',
                  fontSize: `${fontSize}px`
                }}
                aria-label={`Remove ${condiment} from item`}
              >
                <TranslateText>NO</TranslateText> <TranslateText>{condiment}</TranslateText>
              </button>
              <button 
                onClick={() => handleIngredientAction(condiment, 'ADD')}
                style={{
                  backgroundColor: highlightedButtons[`ADD ${condiment}`] ? 'green' : 'lightgray',
                  color: 'white',
                  padding: '8px',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: `${fontSize}px`
                }}
                aria-label={`Add ${condiment} to item`}
              >
                <TranslateText>ADD</TranslateText> <TranslateText>{condiment}</TranslateText>
              </button>
            </div>
          ))}
        </div>
        <button 
          className="modification-button-done"
          onClick={finalizeModifications}
          style={{ fontSize: `${fontSize}px` }}
          aria-label="Finalize modifications"
        >
          <TranslateText>Done</TranslateText>
        </button>
        <button 
          className="modification-button-cancel"
          onClick={() => setModificationModalOpen(false)}
          style={{ fontSize: `${fontSize}px` }}
          aria-label="Cancel modifications"
        >
          <TranslateText>Cancel</TranslateText>
        </button>
      </div>
    )}
    <DrinkSelectionModal />
    <ReviewModal />
    <ThankYouModal />
  </div>
);

}

export default CustomerPage;