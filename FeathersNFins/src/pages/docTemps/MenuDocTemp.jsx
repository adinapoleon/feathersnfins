import React, { useState, useEffect } from 'react';
import styles from "./MenuPage.module.css";
import 'bootstrap/dist/css/bootstrap.css';
import specialImage from '../assets/image/special.png';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import vegetarianIcon from '../assets/image/vegetarian.png'; 
import LanguageSelector from '../components/LanguageSelector';
import TranslateText from '../components/TranslateText';



  const [menuItems, setMenuItems] = useState([]);

  const { isAuthenticated, user } = useAuth();

  /**
 * Logs authentication state whenever it changes.
 * Runs on each change to `isAuthenticated` or `user`.
 */
  useEffect(() => {
    console.log('Auth State:', { isAuthenticated, user });
  }, [isAuthenticated, user]);
  /**
 * Filters the menu items based on a given category.
 * @param {string} category - The category of the menu items to filter (e.g., 'Special')
 * @returns {Array} - An array of menu items belonging to the specified category
 */
  const getItemsByCategory = (category) => {
    return menuItems.filter(item => item.category === category);
  };

  // http://localhost:3001/menu
  // https://project-3-a7za.onrender.com/menu
  useEffect(() => {
    fetch('https://project-3-a7za.onrender.com/menu')
      .then(response => response.json())
      .then(data => setMenuItems(data))
      .catch(error => console.error('Error fetching menu items:', error));
  }, []);
  /**
 * Renders menu items for a specific category.
 * @param {string} category - The category of the items to be rendered (e.g., 'Special')
 * @returns {JSX.Element[]} - An array of JSX elements for each item in the category
 */
  const renderMenuItems = (category) => {
    return getItemsByCategory(category).map(item => {
      console.log(`Rendering ${item.name}: Vegetarian =`, item.isvegetarian);
      return (
        <div className={styles.menuItem} key={item.menuitemid}>
          <div className={styles.menuItemName}>
            <TranslateText>{item.name}</TranslateText>
            {item.isvegetarian && (
              <img 
                src={vegetarianIcon} 
                alt="Vegetarian" 
                className={styles.vegetarianIcon} 
              />
            )}
          </div>
          <div className={styles.menuItemDescription}>
            <TranslateText>{item.description || "No description available"}</TranslateText>
          </div>
          <div className={styles.menuItemPrice}>
            {item.price === 0 ? (
              <p><TranslateText>Sold Out</TranslateText></p>
            ) : (
              `$${item.price.toFixed(2)}`
            )}
          </div>
        </div>
      );
    });
  };
  /**
    * Renders a featured special item from the menu.
    * @returns {JSX.Element|null} - JSX element for the special item or null if no special item is found
    */
  const renderSpecialItems = () => {
    // Get first special item from database
    const specialItem = getItemsByCategory('Special')[0];
  
    if (!specialItem) {
      return null;
    }
  
    return (
      <div className={styles.specialSection}>
        {/* Featured Special */}
        <div className={styles.featuredSpecial}>
          <div className={styles.imageContainer}>
            <img 
              src={specialImage} 
              alt={`${specialItem.name} Special`} 
              className={styles.featuredImage}
            />
            <div className={styles.imageOverlay} />
          </div>
          
          <div className={styles.specialBadge}>
            <TranslateText>Special!</TranslateText>
          </div>
          
          <div className={styles.contentOverlay}>
            <h3 className={styles.specialTitle}><TranslateText>{specialItem.name}</TranslateText></h3>
            <p className={styles.specialDescription}>
              <TranslateText>{specialItem.description || "No description available"}</TranslateText>
            </p>
            <p className={styles.specialPrice}>${specialItem.price.toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  };



export default MenuPage;