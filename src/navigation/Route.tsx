import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import Activate from '../screens/Activate/Activate';
import BlackList from '../screens/BlackList';
import ConfirmOtp from '../screens/ConfirmOtp';
import FixedTrip from '../screens/FixedTrip';
import ForgotPassword from '../screens/ForgotPassword';
import Home from '../screens/Home';
import Loading from '../screens/Loading';
import Login from '../screens/Login';
import Message from '../screens/Message/Message';
import Profile from '../screens/Profile';
import Register from '../screens/Register';
import ResetPassword from '../screens/ResetPassword/ResetPassword';
import Schedule from '../screens/Schedule';
import Splash from '../screens/Splash';
import TripDetail from '../screens/TripDetail';
import TripHistory from '../screens/TripHistory';
import Welcome from '../screens/Welcome';

const Stack = createStackNavigator();

const Route = () => {
    return (
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={Splash} />
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} /> 
            <Stack.Screen name="Activate" component={Activate} /> 
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="TripDetail" component={TripDetail} />
            <Stack.Screen name="Message" component={Message} />
            <Stack.Screen name="Schedule" component={Schedule} />
            <Stack.Screen name="Loading" component={Loading} />
            <Stack.Screen name="Profile" component={Profile as any} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="ConfirmOtp" component={ConfirmOtp} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
            <Stack.Screen name="FixedTrip" component={FixedTrip} />
            <Stack.Screen name="BlackList" component={BlackList} />
            <Stack.Screen name="TripHistory" component={TripHistory} />
        </Stack.Navigator>
    );
}

export default Route;