import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KitchenPreviousOrders.css';
import Header from './Header';

function KitchenPreviousOrders() {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [showAccessibilityOptions, setShowAccessibilityOptions] = useState(false);
  const [fontSizes, setFontSizes] = useState({
    title: 30,
    header: 20, 
    body: 16, 
    pagination: 14, 
  });
  const [highContrastMode, setHighContrastMode] = useState(false); 
  const ORDERS_PER_PAGE = 6;
  const navigate = useNavigate();

  const today = new Date();
  const isoFormattedDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const formattedDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  useEffect(() => {
    if (highContrastMode) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrastMode]);

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        const response = await fetch(
          `https://project-3-a7za.onrender.com/completedOrders/${isoFormattedDate}`
        );
        const data = await response.json();

        const ordersMap = {};
        await Promise.all(
          data.map(async (item) => {
            const { orderid } = item;

            if (!ordersMap[orderid]) {
              const detailsResponse = await fetch(
                `https://project-3-a7za.onrender.com/customeOrderedItems/${orderid}`
              );
              const detailedItems = await detailsResponse.json();

              ordersMap[orderid] = {
                orderid,
                customer_name: item.customer_name,
                orderdate: item.orderdate,
                ordertime: item.ordertime,
                ordertype: item.ordertype,
                items: detailedItems.map((item) => ({
                  item_name: item.item_name,
                  quantity: item.quantity,
                  modifications: item.modifications,
                })),
              };
            }
          })
        );

        setCompletedOrders(Object.values(ordersMap));
      } catch (error) {
        console.error('Error fetching completed orders:', error);
      }
    };

    fetchCompletedOrders();
  }, [formattedDate]);

  const getOrderType = (orderTypeNumber) => {
    switch (orderTypeNumber) {
      case 1:
        return 'Drive Thru';
      case 2:
        return 'Delivery';
      case 3:
        return 'Take Out';
      case 4:
        return 'Dine In';
      default:
        return 'Unknown';
    }
  };

  const handleFontIncrease = () => {
    setFontSizes((prevSizes) => ({
      header: Math.min(prevSizes.header + 2, 30),
      body: Math.min(prevSizes.body + 2, 24),
      pagination: Math.min(prevSizes.pagination + 2, 22),
    }));
  };

  const handleFontDecrease = () => {
    setFontSizes((prevSizes) => ({
      header: Math.max(prevSizes.header - 2, 12),
      body: Math.max(prevSizes.body - 2, 10),
      pagination: Math.max(prevSizes.pagination - 2, 8),
    }));
  };

  const toggleAccessibilityOptions = () => {
    setShowAccessibilityOptions((prevState) => !prevState);
  };

  const toggleHighContrastMode = () => {
    setHighContrastMode((prevMode) => !prevMode);
  };

  const renderTile = (order) => {
    const orderType = getOrderType(order.ordertype);

    return (
      <div
        className={`kitchen-previous-order-tile ${highContrastMode ? 'high-contrast' : ''}`}
        key={order.orderid}
        style={{ fontSize: `${fontSizes.body}px` }}
      >
        <div className="kitchen-previous-order-header">
          <span
            className="kitchen-previous-order-id"
            style={{ fontSize: `${fontSizes.header}px` }}
          >
            Order #{order.orderid}
          </span>
          <span
            className="kitchen-previous-customer-name"
            style={{ fontSize: `${fontSizes.body}px` }}
          >
            {order.customer_name || 'Unknown'}
          </span>
        </div>
        <div className="kitchen-previous-order-body">
          <p style={{ fontSize: `${fontSizes.body}px` }}>Order Type: {orderType}</p>
          <p style={{ fontSize: `${fontSizes.body}px` }}>Order Time: {order.ordertime}</p>
          <ul>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <li key={index}>
                  {item.quantity} ×{' '}
                  <strong style={{ fontSize: `${fontSizes.body}px` }}>{item.item_name}</strong>
                  {item.modifications && item.modifications.trim() !== '' && item.modifications !== '{}' && (
                    <small style={{ fontSize: `${fontSizes.pagination}px` }}>
                      {' '}
                      - {item.modifications}
                    </small>
                  )}
                </li>
              ))
            ) : (
              <li style={{ fontSize: `${fontSizes.body}px` }}>No items available</li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  const currentOrders = completedOrders.slice(
    page * ORDERS_PER_PAGE,
    (page + 1) * ORDERS_PER_PAGE
  );

  const nextPage = () => {
    if ((page + 1) * ORDERS_PER_PAGE < completedOrders.length) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <>
      <Header />
      <div className="kitchen-previous-orders-container">
        <h2>
          Completed Orders for {formattedDate}
        </h2>
        <div className="kitchen-previous-orders-list">
          {currentOrders.map((order) => renderTile(order))}
        </div>
        <div className="kitchen-previous-bottom-buttons">
          {/* Updated Accessibility Section with Icon */}
          <div className="kitchen-previous-accessibility">
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
                <button onClick={handleFontIncrease} style={{ margin: '5px' }}>
                  A+
                </button>
                <button onClick={handleFontDecrease} style={{ margin: '5px' }}>
                  A-
                </button>
                <button onClick={toggleHighContrastMode} style={{ margin: '5px' }}>
                  {highContrastMode ? 'Disable Dark Theme' : 'Enable Dark Theme'}
                </button>
                <button
                  onClick={() => toggleAccessibilityOptions(false)}
                  style={{ marginTop: '10px' }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
          <div className="kitchen-previous-pagination">
            <button onClick={prevPage} disabled={page === 0}>
              Previous
            </button>
            <span>
              Page {page + 1} of {Math.max(1, Math.ceil(completedOrders.length / ORDERS_PER_PAGE))}
            </span>
            <button
              onClick={nextPage}
              disabled={(page + 1) * ORDERS_PER_PAGE >= completedOrders.length}
            >
              Next
            </button>
          </div>
          <div className="kitchen-previous-back">
            <button onClick={() => navigate('/kitchen')}>Back to Kitchen</button>
          </div>
        </div>
      </div>
    </>
  );  
}

export default KitchenPreviousOrders;
