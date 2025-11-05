import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './contexts/AuthContext';
import "./global.css"
import LoginView from './views/Login/LoginView';
import Home from './views/Home/Home';
import RegistroView from './views/Registro/RegistroView';
import ProfileView from './views/Profile/ProfileView';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="Login" component={LoginView} />
          <Stack.Screen name="Registro" component={RegistroView} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Profile" component={ProfileView} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
