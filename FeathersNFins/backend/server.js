const express = require('express');
const dotenv = require('dotenv').config();
const app = express();
const cors = require('cors');
const { Pool } = require('pg');

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.PSQL_USER,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT,
  ssl: {rejectUnauthorized: false}
});

/**
 * @function getMenu
 * @description Retrieves all menu items from the database and sends them in the response.
 * 
 * @route GET /menu
 * @returns {Array} 200 - List of menu items with details (category, name, price, description, isvegetarian, menuitemid).
 * @throws {500} - Error if the database query fails.
 */
const getMenu = async (req, res) => {
  try {
    const result = await pool.query('SELECT category, name, price, description, isvegetarian, menuitemid FROM menuitem');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
};
app.get('/menu', getMenu);

/**
 * @function getMenuItemById
 * @description Retrieves a menu item by its ID from the database and sends it in the response.
 * 
 * @route GET /menu/empid
 * @param {string} menuid - The menu item ID passed as a query parameter.
 * @returns {Object} 200 - A single menu item with details (category, name, price, description, isvegetarian, menuitemid).
 * @throws {500} - Error if the database query fails.
 */
const getMenuItemById = async (req, res) => {
  const { menuid } = req.query;
  try {
    const result = await pool.query('SELECT * FROM menuitem WHERE menuitemid = $1', [menuid]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
app.get('/menu/empid', getMenuItemById);

/**
 * @function editMenuItem
 * @description Updates a menu item in the database with the provided details. 
 * If a value is not provided, it will retain the current value in the database.
 * 
 * @route PATCH /menu/editapi
 * @param {string} id - The ID of the menu item to be updated.
 * @param {string} name - The new name of the menu item (optional).
 * @param {string} price - The new price of the menu item (optional).
 * @param {string} description - The new description of the menu item (optional).
 * @param {boolean} isveg - Whether the menu item is vegetarian (optional).
 * @param {string} category - The new category of the menu item (optional).
 * @returns {Object} 200 - The updated menu item data.
 * @throws {500} - Error if the database query fails or item update fails.
 */
const editMenuItem = async (req, res) => {
  const { id, name, price, description, isveg, category } = req.body;

  try {
    // Get current menu item data
    const currentDataQuery = `SELECT category, name, price, description, isvegetarian FROM menuitem WHERE menuitemid = $1`;
    const currentDataResult = await pool.query(currentDataQuery, [id]);

    const currentData = currentDataResult.rows[0];

    // Update values with new ones, if provided; otherwise, keep current values
    const updatedName = name !== undefined && name !== "" ? name : currentData.name;
    const updatedCategory = category !== undefined && category !== "" ? category : currentData.category;
    const updatedDescription = description !== undefined && description !== "" ? description : currentData.description;
    const updatedPrice = price !== undefined && price !== "" ? price : currentData.price;
    const updatedVeg = isveg !== undefined ? isveg : currentData.isvegetarian;

    // Update the menu item in the database
    const updateQuery = `
      UPDATE menuitem 
      SET name = $1, description = $2, price = $3, category = $4, isvegetarian = $5 
      WHERE menuitemid = $6 
      RETURNING *`;
    const updateValues = [updatedName, updatedDescription, updatedPrice, updatedCategory, updatedVeg, id];

    const updateResult = await pool.query(updateQuery, updateValues);

    // Return the updated menu item data
    res.status(200).json(updateResult.rows[0]);

  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};
app.patch('/menu/editapi', editMenuItem);


/**
 * @function deleteMenuItem
 * @description Deletes a menu item from the database based on the provided ID.
 * If the item is not found, it returns a 404 error. If the ID is missing, it returns a 400 error.
 * 
 * @route PATCH /menu/deleteapi
 * @param {string} id - The ID of the menu item to be deleted.
 * @returns {Object} 200 - A success message with the deleted item details.
 * @throws {400} - If no ID is provided in the request.
 * @throws {404} - If the menu item is not found.
 * @throws {500} - If an error occurs during the database operation.
 */
const deleteMenuItem = async (req, res) => {
  const { id } = req.body;

  // Ensure ID is provided
  if (!id) {
    return res.status(400).json({ error: "Item ID is required" });
  }

  try {
    const query = "DELETE FROM menuitem WHERE menuitemid = $1 RETURNING *";
    const values = [id]; // Use an array for parameterized queries

    const result = await pool.query(query, values); // For pg, result is not destructured

    // Check if the item exists and was deleted
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Respond with the deleted item details
    res.status(200).json({ message: "Item successfully deleted", data: result.rows[0] });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
};
app.patch('/menu/deleteapi', deleteMenuItem);

/**
 * @function addMenuItem
 * @description Adds a new menu item to the database, along with its associated inventory. 
 * It validates the input, inserts the new menu item into the `menuitem` table, 
 * and updates the `menuitem_inventory` table with the provided inventory list.
 * 
 * @route POST /menu/postapi
 * @param {Object} body - The request body containing the menu item details.
 * @param {string} body.name - The name of the menu item.
 * @param {string} body.description - The description of the menu item.
 * @param {number} body.price - The price of the menu item.
 * @param {string} body.category - The category of the menu item.
 * @param {Array} body.inventoryList - The list of inventory items with their quantities.
 * @param {boolean} body.isVegetarian - Whether the menu item is vegetarian.
 * @returns {Object} 201 - A success message with the added menu item details.
 * @throws {400} - If the input validation fails for the `name`.
 * @throws {500} - If an error occurs during the database operation.
 */
const addMenuItem = async (req, res) => {
  const { name, description, price, category, inventoryList, isVegetarian } = req.body;  

  // Validate input (same as before)
  if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
          error: 'Invalid input. Name is required.',
      });
  }

  const connection = await pool.connect();

  try {
      // Get the next available menu item ID
      const selectMaxIdSql = 'SELECT MAX(menuitemid) AS max_id FROM menuitem';
      let nextMenuItemInventoryID = 1; // Default to 1 if no records exist

      const result = await connection.query(selectMaxIdSql);
      if (result.rows.length > 0 && result.rows[0].max_id !== null) {
          nextMenuItemInventoryID = result.rows[0].max_id + 1;
      }

      // Insert the new menu item into the menuitem table
      const insertMenuItemSql = `INSERT INTO menuitem (name, description, price, category, isvegetarian)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING menuitemid;`;
      
      const insertMenuItemValues = [name.trim(), description.trim(), price, category.trim(), isVegetarian];
      const menuItemResult = await connection.query(insertMenuItemSql, insertMenuItemValues);
      const newMenuItemId = menuItemResult.rows[0].menuitemid;

      // Insert into the menuitem_inventory table
      const insertMenuItemInventorySql = `INSERT INTO menuitem_inventory (menuitemid, inventoryid, quantity_needed)
          VALUES ($1, $2, $3);`;

      // Loop through the inventory list, check for inventory items, and insert
      for (const item of inventoryList) {
          const { inventoryName, quantity } = item;

          // Get the inventory ID based on the inventory name
          const inventoryIdResult = await connection.query('SELECT inventoryid FROM inventory WHERE itemname = $1', [inventoryName.trim()]);

          if (inventoryIdResult.rows.length > 0) {
              const inventoryId = inventoryIdResult.rows[0].inventoryid;

              // Insert into menuitem_inventory
              await connection.query(insertMenuItemInventorySql, [newMenuItemId, inventoryId, quantity]);
          } else {
              console.log("Inventory item not found: " + inventoryName);
          }
      }

      // Respond with success
      res.status(201).json({
          message: 'Menu item added successfully',
          item: {
              menuitemid: newMenuItemId,
              name,
              description,
              price,
              category,
              inventoryList,
              isVegetarian
          },
      });

  } catch (err) {
      console.error("Error inserting new menu item:", err.message, err.stack);
      res.status(500).json({
          error: 'An error occurred while adding the menu item',
      });
  } finally {
      // Ensure the connection is closed after use
      connection.release();
  }
};
app.post('/menu/postapi', addMenuItem);


/**
 * @function getInventory
 * @description Retrieves all items from the inventory, including their ID, name, quantity, and unit cost.
 * 
 * @route GET /inventory
 * @returns {Array} 200 - A list of inventory items with details (inventoryid, itemname, quantity, unitcost).
 * @throws {500} - Error if the database query fails.
 */
const getInventory = async (req, res) => {
  try {
    const result = await pool.query('SELECT inventoryid, itemname, quantity, unitcost FROM inventory'); // Selecting from the inventory table
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
};
app.get('/inventory', getInventory);



const checkInventory = async (req, res) => {
  const { itemname } = req.query; // Extract the inventory item name from the query parameter

  try {
    // Query the database to check if the item exists
    const result = await pool.query(
      `SELECT inventoryid FROM inventory WHERE itemname = $1`,
      [itemname]
    );

    if (result.rows.length > 0) {
      // If the item exists, return success
      res.json({ exists: true });
    } else {
      // If the item does not exist, return failure
      res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking inventory item:", error);
    res.status(500).json({ error: "Database error" });
  }
};
app.get("/inventory/check", checkInventory);



/**
 * @function getInventoryItemById
 * @description Retrieves a specific inventory item by its ID.
 * 
 * @route GET /inventory/empid
 * @param {string} itemid - The ID of the inventory item to retrieve.
 * @returns {Object} 200 - The inventory item details.
 * @throws {500} - Error if the database query fails.
 */
const getInventoryItemById = async (req, res) => {
  const { itemid } = req.query; // Extract 'itemid' from the query string
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE inventoryid = $1', [itemid]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
app.get('/inventory/empid', getInventoryItemById);


/**
 * @function updateInventoryItem
 * @description Updates the details of an inventory item.
 * 
 * @route PATCH /inventory/editapi
 * @param {string} id - The ID of the inventory item to update.
 * @param {string} [itemName] - The updated name of the inventory item.
 * @param {number} [unitCost] - The updated unit cost of the inventory item.
 * @param {number} [quantity] - The updated quantity of the inventory item.
 * @returns {Object} 200 - The updated inventory item details.
 * @throws {404} - If the inventory item is not found.
 * @throws {500} - If the database query fails.
 */
const updateInventoryItem = async (req, res) => {
  const { id, itemName, unitCost, quantity } = req.body;

  try {
    // Fetch the current data for the inventory item
    const currentDataQuery = `SELECT itemname, quantity, unitcost FROM inventory WHERE inventoryid = $1`;
    const currentDataResult = await pool.query(currentDataQuery, [id]);

    if (currentDataResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Get the current values
    const currentData = currentDataResult.rows[0];

    // Use provided data or fall back to existing data
    const updatedItemName = itemName || currentData.itemname;
    const updatedQuantity = quantity !== "" ? quantity : currentData.quantity;
    const updatedUnitCost = unitCost !== "" ? unitCost : currentData.unitcost;

    // Update the inventory item's details
    const updateQuery = `
      UPDATE inventory 
      SET itemname = $1, quantity = $2, unitcost = $3 
      WHERE inventoryid = $4 
      RETURNING *`;
    const updateValues = [updatedItemName, updatedQuantity, updatedUnitCost, id];

    // Execute the update query
    const updateResult = await pool.query(updateQuery, updateValues);

    // Return the updated row
    res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};
app.patch('/inventory/editapi', updateInventoryItem);

/**
 * @function deleteInventoryItem
 * @description Deletes an inventory item from the database.
 * 
 * @route PATCH /inventory/deleteapi
 * @param {string} id - The ID of the inventory item to delete.
 * @returns {Object} 200 - Confirmation message with deleted item details.
 * @throws {400} - If the item ID is not provided.
 * @throws {404} - If the inventory item is not found.
 * @throws {500} - If the database query fails.
 */
const deleteInventoryItem = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Item ID is required" });
  }

  try {
    const query = "DELETE FROM inventory WHERE inventoryid = $1 RETURNING *";
    const values = [id]; // Use an array for parameterized queries

    const result = await pool.query(query, values); // For pg, result is not destructured

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({ message: "Item successfully deleted", data: result.rows[0] });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
};
app.patch('/inventory/deleteapi', deleteInventoryItem);



/**
 * @function addInventoryItem
 * @description Adds a new item to the inventory if it doesn't already exist.
 * 
 * @route POST /inventory/postapi
 * @param {string} itemName - The name of the inventory item.
 * @param {number} quantity - The quantity of the inventory item.
 * @param {number} unitCost - The unit cost of the inventory item.
 * @returns {Object} 201 - Success message with the added item details.
 * @throws {400} - If the item name is invalid or the item already exists.
 * @throws {500} - If the database query fails.
 */
const addInventoryItem = async (req, res) => {
  const { itemName, quantity, unitCost } = req.body;

  // Validate input
  if (!itemName || typeof itemName !== 'string' || !itemName.trim()) {
      return res.status(400).json({
          error: 'Invalid input. Item name is required.',
      });
  }

  try {
      // Check if the item name already exists in the inventory
      const checkItemSql = 'SELECT COUNT(*) FROM inventory WHERE itemname = $1';
      const checkItemResult = await pool.query(checkItemSql, [itemName.trim()]);

      if (checkItemResult.rows[0].count > 0) {
          return res.status(400).json({
              error: 'Item already exists in the inventory.',
          });
      }

      // Get the next available inventory ID (similar to your Java code)
      const selectMaxIdSql = 'SELECT MAX(inventoryid) AS max_id FROM inventory';
      let nextInventoryID = 1; // Default to 1 if no records exist

      const result = await pool.query(selectMaxIdSql);
      if (result.rows.length > 0 && result.rows[0].max_id !== null) {
          nextInventoryID = result.rows[0].max_id + 1;
      }

      // Insert the new item into the inventory table
      const insertQuery = `
          INSERT INTO inventory (inventoryid, itemname, quantity, unitcost)
          VALUES ($1, $2, $3, $4)
          RETURNING *;
      `;
      const insertValues = [nextInventoryID, itemName.trim(), quantity, unitCost];

      const insertResult = await pool.query(insertQuery, insertValues);

      // Respond with success
      res.status(201).json({
          message: 'Item added successfully',
          item: insertResult.rows[0],
      });

  } catch (err) {
      console.error("Error inserting new item:", err.message, err.stack);

      // Handle database errors
      if (err.code === '23505') { // Unique constraint violation
          return res.status(400).json({ error: 'Item already exists.' });
      }
      res.status(500).json({
          error: 'An error occurred while adding the item',
      });
  }
};
app.post('/inventory/postapi', addInventoryItem);


/**
 * @function getAllEmployees
 * @description Retrieves all employees with their IDs, names, and managers from the database.
 * 
 * @route GET /employee
 * @returns {Object[]} 200 - A list of employees with their details.
 * @throws {500} - If the database query fails.
 */
const getAllEmployees = async (req, res) => {
  try {
    const result = await pool.query('SELECT employeeid, name, manager FROM employee');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database Error' });
  }
};
app.get('/employee', getAllEmployees);


/**
 * @function getEmployeeById
 * @description Retrieves a specific employee by their employee ID from the database.
 * 
 * @route GET /employee/empid
 * @param {string} employeeid - The ID of the employee to retrieve.
 * @returns {Object} 200 - The employee details.
 * @throws {500} - If the database query fails.
 */
const getEmployeeById = async (req, res) => {
  const { employeeid } = req.query; // Extract 'employeeid' from the query string
  try {
    const result = await pool.query('SELECT * FROM employee WHERE employeeid = $1', [employeeid]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
app.get('/employee/empid', getEmployeeById);


/**
 * @function updateEmployee
 * @description Updates the details of an employee, such as their name and admin status.
 * 
 * @route PATCH /employee/editapi
 * @param {string} id - The ID of the employee to update.
 * @param {string} name - The new name of the employee.
 * @param {boolean} manager - The new admin status of the employee.
 * @returns {Object} 200 - The updated employee data.
 * @throws {404} - If the employee is not found.
 * @throws {500} - If the database query fails.
 */
const updateEmployee = async (req, res) => {
  const { id, name, manager } = req.body; // Extract ID, name, and manager from the request body

  try {
    // Check if the employee exists and fetch their current data
    const currentDataQuery = `SELECT name, manager FROM employee WHERE employeeid = $1`;
    const currentDataResult = await pool.query(currentDataQuery, [id]);

    if (currentDataResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get the current values
    const currentData = currentDataResult.rows[0];

    // Use provided data or fall back to existing data
    const updatedName = name || currentData.name;
    const updatedManager = manager !== undefined ? manager : currentData.manager;

    // Update the employee's details
    const updateQuery = `UPDATE employee SET name = $1, manager = $2 WHERE employeeid = $3 RETURNING *`;
    const updateValues = [updatedName, updatedManager, id];

    // Execute the update query
    const updateResult = await pool.query(updateQuery, updateValues);

    // Send the updated employee data back to the client
    res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};
app.patch('/employee/editapi', updateEmployee);




/**
 * @function deleteEmployee
 * @description Deletes an employee by their ID.
 * 
 * @route PATCH /employee/deleteapi
 * @param {string} id - The ID of the employee to delete.
 * @returns {Object} 200 - Success message and deleted employee data.
 * @throws {400} - If no employee ID is provided.
 * @throws {404} - If the employee is not found.
 * @throws {500} - If the database query fails.
 */
const deleteEmployee = async (req, res) => {
  const { id } = req.body;

  // Ensure the employee ID is provided
  if (!id) {
    return res.status(400).json({ error: "Employee ID is required" });
  }

  try {
    // Query to delete the employee
    const query = "DELETE FROM employee WHERE employeeid = $1 RETURNING *";
    const values = [id]; // Use an array for parameterized queries

    const result = await pool.query(query, values); // Execute the query

    // Check if the employee was found and deleted
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Respond with a success message and the deleted employee data
    res.status(200).json({ message: "Employee successfully deleted", data: result.rows[0] });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};
app.patch('/employee/deleteapi', deleteEmployee);



/**
 * @function addEmployee
 * @description Adds a new employee to the database.
 * 
 * @route POST /employee/postapi
 * @param {string} name - The name of the employee.
 * @param {boolean} isAdmin - Boolean value indicating whether the employee is an admin.
 * @returns {Object} 201 - Success message and the newly added employee data.
 * @throws {400} - If the name is invalid or an employee with the same name already exists.
 * @throws {500} - If the database query fails.
 */
const addEmployee = async (req, res) => {
  const { name, isAdmin } = req.body;

  // Validate input
  if (!name || typeof name !== 'string' || !name.trim() || typeof isAdmin !== 'boolean') {
      return res.status(400).json({
          error: 'Invalid input. Name is required and isAdmin must be a boolean.',
      });
  }

  try {
      // Check if an employee with the same name already exists
      const checkQuery = 'SELECT * FROM employee WHERE name = $1';
      const checkResult = await pool.query(checkQuery, [name.trim()]);

      if (checkResult.rows.length > 0) {
          // Employee with this name already exists
          return res.status(400).json({
              error: 'Employee with this name already exists.',
          });
      }

      // Insert the new employee into the database
      const insertQuery = `
          INSERT INTO employee (name, manager)
          VALUES ($1, $2)
          RETURNING *;
      `;
      const result = await pool.query(insertQuery, [name.trim(), isAdmin]);

      // Respond with success
      res.status(201).json({
          message: 'Employee added successfully',
          employee: result.rows[0],
      });
  } catch (err) {
      console.error("Error inserting new employee:", err.message, err.stack);

      // Handle specific database errors
      if (err.code === '23505') { // Unique constraint violation
          return res.status(400).json({ error: 'Employee already exists.' });
      }
      res.status(500).json({
          error: 'An error occurred while adding the employee',
      });
  }
};
app.post('/employee/postapi', addEmployee);




/**
 * @function getEmployeeIdByUsername
 * @description Retrieves an employee's ID by their username.
 * 
 * @route GET /employeeid/:username
 * @param {string} username - The username of the employee to retrieve the ID for.
 * @returns {Object} 200 - Employee ID.
 * @returns {Object} 404 - If no employee is found with the provided username.
 * @throws {500} - If the database query fails.
 */
const getEmployeeIdByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query('SELECT employeeid FROM employee WHERE username = $1', [username]);

    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Return the first matching result
    } else {
      res.status(404).json({ error: 'Employee not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database Error' });
  }
};
app.get('/employeeid/:username', getEmployeeIdByUsername);


/**
 * @function getUnfinishedOrders
 * @description Retrieves all orders that are not marked as "done" from the database.
 * 
 * @route GET /unfinishedOrders
 * @returns {Array} 200 - A list of unfinished orders.
 * @returns {Object} 500 - If the database query fails.
 */
const getUnfinishedOrders = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE isdone = false');
    res.json(result.rows); // Return the list of unfinished orders
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
};
app.get('/unfinishedOrders', getUnfinishedOrders);


/**
 * @function getCustomOrderedItems
 * @description Retrieves all custom ordered items for a specific order, including customer and item details.
 * 
 * @route GET /customeOrderedItems/:orderid
 * @param {string} orderid - The ID of the order for which custom items are requested.
 * @returns {Array} 200 - A list of custom ordered items with details such as customer, item name, quantity, and modifications.
 * @returns {Object} 500 - If the database query fails.
 */
const getCustomOrderedItems = async (req, res) => {
  const { orderid } = req.params;

  try {
    const query = `
      SELECT 
        customer.name AS customer_name, 
        orders.orderid, 
        orders.orderdate, 
        orders.ordertime, 
        orders.ordertype,        
        orderitem.quantity, 
        orderitem.price, 
        menuitem.name AS item_name,
        orderitem.modifications
      FROM orders
      JOIN customer ON orders.customerid = customer.customerid
      JOIN orderitem ON orders.orderid = orderitem.orderid
      JOIN menuitem ON orderitem.menuitemid = menuitem.menuitemid
      WHERE orders.orderid = $1;
    `;
    
    const result = await pool.query(query, [orderid]);
    res.json(result.rows); // Return the custom ordered items
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
};
app.get('/customeOrderedItems/:orderid', getCustomOrderedItems);


/**
 * @function getCompletedOrders
 * @description Retrieves all completed orders for a specific date, including customer and item details.
 * 
 * @route GET /completedOrders/:date
 * @param {string} date - The date (in 'YYYY-MM-DD' format) for which completed orders are requested.
 * @returns {Array} 200 - A list of completed orders with details such as customer, item name, quantity, and price.
 * @returns {Object} 500 - If the database query fails.
 */
const getCompletedOrders = async (req, res) => {
  const { date } = req.params; // Expecting date in 'YYYY-MM-DD' format
  try {
    const query = `
      SELECT
        customer.name AS customer_name,
        orders.orderid,
        orders.orderdate,
        orders.ordertime,
        orders.ordertype,        
        orderitem.quantity,
        orderitem.price,
        menuitem.name AS item_name
      FROM orders
      JOIN customer ON orders.customerid = customer.customerid
      JOIN orderitem ON orders.orderid = orderitem.orderid
      JOIN menuitem ON orderitem.menuitemid = menuitem.menuitemid
      WHERE orders.isdone = true AND orders.orderdate = $1;
    `;
   
    const result = await pool.query(query, [date]);
    res.json(result.rows); // Return the completed orders for the specified date
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
};
app.get('/completedOrders/:date', getCompletedOrders);




//GET for checking if a customer is already in the database
/**
 * @function getCustomers
 * @description Retrieves customer information based on phone number or returns all customers if no phone number is provided.
 * 
 * @route GET /customers
 * @param {string} phonenumber - The optional phone number query parameter to filter the customer.
 * @returns {Array} 200 - A list of customer details.
 * @returns {Object} 404 - If no customer is found with the provided phone number.
 * @returns {Object} 500 - If a database error occurs.
 */
const getCustomers = async (req, res) => {
  const { phonenumber } = req.query; // Get the phone number from query parameters

  try {
    // If a phone number is provided, search for the customer with that phone number
    if (phonenumber) {
      const result = await pool.query('SELECT * FROM customer WHERE phonenumber = $1', [phonenumber]);
      
      if (result.rows.length > 0) {
        return res.json(result.rows[0]);  // Return only the matching customer
      } else {
        return res.status(404).json({ error: 'Customer not found' });
      }
    } else {
      // If no phone number is provided, return all customers
      const result = await pool.query('SELECT * FROM customer');
      return res.json(result.rows);  // Return all customers
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error' });
  }
};
// Define the route
app.get('/customers', getCustomers);


/**
 * @function createCustomer
 * @description Adds a new customer to the database.
 * 
 * @route POST /customers
 * @param {string} name - The name of the customer to be added.
 * @param {string} phonenumber - The phone number of the customer to be added.
 * @returns {Object} 201 - The newly created customer data.
 * @returns {Object} 400 - Invalid input or customer with the same phone number already exists.
 * @returns {Object} 500 - If a database error occurs.
 */
const createCustomer = async (req, res) => {
  const { name, phonenumber } = req.body;

  try {
    // Insert the new customer into the database
    const result = await pool.query(
      'INSERT INTO customer (name, phonenumber) VALUES ($1, $2) RETURNING *',
      [name, phonenumber]
    );

    // Send the newly created customer data back to the client
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting new customer:", error);
    return res.status(500).json({ error: 'Failed to add new customer' });
  }
};
// Define the route
app.post('/customers', createCustomer);


/**
 * @function createCustomerWithAddress
 * @description Adds a new customer along with their address to the database.
 * 
 * @route POST /customers_with_address
 * @param {string} name - The name of the customer to be added.
 * @param {string} phonenumber - The phone number of the customer to be added.
 * @param {string} address - The address of the customer to be added.
 * @returns {Object} 201 - The newly created customer with address data.
 * @returns {Object} 400 - Invalid input or customer with the same phone number already exists.
 * @returns {Object} 500 - If a database error occurs.
 */
const createCustomerWithAddress = async (req, res) => {
  const { name, phonenumber, address } = req.body;

  try {
    // Insert the new customer with address into the database
    const result = await pool.query(
      'INSERT INTO customer (name, phonenumber, address) VALUES ($1, $2, $3) RETURNING *',
      [name, phonenumber, address]
    );

    // Send the newly created customer data with address back to the client
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting new customer with address:", error);
    return res.status(500).json({ error: 'Failed to add new customer with address' });
  }
};
// Define the route
app.post('/customers_with_address', createCustomerWithAddress);


/**
 * @function updateCustomerAddress
 * @description Updates the address of an existing customer in the database.
 * 
 * @route PATCH /customers/:id/address
 * @param {string} id - The ID of the customer whose address needs to be updated.
 * @param {string} address - The new address for the customer.
 * @returns {Object} 200 - The updated customer data.
 * @returns {Object} 400 - If the address is not provided in the request body.
 * @returns {Object} 404 - If the customer is not found with the provided ID.
 * @returns {Object} 500 - If a database error occurs.
 */
const updateCustomerAddress = async (req, res) => {
  const customerId = req.params.id; // Get customer ID from the URL
  const { address } = req.body; // Extract the address from the request body

  // Check if the address is provided
  if (!address) {
    return res.status(400).json({ error: 'Address is required for update' });
  }

  try {
    // Update the customer's address in the database
    const query = `UPDATE customer SET address = $1 WHERE customerid = $2 RETURNING *`;
    const values = [address, customerId];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Send the updated customer data back to the client
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating customer address:", error);
    return res.status(500).json({ error: 'Failed to update customer address' });
  }
};
// Define the route
app.patch('/customers/:id/address', updateCustomerAddress);



/**
 * @function createOrder
 * @description Creates a new order in the system with the provided customer, employee, and order details.
 * 
 * @route POST /orders
 * @param {number} customerid - The ID of the customer placing the order.
 * @param {number} employeeid - The ID of the employee processing the order.
 * @param {string} orderdate - The date of the order.
 * @param {string} ordertime - The time of the order.
 * @param {number} total - The total amount of the order.
 * @param {string} ordertype - The type of the order (e.g., 'takeout', 'dine-in').
 * @returns {Object} 201 - The newly created order with the generated order ID.
 * @returns {Object} 400 - If any required fields are missing in the request.
 * @returns {Object} 500 - If a database error occurs.
 */
const createOrder = async (req, res) => {
  const { customerid, employeeid, orderdate, ordertime, total, ordertype } = req.body;

  try {
    // Validate required fields
    if (!customerid) {
      return res.status(400).json({ error: 'Missing required field: customerid' });
    }
    if (!employeeid) {
      return res.status(400).json({ error: 'Missing required field: employeeid' });
    }
    if (!orderdate) {
      return res.status(400).json({ error: 'Missing required field: orderdate' });
    }
    if (!ordertime) {
      return res.status(400).json({ error: 'Missing required field: ordertime' });
    }
    if (total === undefined) {
      return res.status(400).json({ error: 'Missing required field: total' });
    }
    if (!ordertype) {
      return res.status(400).json({ error: 'Missing required field: ordertype' });
    }

    // Insert the order into the database
    const result = await pool.query(
      'INSERT INTO orders (customerid, employeeid, orderdate, ordertime, totalamount, ordertype) VALUES ($1, $2, $3, $4, $5, $6) RETURNING orderid',
      [customerid, employeeid, orderdate, ordertime, total, ordertype]
    );

    // Retrieve the newly inserted order ID
    const newOrder = result.rows[0];

    // Respond with the new order details including order ID
    return res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error inserting order:", error);
    return res.status(500).json({ error: 'Database error' });
  }
};
// Define the route
app.post('/orders', createOrder);



/**
 * @function createOrderItem
 * @description Adds a new order item to the database, including order ID, menu item ID, modifications, price, and quantity.
 * 
 * @route POST /orderitems
 * @param {number} orderid - The ID of the order the item is associated with.
 * @param {number} menuitemid - The ID of the menu item being added to the order.
 * @param {string} [modifications] - Optional modifications made to the item.
 * @param {number} price - The price of the menu item.
 * @param {number} quantity - The quantity of the menu item.
 * @returns {Object} 201 - Success message if the order item is successfully added.
 * @returns {Object} 400 - If any required fields are missing in the request.
 * @returns {Object} 500 - If a database error occurs.
 */
const createOrderItem = async (req, res) => {
  const { orderid, menuitemid, modifications, price, quantity } = req.body;

  try {
    // Validate required fields
    if (!orderid || !menuitemid || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'Missing required order item fields' });
    }

    // Insert the order item into the database
    await pool.query(
      'INSERT INTO orderitem (orderid, menuitemid, modifications, price, quantity) VALUES ($1, $2, $3, $4, $5)',
      [orderid, menuitemid, modifications, price, quantity]
    );

    // Respond with success message
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error inserting order item:", error);
    return res.status(500).json({ error: 'Database error' });
  }
};
// Define the route
app.post('/orderitems', createOrderItem);


/**
 * @function getMenuItemInventory
 * @description Retrieves inventory details for a specified menu item.
 * 
 * @route GET /menuitem_inventory
 * @param {string} menuitemid - The ID of the menu item to retrieve inventory for.
 * @returns {Array} 200 - A list of inventory details (inventory ID and quantity needed) for the menu item.
 * @returns {Object} 404 - If no inventory is found for the provided menu item ID.
 * @returns {Object} 500 - If a database error occurs.
 */
const getMenuItemInventory = async (req, res) => {
  const { menuitemid } = req.query; // Extract menu item ID from query parameters

  try {
    const query = `
      SELECT inventoryid, quantity_needed
      FROM menuitem_inventory
      WHERE menuitemid = $1
    `;
    const result = await pool.query(query, [menuitemid]);

    if (result.rows.length > 0) {
      return res.status(200).json(result.rows); // Return the inventory details
    } else {
      return res.status(404).json({ error: 'No inventory found for this menu item.' });
    }
  } catch (error) {
    console.error('Error fetching menu item inventory:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
// Define the route
app.get('/menuitem_inventory', getMenuItemInventory);


/**
 * @function updateInventory
 * @description Updates the inventory quantity by incrementing it for a specific inventory item.
 * 
 * @route PATCH /inventory/:id
 * @param {string} id - The ID of the inventory item to update.
 * @param {number} quantity - The amount to increment the inventory by.
 * @returns {Object} 200 - A message confirming successful inventory update and the updated inventory details.
 * @returns {Object} 404 - If the inventory item with the given ID is not found.
 * @returns {Object} 500 - If a database error occurs.
 */
const updateInventory = async (req, res) => {
  const inventoryId = req.params.id; // Get inventory ID from the URL
  const { quantity } = req.body; // Get the quantity from the request body

  try {
    // Increment the inventory quantity
    const query = `
      UPDATE inventory
      SET quantity = quantity + $1  -- Incrementing the quantity
      WHERE inventoryid = $2
      RETURNING *
    `;
    const result = await pool.query(query, [quantity, inventoryId]);

    if (result.rows.length > 0) {
      return res.status(200).json({ message: 'Inventory updated successfully', inventory: result.rows[0] });
    } else {
      return res.status(404).json({ error: 'Inventory item not found.' });
    }
  } catch (error) {
    console.error('Error updating inventory:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
// Define the route
app.patch('/inventory/:id', updateInventory);





/**
 * @function updateOrderStatus
 * @description Updates the status of an order (i.e., whether it's done or not) based on the provided `orderid`.
 * 
 * @route POST /updateOrderStatus/:orderid
 * @param {string} orderid - The ID of the order to update.
 * @param {boolean} isdone - The status to set for the order (true if done, false if not).
 * @returns {Object} 200 - A success message indicating the order status was updated.
 * @returns {Object} 500 - If a database error occurs while updating the order status.
 */
const updateOrderStatus = async (req, res) => {
  const { orderid } = req.params; // Get order ID from URL parameter
  const { isdone } = req.body; // Get the new status (true or false) from the request body

  try {
    // Update the order's status in the database
    const query = `UPDATE orders SET isdone = $1 WHERE orderid = $2`;
    await pool.query(query, [isdone, orderid]);

    // Respond with a success message
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error updating order status' });
  }
};
// Define the route
app.post('/updateOrderStatus/:orderid', updateOrderStatus);




// Backend: Analytics Data Endpoint
/**
 * @function getAnalytics
 * @description Retrieves analytics data, including total sales, top customers, popular items, employee order counts, and the busiest hour.
 * 
 * @route GET /analytics
 * @returns {Object} 200 - An object containing the analytics data:
 *   - totalSales: Total sales amount rounded to two decimal places.
 *   - topFrequentCustomers: A list of the top 3 customers based on order count.
 *   - popularItems: A list of the top 3 most popular menu items.
 *   - employeeOrderCounts: A list of employees and the number of orders they handled.
 *   - topBusyHour: The hour of the day with the highest number of orders.
 * @returns {Object} 500 - If a database error occurs while fetching the analytics data.
 */
const getAnalytics = async (req, res) => {
  try {
    // Queries for analytics data
    const [
      totalSalesResult,
      topFrequentCustomersResult,
      popularItemsResult,
      employeeOrderCountsResult,
      topBusyHourResult
    ] = await Promise.all([
      pool.query(`SELECT ROUND(SUM(totalamount::numeric), 2) AS total_sales FROM orders`),
      pool.query(`SELECT c.name, COUNT(o.customerid) AS order_count FROM orders o 
                  JOIN customer c ON o.customerid = c.customerid 
                  GROUP BY c.name 
                  ORDER BY order_count DESC LIMIT 3`),
      pool.query(`SELECT m.name, COUNT(*) AS item_count FROM orderitem oi 
                  JOIN menuitem m ON oi.menuitemid = m.menuitemid 
                  GROUP BY m.name 
                  ORDER BY item_count DESC LIMIT 3`),
      pool.query(`SELECT e.name, COALESCE(COUNT(o.orderid), 0) AS order_count FROM employee e 
                  LEFT JOIN orders o ON e.employeeid = o.employeeid 
                  GROUP BY e.name 
                  ORDER BY order_count DESC`),
      pool.query(`SELECT EXTRACT(HOUR FROM ordertime) AS hour, COUNT(*) AS order_count 
                  FROM orders GROUP BY hour ORDER BY order_count DESC LIMIT 1`),
    ]);

    // Build response with proper formatting
    const analyticsData = {
      totalSales: totalSalesResult.rows[0].total_sales, 
      topFrequentCustomers: topFrequentCustomersResult.rows,
      popularItems: popularItemsResult.rows,
      employeeOrderCounts: employeeOrderCountsResult.rows,
      topBusyHour: topBusyHourResult.rows[0].hour, 
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ error: 'Database error fetching analytics data' });
  }
};
// Define the route
app.get('/analytics', getAnalytics);


/**
 * @function isWithinOrderRange
 * @description Checks if there are any orders within the specified date and time range.
 * 
 * @param {string} startDateTime - The start of the date and time range in ISO format (e.g., "YYYY-MM-DD HH:MM:SS").
 * @param {string} endDateTime - The end of the date and time range in ISO format (e.g., "YYYY-MM-DD HH:MM:SS").
 * @returns {boolean} true - If there are orders within the specified date and time range.
 * @returns {boolean} false - If no orders are found within the specified range or an error occurs.
 */
const isWithinOrderRange = async (startDateTime, endDateTime) => {
  const query = `
      SELECT COUNT(*) AS count
      FROM orders
      WHERE (orderdate + ordertime) BETWEEN $1 AND $2
  `;
  try {
      const result = await pool.query(query, [startDateTime, endDateTime]);
      const count = result.rows[0].count;
      return count > 0; // True if data exists within the range
  } catch (error) {
      console.error(error);
      return false;
  }
};

/**
 * @function getProductUsage
 * @description Retrieves the total quantity of inventory items used based on orders within a specified date and time range.
 * 
 * @route GET /product-usage
 * @param {string} startDateTime - The start date and time in ISO format (e.g., "YYYY-MM-DD HH:MM:SS").
 * @param {string} endDateTime - The end date and time in ISO format (e.g., "YYYY-MM-DD HH:MM:SS").
 * @returns {Object} 200 - A list of inventory items and their total quantity used, ordered by most used.
 * @returns {Object} 404 - If no data is found within the specified date and time range.
 * @returns {Object} 500 - If an internal server error occurs.
 */
const getProductUsage = async (req, res) => {
  const { startDateTime, endDateTime } = req.query;

  try {
    // Check if the time range contains data
    const isValidRange = await isWithinOrderRange(startDateTime, endDateTime);
    if (!isValidRange) {
        return res.status(404).json({ message: 'No data found within the specified range.' });
    }

    const query = `
        SELECT i.itemname, SUM(oi.quantity * mi.quantity_needed) AS total_quantity_used
        FROM orders o
        JOIN orderitem oi ON o.orderid = oi.orderid
        JOIN menuitem_inventory mi ON oi.menuitemid = mi.menuitemid
        JOIN inventory i ON mi.inventoryid = i.inventoryid
        WHERE (o.orderdate + o.ordertime) BETWEEN TO_TIMESTAMP($1, 'YYYY-MM-DD HH24:MI:SS') AND TO_TIMESTAMP($2, 'YYYY-MM-DD HH24:MI:SS')
        GROUP BY i.itemname
        ORDER BY total_quantity_used DESC;
    `;

    const result = await pool.query(query, [startDateTime, endDateTime]);

    // Send result as JSON
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
// Define the route
app.get('/product-usage', getProductUsage);



/**
 * @function getSalesPerHour
 * @description Retrieves the total sales for each hour of the day for a specific date.
 * 
 * @route GET /sales-per-hour
 * @param {string} date - The date in 'YYYY-MM-DD' format (from query parameters).
 * @returns {Object} 200 - A key-value pair where keys are hours (0-23) and values are total sales for each hour.
 * @returns {Object} 400 - If the date parameter is missing.
 * @returns {Object} 500 - If an internal server error occurs.
 */
const getSalesPerHour = async (req, res) => {
  const { date } = req.query; // Expecting date in 'YYYY-MM-DD' format from query parameters

  if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
  }

  const query = `
      SELECT EXTRACT(HOUR FROM ordertime) AS hour, SUM(totalamount) AS total
      FROM orders
      WHERE orderdate = $1
      GROUP BY EXTRACT(HOUR FROM ordertime)
      ORDER BY hour;
  `;

  try {
      const result = await pool.query(query, [date]);

      const salesByHour = {};
      result.rows.forEach(row => {
          salesByHour[row.hour] = parseFloat(row.total);
      });

      res.json(salesByHour);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};
// Define the route
app.get('/sales-per-hour', getSalesPerHour);




app.listen(3001, () => {
  console.log('Server running on port 3001');
});

