import React, { useEffect } from 'react'
import LoginCard from '../../components/LoginCard/LoginCard'
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import type { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function LoginView() {
  const navigation = useNavigation<NavigationProp>();
  const { user, loading } = useAuth();

  // Verificar si ya hay sesión activa y redirigir al Home
  useEffect(() => {
    if (!loading && user) {
      console.log("Usuario ya autenticado, redirigiendo a Home...");
      navigation.replace('Home');
    }
  }, [user, loading, navigation]);

  const redirectAfterLogin = () => {
    // Aquí puedes agregar lógica adicional si es necesario
    console.log("Redirigiendo después del login...");
    navigation.navigate('Home');
  }

  const redirectRegistro = () => {
    // Aquí puedes agregar lógica adicional si es necesario
    console.log("Redirigiendo a la página de registro...");
    navigation.navigate('Registro');
  }

  // Si está cargando, no mostrar nada o mostrar un loader
  if (loading) {
    return null;
  }

  return (
    <LoginCard
      onNavigateToRegister={redirectRegistro}
      onLoginSuccess={redirectAfterLogin}
    />
  )
}

export default LoginView