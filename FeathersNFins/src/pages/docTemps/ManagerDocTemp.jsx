// State hooks to manage data for different views
const [activeView, setActiveView] = useState("Menu Items");
const [menuItems, setMenuItems] = useState([]); // Menu items data
const [inventoryItems, setInventoryItems] = useState([]); // Inventory items data
const [employees, setEmployees] = useState([]); // Employees data
const [analyticsData, setAnalyticsData] = useState([]); // Analytics data
const [error, setError] = useState(null); // Error state for data fetching

// Authentication context to manage user session
const { isAuthenticated, user } = useAuth();

/**
 * Logs the authentication state whenever it changes.
 */
useEffect(() => {
  console.log('Auth State:', { isAuthenticated, user });
}, [isAuthenticated, user]);

/**
 * Fetches data based on the currently active view (Menu Items, Inventory, Employees, or Analytics).
 */
useEffect(() => {
  switch (activeView) {
    case "Menu Items":
      fetchMenuItems();
      break;
    case "Inventory":
      fetchInventoryItems();
      break;
    case "Employee":
      fetchEmployees();
      break;
    case "Analytics":
      fetchAnalyticsData();
      break;
    default:
      break;
  }
}, [activeView]);

/**
 * Fetches the menu items from the server and updates the state.
 */
const fetchMenuItems = async () => {
  try {
    const response = await fetch("https://project-3-a7za.onrender.com/menu");
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    setMenuItems(data);
    setError(null);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    setError("Failed to fetch menu items.");
  }
};

/**
 * Fetches the inventory items from the server and updates the state.
 */
const fetchInventoryItems = async () => {
  try {
    const response = await fetch("https://project-3-a7za.onrender.com/inventory");
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    setInventoryItems(data);
    setError(null);
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    setError("Failed to fetch inventory items.");
  }
};

/**
 * Fetches the employee data from the server and updates the state.
 */
const fetchEmployees = async () => {
  try {
    const response = await fetch("https://project-3-a7za.onrender.com/employee");
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    setEmployees(data);
    setError(null);
  } catch (error) {
    console.error("Error fetching employees:", error);
    setError("Failed to fetch employees.");
  }
};

/**
 * Fetches the analytics data from the server and updates the state.
 */
const fetchAnalyticsData = async () => {
  try {
    const response = await fetch("https://project-3-a7za.onrender.com/analytics");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("Fetched Analytics Data:", data); // Debugging log
    setAnalyticsData(data); // Set the raw analytics data
    setError(null);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    setError("Failed to fetch analytics data.");
  }
};

/**
 * Retrieves the active view from localStorage when the component mounts
 * and sets it as the initial active view.
 */
useEffect(() => {
  const savedActiveView = localStorage.getItem('activeView');
  if (savedActiveView) {
    setActiveView(savedActiveView);  // Set the active view from localStorage
  } else {
    setActiveView("Menu Items");  // Default to "Menu Items" if no saved value
  }
}, []);

/**
 * Updates the active view and stores it in localStorage.
 *
 * @param {string} view - The view to switch to (e.g., "Menu Items", "Inventory", etc.)
 */
const handleViewChange = (view) => {
  setActiveView(view);
  localStorage.setItem('activeView', view);  // Save the active view to localStorage
};