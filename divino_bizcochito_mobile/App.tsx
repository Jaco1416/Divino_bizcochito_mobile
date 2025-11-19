import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './contexts/AuthContext';
import "./global.css"
import LoginView from './views/Login/LoginView';
import Home from './views/Home/home';
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
import PedidoView from './views/Pedido/PedidoView';
import { usePushNotifications } from './hooks/usePushNotifications';
import { supabase } from './libs/supabaseClient';
import type { Session } from '@supabase/supabase-js';

Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> =>
    ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    } as Notifications.NotificationBehavior),
});

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  usePushNotifications((token) => {
    setExpoPushToken(token);
  });

  useEffect(() => {
    const initializeSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
    };

    initializeSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (expoPushToken) {
      console.log("✅ Expo push token registrado:", expoPushToken);
      const API_URL = process.env.EXPO_PUBLIC_API_URL;

      if (!API_URL) {
        console.warn("⚠️ No se encontró EXPO_PUBLIC_API_URL, omitiendo registro del token.");
        return;
      }

      if (!session) {
        console.log('⏳ Token pendiente de sincronizar hasta que exista una sesión.');
        return;
      }

      const registerPushToken = async () => {
        try {
          const userId = session.user.id;

          const response = await fetch(`${API_URL}/push/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: expoPushToken,
              userId,
            }),
          });

          if (!response.ok) {
            const message = await response.text();
            throw new Error(`HTTP ${response.status}: ${message}`);
          }

          console.log("📬 Token push sincronizado con el backend.");
        } catch (error) {
          console.error("❌ Error al enviar el token push al backend:", error);
        }
      };

      registerPushToken();
    }
  }, [expoPushToken, session]);

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
          <Stack.Screen name="PedidoDetalle" component={PedidoView} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
