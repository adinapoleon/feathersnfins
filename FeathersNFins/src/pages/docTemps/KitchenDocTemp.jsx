import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './KitchenPage.css';
import Header from './Header';
import { useAuth } from '../context/AuthContext';



  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [showAccessibilityOptions, setShowAccessibilityOptions] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrastMode, setHighContrastMode] = useState(false); // High contrast state
  const { isAuthenticated, user } = useAuth();
  const audioRef = useRef(null);
  const navigate = useNavigate();


  const ORDERS_PER_PAGE = 5;
  const previousOrdersLength = useRef(0);
  const initialLoad = useRef(true);


 /**
 * Logs the authentication state (whether the user is authenticated) and the user object whenever the authentication state or user changes.
 * 
 * @effect
 * @example
 * useEffect(() => {
 *   console.log('Auth State:', { isAuthenticated, user });
 * }, [isAuthenticated, user]);
 */
useEffect(() => {
    console.log('Auth State:', { isAuthenticated, user });
  }, [isAuthenticated, user]);
  
  /**
   * Toggles the 'high-contrast' class on the document body based on the value of `highContrastMode`.
   * This is used to enable or disable high contrast mode for accessibility purposes.
   * 
   * @effect
   * @example
   * useEffect(() => {
   *   if (highContrastMode) {
   *     document.body.classList.add('high-contrast');
   *   } else {
   *     document.body.classList.remove('high-contrast');
   *   }
   * }, [highContrastMode]);
   */
  useEffect(() => {
    if (highContrastMode) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrastMode]);
  
  /**
   * Fetches unfinished orders and their details every second and updates the orders state.
   * 
   * This effect fetches unfinished orders and their details, then updates the state with the new order data.
   * If new orders are added, an audio notification is played.
   * 
   * @effect
   * @example
   * useEffect(() => {
   *   // Fetching and polling logic for orders
   * }, []);
   */
  useEffect(() => {
    const fetchOrders = () => {
      fetch('https://project-3-a7za.onrender.com/unfinishedOrders')
        .then(response => response.json())
        .then(data => {
          const fetchOrderDetails = async () => {
            const detailedOrders = await Promise.all(
              data.map(async (order) => {
                const response = await fetch(`https://project-3-a7za.onrender.com/customeOrderedItems/${order.orderid}`);
                const orderDetails = await response.json();
                return {
                  ...order,
                  details: orderDetails
                };
              })
            );
            if (!initialLoad.current && detailedOrders.length > previousOrdersLength.current) {
              audioRef.current.play().catch(error => console.error('Audio play error:', error));
            }
            setOrders(detailedOrders);
            previousOrdersLength.current = detailedOrders.length;
            initialLoad.current = false;
          };
          fetchOrderDetails();
        })
        .catch(error => console.error('Error fetching orders:', error));
    };
  
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 1000);
  
    return () => clearInterval(intervalId);
  }, []);
  
  /**
   * Calculates the time difference between the current time and the provided order time.
   * 
   * @param {Date} orderTime - The time the order was placed.
   * @returns {string} A string representing the time difference in "minutes:seconds" format.
   * @example
   * calculateTimeDifference(new Date(order.ordertime)); // "3:45"
   */
  const calculateTimeDifference = (orderTime) => {
    let currentTime = new Date();
    console.log("currentTime: " + currentTime);
    const timeDiff = Math.floor((currentTime - orderTime) / 1000);
    let minutes = Math.floor(timeDiff / 60);
    const seconds = timeDiff % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  /**
   * Determines the CSS class to apply based on the time difference since the order was placed.
   * 
   * @param {string} orderTimeString - A string representing the order time in "minutes:seconds" format.
   * @returns {string} The CSS class name ('red', 'yellow', or 'green') based on the order's age.
   * @example
   * getTimeClass("5:30"); // "yellow"
   */
  const getTimeClass = (orderTimeString) => {
    const minutes = parseInt(orderTimeString.split(':')[0], 10);
    if (minutes >= 10) return 'red';
    if (minutes >= 5) return 'yellow';
    return 'green';
  };
  
  /**
   * Converts an order type number to a human-readable string.
   * 
   * @param {number} orderTypeNumber - The numeric value representing the order type.
   * @returns {string} The corresponding order type string (e.g., 'Drive Thru', 'Delivery').
   * @example
   * orderType(1); // 'Drive Thru'
   */
  const orderType = (orderTypeNumber) => {
    if (orderTypeNumber === 1) return 'Drive Thru';
    if (orderTypeNumber === 2) return 'Delivery';
    if (orderTypeNumber === 3) return 'Take Out';
    if (orderTypeNumber === 4) return 'Dine In';
    return 'Unknown';
  };
  
  /**
   * Updates the status of an order to 'done' and removes it from the list of orders.
   * 
   * @param {string} orderid - The ID of the order to update.
   * @returns {Promise<void>} A promise that resolves once the order status has been updated.
   * @example
   * updateOrderStatus(order.orderid); // Updates the order status to 'done'
   */
  const updateOrderStatus = async (orderid) => {
    try {
      await fetch(`https://project-3-a7za.onrender.com/updateOrderStatus/${orderid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isdone: true })
      });
      setOrders(orders.filter(order => order.orderid !== orderid));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };
  
  /**
   * Returns the CSS color class based on the order type.
   * 
   * @param {string} orderType - The order type as a string (e.g., 'Drive Thru', 'Delivery').
   * @returns {string} The corresponding color for the order type.
   * @example
   * orderTypeColor('Drive Thru'); // 'blue'
   */
  const orderTypeColor = (orderType) => {
    if (orderType === 'Drive Thru') return 'blue';
    if (orderType === 'Delivery') return 'purple';
    if (orderType === 'Take Out') return 'orange';
    if (orderType === 'Dine In') return 'cyan';
    return 'Unknown';
  };
  
  /**
   * Renders a tile representing an order with its details, including order time and items.
   * 
   * @param {Object} order - The order object containing order details.
   * @returns {JSX.Element} A JSX element representing an order tile with formatted details.
   * @example
   * renderTile(order); // Renders a tile for the provided order
   */
  const renderTile = (order) => {
    const datePart = order.orderdate.split('T')[0];
    const orderTime = new Date(`${datePart}T${order.ordertime}`);
    const timeDifference = calculateTimeDifference(orderTime);
    const timeColor = getTimeClass(timeDifference);
    const orderTypeLabel = orderType(order.ordertype);
    const typeColor = orderTypeColor(orderTypeLabel);
  
    return (
      <div className={`order-tile ${highContrastMode ? 'high-contrast' : ''}`} key={order.orderid} style={{ fontSize: `${fontSize}px` }}>
        <div className={`tile-header ${timeColor}`}>
          <div className="header-top-left">
            <span className="order-id">#{order.orderid}</span>
          </div>
          <div className="header-top-right">
            {order.details && order.details.length > 0 ? order.details[0].customer_name : "Unknown"}
          </div>
          <div className="header-bottom-left">
            <span className="order-time">{order.ordertime}</span>
          </div>
          <div className="header-bottom-right">
            <span className="time-since-order">{timeDifference}</span>
          </div>
        </div>
        <div className="tile-body">
          <p>{orderTypeLabel}</p>
          <div className='order-items'>
            <ul>
              {order.details && order.details.map(item => (
                <li key={item.item_name}>
                  {item.quantity} × <strong>{item.item_name}</strong>
                  {item.modifications && item.modifications !== "{}" && (
                    <small> - {item.modifications}</small>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="tile-buttons">
          <button className="done-btn" onClick={() => updateOrderStatus(order.orderid)}>Done</button>
        </div>
      </div>
    );
  };
  
  /**
   * Increases the current page number to display the next set of orders.
   * 
   * @function
   * @example
   * nextPage(); // Advances to the next page of orders
   */
  const nextPage = () => {
    if ((page + 1) * ORDERS_PER_PAGE < orders.length) {
      setPage(page + 1);
    }
  };
  
  /**
   * Decreases the current page number to display the previous set of orders.
   * 
   * @function
   * @example
   * prevPage(); // Moves back to the previous page of orders
   */
  const prevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };
  
  /**
   * Toggles the visibility of accessibility options.
   * 
   * @function
   * @example
   * toggleAccessibilityOptions(); // Toggles the visibility of the accessibility options panel
   */
  const toggleAccessibilityOptions = () => {
    setShowAccessibilityOptions(prevState => !prevState);
  };
  
  /**
   * Toggles the high contrast mode for accessibility purposes.
   * 
   * @function
   * @example
   * toggleHighContrastMode(); // Switches between high contrast mode and normal mode
   */
  const toggleHighContrastMode = () => {
    setHighContrastMode(prevMode => !prevMode);
  };
  
  /**
   * Navigates to the previous orders page.
   * 
   * @function
   * @example
   * navigateToPreviousOrders(); // Navigates to the previous orders page
   */
  const navigateToPreviousOrders = () => {
    navigate('/previous-orders');
  };
  
  /**
   * Increases the font size of the displayed orders up to a maximum of 26px.
   * 
   * @function
   * @example
   * handleFontIncrease(); // Increases the font size of orders
   */
  const handleFontIncrease = () => {
    setFontSize(prevSize => Math.min(prevSize + 2, 26));
  };
  
  /**
   * Decreases the font size of the displayed orders down to a minimum of 10px.
   * 
   * @function
   * @example
   * handleFontDecrease(); // Decreases the font size of orders
   */
  const handleFontDecrease = () => {
    setFontSize(prevSize => Math.max(prevSize - 2, 10));
  };
  
  /**
   * Selects the orders to be displayed on the current page.
   * 
   * @returns {Array} The orders for the current page.
   * @example
   * currentOrders; // Returns the orders to be displayed on the current page
   */
  const currentOrders = orders.slice(page * ORDERS_PER_PAGE, (page + 1) * ORDERS_PER_PAGE);
  





export default KitchenPage;