import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './KitchenPage.css';
import Header from './Header';
import { useAuth } from '../context/AuthContext';


function KitchenPage() {
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


  useEffect(() => {
    console.log('Auth State:', { isAuthenticated, user });
  }, [isAuthenticated, user]);


  useEffect(() => {
    if (highContrastMode) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrastMode]);


  // http://localhost:3001/${today}
  // https://project-3-a7za.onrender.com/customeOrderedItems/${order.orderid}
  // https://project-3-a7za.onrender.com/unfinishedOrders

  // Fetching and polling logic for orders (same as before)
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


  const calculateTimeDifference = (orderTime) => {
    let currentTime = new Date();
    console.log("currentTime: " + currentTime);
    const timeDiff = Math.floor((currentTime - orderTime) / 1000);
    let minutes = Math.floor(timeDiff / 60);
    const seconds = timeDiff % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };


  const getTimeClass = (orderTimeString) => {
    const minutes = parseInt(orderTimeString.split(':')[0], 10);
    if (minutes >= 10) return 'red';
    if (minutes >= 5) return 'yellow';
    return 'green';
  };


  const orderType = (orderTypeNumber) => {
    if (orderTypeNumber === 1) return 'Drive Thru';
    if (orderTypeNumber === 2) return 'Delivery';
    if (orderTypeNumber === 3) return 'Take Out';
    if (orderTypeNumber === 4) return 'Dine In';
    return 'Unknown';
  };


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

  const orderTypeColor = (orderType) => {
    if (orderType === 'Drive Thru') return 'blue';
    if (orderType === 'Delivery') return 'purple';
    if (orderType === 'Take Out') return 'orange';
    if (orderType === 'Dine In') return 'cyan';
    return 'Unknown';
  };


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


  const nextPage = () => {
    if ((page + 1) * ORDERS_PER_PAGE < orders.length) {
      setPage(page + 1);
    }
  };


  const prevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };


  const toggleAccessibilityOptions = () => {
    setShowAccessibilityOptions(prevState => !prevState);
  };


  const toggleHighContrastMode = () => {
    setHighContrastMode(prevMode => !prevMode);
  };


  const navigateToPreviousOrders = () => {
    navigate('/previous-orders');
  };


  const handleFontIncrease = () => {
    setFontSize(prevSize => Math.min(prevSize + 2, 26));
  };


  const handleFontDecrease = () => {
    setFontSize(prevSize => Math.max(prevSize - 2, 10));
  };


  const currentOrders = orders.slice(page * ORDERS_PER_PAGE, (page + 1) * ORDERS_PER_PAGE);


  return (
    <>
      <Header />
      <audio ref={audioRef} src="/newOrderSound.wav" preload="auto" />
      <div className="kitchen-display">
        <div className="order-list">
          {currentOrders.map(order => renderTile(order))}
        </div>
        <div className='bottom-buttons'>
          <div className='accessibility'>
            <button 
              onClick={toggleAccessibilityOptions} 
              className="accessibility-button"
              aria-label="Accessibility Options"
            >
              <i className="bi bi-universal-access"></i>
            </button>
            {showAccessibilityOptions && (
              <div className="accessibility-popup">
                <h4>Accessibility</h4>
                <button onClick={handleFontIncrease} style={{ margin: '5px' }}>A+</button>
                <button onClick={handleFontDecrease} style={{ margin: '5px' }}>A-</button>
                <button onClick={toggleHighContrastMode} style={{ margin: '5px' }}>
                  {highContrastMode ? "Disable Dark Theme" : "Enable Dark Theme"}
                </button>
                <button onClick={() => toggleAccessibilityOptions(false)} style={{ marginTop: '10px' }}>Close</button>
              </div>
            )}
          </div>
          <div className="switch-page">
            <button onClick={prevPage} disabled={page === 0}>Previous</button>
            <span>Page {page + 1} of {Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE))}</span>
            <button onClick={nextPage} disabled={(page + 1) * ORDERS_PER_PAGE >= orders.length}>Next</button>
          </div>
          <div className="previous-orders">
            <button onClick={navigateToPreviousOrders}>Previous Orders</button>
          </div>
        </div>
      </div>
    </>
  );  
}


export default KitchenPage;