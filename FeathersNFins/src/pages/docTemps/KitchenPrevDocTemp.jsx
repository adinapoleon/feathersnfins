const [orders, setOrders] = useState([]); // List of current orders
const [page, setPage] = useState(0); // Pagination for orders
const [showAccessibilityOptions, setShowAccessibilityOptions] = useState(false); // Accessibility options visibility
const [fontSize, setFontSize] = useState(16); // Font size for orders
const [highContrastMode, setHighContrastMode] = useState(false); // High contrast mode toggle
const { isAuthenticated, user } = useAuth(); // Auth context for user info
const audioRef = useRef(null); // Audio reference for notification sound
const navigate = useNavigate(); // Hook to navigate to other pages

const ORDERS_PER_PAGE = 5; // Number of orders per page
const previousOrdersLength = useRef(0); // Ref to track previous order count for notifications
const initialLoad = useRef(true); // Ref to track if this is the first load of orders

/**
 * Logs authentication state to the console when changed.
 */
useEffect(() => {
  console.log('Auth State:', { isAuthenticated, user });
}, [isAuthenticated, user]);

/**
 * Applies or removes high contrast mode on body element based on state change.
 */
useEffect(() => {
  if (highContrastMode) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
}, [highContrastMode]);

/**
 * Fetches and polls orders from the server every second.
 * Updates order details when received.
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
 * Calculates the time difference between the current time and the order time.
 *
 * @param {Date} orderTime - The time when the order was placed.
 * @returns {string} - The time difference in the format 'minutes:seconds'.
 */
const calculateTimeDifference = (orderTime) => {
  let currentTime = new Date();
  const timeDiff = Math.floor((currentTime - orderTime) / 1000);
  let minutes = Math.floor(timeDiff / 60);
  const seconds = timeDiff % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

/**
 * Determines the CSS class for the order's time status based on the order time.
 *
 * @param {string} orderTimeString - The time the order was placed.
 * @returns {string} - The CSS class for time status ('red', 'yellow', 'green').
 */
const getTimeClass = (orderTimeString) => {
  const minutes = parseInt(orderTimeString.split(':')[0], 10);
  if (minutes >= 10) return 'red';
  if (minutes >= 5) return 'yellow';
  return 'green';
};

/**
 * Returns a string label for the order type based on the order type number.
 *
 * @param {number} orderTypeNumber - The type of the order (1: Drive Thru, 2: Delivery, 3: Take Out, 4: Dine In).
 * @returns {string} - The order type label.
 */
const orderType = (orderTypeNumber) => {
  if (orderTypeNumber === 1) return 'Drive Thru';
  if (orderTypeNumber === 2) return 'Delivery';
  if (orderTypeNumber === 3) return 'Take Out';
  if (orderTypeNumber === 4) return 'Dine In';
  return 'Unknown';
};

/**
 * Updates the status of an order to "done".
 *
 * @param {number} orderid - The ID of the order to update.
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
 * Returns a CSS class for the order type color based on the type of order.
 *
 * @param {string} orderType - The type of order ('Drive Thru', 'Delivery', 'Take Out', 'Dine In').
 * @returns {string} - The color class for the order type.
 */
const orderTypeColor = (orderType) => {
  if (orderType === 'Drive Thru') return 'blue';
  if (orderType === 'Delivery') return 'purple';
  if (orderType === 'Take Out') return 'orange';
  if (orderType === 'Dine In') return 'cyan';
  return 'Unknown';
};

/**
 * Renders the order details in a tile format.
 *
 * @param {Order} order - The order object to render.
 * @returns {JSX.Element} - The JSX for displaying the order tile.
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
        <button className="done-btn" onClick={() => updateOrderStatus(order.orderid)}>
          Done
        </button>
      </div>
    </div>
  );
};