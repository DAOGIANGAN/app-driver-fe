import React from 'react';
// import PostStore from './src/screens/Home/Global/PostStore'; // Import PostStore
import AppNavigator from './src/navigation/NavigationContainer';
// import mobileAds from 'react-native-google-mobile-ads';
import setupRequestInterceptor from "./src/networking/requestInterceptor";
import setupResponseInterceptor from "./src/networking/responseInterceptor";



export default function App() {
  setupRequestInterceptor(); 
  setupResponseInterceptor();
  // // Initialize Google Mobile Ads SDK
  // useEffect(() => {
  //   const initializeAds = async () => {
  //     try {
  //       await mobileAds().initialize();
  //       console.log('Google Mobile Ads SDK initialized successfully');
  //     } catch (error) {
  //       console.error('Failed to initialize Google Mobile Ads SDK:', error);
  //     }
  //   };
  //   initializeAds();
  // }, []);

  return (
      <AppNavigator />
  );
}
