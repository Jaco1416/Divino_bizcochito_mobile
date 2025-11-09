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
import RecetasView from './views/Recetas/RecetasView';
import CrearRecetaView from './views/Recetas/CrearRecetaView';
import DetalleRecetaView from './views/Recetas/DetalleRecetaView';
import CatalogView from './views/Catalog/CatalogView';
import type { RootStackParamList } from './types/navigation';
import DetalleProducto from './views/Catalog/DetalleProducto';
import CartView from './views/Cart/CartView';
import PagoView from './views/Pago/PagoView';
import ResultadoPagoView from './views/Result/ResultadoPagoView';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
          <Stack.Screen name="Recetas" component={RecetasView} />
          <Stack.Screen name="CrearReceta" component={CrearRecetaView} />
          <Stack.Screen name="DetalleReceta" component={DetalleRecetaView} />
          <Stack.Screen name="DetalleProducto" component={DetalleProducto} />
          <Stack.Screen name="Catalogo" component={CatalogView} />
          <Stack.Screen name="Carrito" component={CartView} />
          <Stack.Screen name="PagoView" component={PagoView} />
          <Stack.Screen name="ResultadoPago" component={ResultadoPagoView} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
