import React from 'react'
import RegisterCard from '../../components/RegisterCard/RegisterCard'
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function RegistroView() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <RegisterCard onBack={() => navigation.navigate('Login')}/>
  )
}

export default RegistroView