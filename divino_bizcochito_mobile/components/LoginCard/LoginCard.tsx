import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface LoginCardProps {
  onNavigateToRegister: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginCard({ onNavigateToRegister, onLoginSuccess }: LoginCardProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin } = useAuth();

  const handleLoginSubmit = async () => {
    try {
      const { error } = await handleLogin(email, password);
      
      if (error) {
        alert('Error al iniciar sesión: ' + error.message);
      } else {
        console.log('✅ Inicio de sesión exitoso');
        onLoginSuccess?.();
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      alert('Error al iniciar sesión');
    }
  };

  return (
    <View className="flex-1 bg-bizcochito-beige justify-center items-center px-5">
      <View className="bg-bizcochito-red rounded-2xl p-8 w-full max-w-md shadow-lg">
        <Text className="text-2xl font-bold text-white text-center mb-6">
          Iniciar sesión
        </Text>
        
        <View className="mb-4">
          <Text className="text-white text-sm mb-2 font-medium">Email</Text>
          <TextInput
            className="bg-white rounded px-3 py-3 text-sm text-gray-800"
            placeholder="Ingresa tu email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="mb-4">
          <Text className="text-white text-sm mb-2 font-medium">Contraseña</Text>
          <TextInput
            className="bg-white rounded px-3 py-3 text-sm text-gray-800"
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          className="bg-bizcochito-dark-red rounded px-3 py-3.5 mt-2 mb-3"
          onPress={handleLoginSubmit}
        >
          <Text className="text-white text-base font-bold text-center">
            Iniciar sesión
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-bizcochito-dark-red rounded px-3 py-3.5"
          onPress={onNavigateToRegister}
        >
          <Text className="text-white text-base font-semibold text-center">
            Registrarse
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
