import React from 'react';
// import PostStore from './src/screens/Home/Global/PostStore'; // Import PostStore
import AppNavigator from './src/navigation/NavigationContainer';
// import mobileAds from 'react-native-google-mobile-ads';
import setupRequestInterceptor from "./src/networking/requestInterceptor";
import setupResponseInterceptor from "./src/networking/responseInterceptor";



export default function App() {
  setupRequestInterceptor(); 
  setupResponseInterceptor();

  return (
      <AppNavigator />
  );
}
