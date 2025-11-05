import React from 'react'
import LoginCard from '../../components/LoginCard/LoginCard'
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function LoginView() {
  const navigation = useNavigation<NavigationProp>();

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


  return (
    <LoginCard
      onNavigateToRegister={redirectRegistro}
      onLoginSuccess={redirectAfterLogin}
    />
  )
}

export default LoginView