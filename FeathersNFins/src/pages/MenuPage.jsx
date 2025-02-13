import React, { useState, useEffect } from 'react';
import styles from "./MenuPage.module.css";
import 'bootstrap/dist/css/bootstrap.css';
import specialImage from '../assets/image/special.png';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import vegetarianIcon from '../assets/image/vegetarian.png'; 
import LanguageSelector from '../components/LanguageSelector';
import TranslateText from '../components/TranslateText';

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [menuHighContrast, setMenuHighContrast] = useState(false);
  const [showAccessibilityOptions, setShowAccessibilityOptions] = useState(false);
  const [fontSize, setFontSize] = useState(30);

  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    console.log('Auth State:', { isAuthenticated, user });
  }, [isAuthenticated, user]);
  
  const getItemsByCategory = (category) => {
    return menuItems.filter(item => item.category === category);
  };

  useEffect(() => {
    fetch('https://project-3-a7za.onrender.com/menu')
      .then(response => response.json())
      .then(data => setMenuItems(data))
      .catch(error => console.error('Error fetching menu items:', error));
  }, []);

  const toggleAccessibilityOptions = () => {
    setShowAccessibilityOptions(prev => !prev);
  };

  const toggleHighContrastMode = () => {
    setMenuHighContrast(prev => !prev);
  };

  const handleFontIncrease = () => {
    setFontSize(prevSize => Math.min(prevSize + 2, 40));
  };

  const handleFontDecrease = () => {
    setFontSize(prevSize => Math.max(prevSize - 2, 20));
  };

  // Calculate font sizes for different elements
  const getFontSizes = () => {
    return {
      menuItem: `${fontSize * 0.45}px`,
      menuItemName: `${fontSize * 1.15}px`,
      menuItemDescription: `${fontSize * 0.65}px`,
      menuItemPrice: `${fontSize * 1.05}px`,
      specialBadge: `${fontSize}px`,
      specialTitle: `${fontSize * 1.15}px`,
      specialDescription: `${fontSize * 0.55}px`,
      specialPrice: `${fontSize * 1.05}px`,
    };
  };

  const fontSizes = getFontSizes();

  const renderMenuItems = (category) => {
    return getItemsByCategory(category).map(item => {
      return (
        <div className={styles.menuItem} key={item.menuitemid}>
          <div className={styles.menuItemName} style={{ fontSize: fontSizes.menuItemName }}>
            <TranslateText>{item.name}</TranslateText>
            {item.isvegetarian && (
              <img 
                src={vegetarianIcon} 
                alt="Vegetarian" 
                className={styles.vegetarianIcon} 
              />
            )}
          </div>
          <div className={styles.menuItemDescription} style={{ fontSize: fontSizes.menuItemDescription }}>
            <TranslateText>{item.description || "No description available"}</TranslateText>
          </div>
          <div className={styles.menuItemPrice} style={{ fontSize: fontSizes.menuItemPrice }}>
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

  const renderSpecialItems = () => {
    const specialItem = getItemsByCategory('Special')[0];
  
    if (!specialItem) {
      return null;
    }
  
    return (
      <div className={styles.specialSection}>
        <div className={styles.featuredSpecial}>
          <div className={styles.imageContainer}>
            <img 
              src={specialImage} 
              alt={`${specialItem.name} Special`} 
              className={styles.featuredImage}
            />
            <div className={styles.imageOverlay} />
          </div>
          
          <div className={styles.specialBadge} style={{ fontSize: fontSizes.specialBadge }}>
            <TranslateText>Special!</TranslateText>
          </div>
          
          <div className={styles.contentOverlay}>
            <h3 className={styles.specialTitle} style={{ fontSize: fontSizes.specialTitle }}>
              <TranslateText>{specialItem.name}</TranslateText>
            </h3>
            <p className={styles.specialDescription} style={{ fontSize: fontSizes.specialDescription }}>
              <TranslateText>{specialItem.description || "No description available"}</TranslateText>
            </p>
            <p className={styles.specialPrice} style={{ fontSize: fontSizes.specialPrice }}>
              ${specialItem.price.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className={`${styles.chalkboardContainer} ${menuHighContrast ? styles.menuHighContrast : ''}`}>
        <div className={styles.chalkboard}>
          <div className={styles.topSection}>
            <div className={styles.menuColumn}>
              <h2 className={styles.categoryTitle}>
                <TranslateText>Chicken</TranslateText>
              </h2>
              <div className={styles.categorySection}>
                {renderMenuItems('Chicken')}
              </div>
            </div>

            <div className={styles.menuColumn}>
              <h2 className={styles.categoryTitle}>
                <TranslateText>Special</TranslateText>
              </h2>
              <div className={styles.specialSection}>
                {renderSpecialItems()}
              </div>
            </div>

            <div className={styles.menuColumn}>
              <h2 className={styles.categoryTitle}>
                <TranslateText>Fish</TranslateText>
              </h2>
              <div className={styles.categorySection}>
                {renderMenuItems('Fish')}
              </div>
            </div>
          </div>

          <div className={styles.bottomSection}>
            <div className={styles.menuColumn}>
              <h2 className={styles.categoryTitle}>
                <TranslateText>Sides/Extras</TranslateText>
              </h2>
              <div className={styles.categorySection}>
                {renderMenuItems('Sides/Extras')}
              </div>
            </div>

            <div className={styles.menuColumn}>
              <h2 className={styles.categoryTitle}>
                <TranslateText>Drinks</TranslateText>
              </h2>
              <div className={styles.categorySection}>
                {renderMenuItems('Drink')}
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Controls */}
        <div className={styles.menuAccessibilityContainer}>
          <button 
            onClick={toggleAccessibilityOptions} 
            className={styles.menuAccessibilityButton}
            aria-label="Accessibility Options"
          >
            <i className="bi bi-universal-access"></i>
          </button>
          
          {showAccessibilityOptions && (
            <div className={`${styles.menuAccessibilityPopup} ${menuHighContrast ? styles.menuHighContrast : ''}`}>
              <h4><TranslateText>Accessibility Options</TranslateText></h4>
              <div className={styles.fontSizeButtons}>
                <button onClick={handleFontDecrease}>
                  <TranslateText>A-</TranslateText>
                </button>
                <button onClick={handleFontIncrease}>
                  <TranslateText>A+</TranslateText>
                </button>
              </div>
              <button onClick={toggleHighContrastMode}>
                <TranslateText>
                  {menuHighContrast ? "Disable High Contrast" : "Enable High Contrast"}
                </TranslateText>
              </button>
              <button onClick={() => setShowAccessibilityOptions(false)}>
                <TranslateText>Close</TranslateText>
              </button>
            </div>
          )}
        </div>

        <div className={styles.vegetarianLegend}
        style={{fontSize: `${fontSize * 0.55}px`}}
        >
          <img 
            src={vegetarianIcon} 
            alt="Vegetarian Icon" 
            className={styles.legendIcon}
            style={{ 
              width: `${fontSize * 0.45}px`, 
              height: `${fontSize * 0.45}px` 
            }} 
          />
          <span>
            <TranslateText>Vegetarian Option</TranslateText>
          </span>
        </div>
      </div>
    </>
  );
}

export default MenuPage;