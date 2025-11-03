import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface LoginCardProps {
  onNavigateToRegister: () => void;
  onLogin: () => void;
}

export default function LoginCard({ onNavigateToRegister, onLogin }: LoginCardProps) {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');

  const handleLogin = () => {
    console.log('Iniciar sesión', { usuario, contraseña });
    // Aquí puedes agregar la lógica de autenticación
    onLogin();
  };

  return (
    <View className="flex-1 bg-bizcochito-beige justify-center items-center px-5">
      <View className="bg-bizcochito-red rounded-2xl p-8 w-full max-w-md shadow-lg">
        <Text className="text-2xl font-bold text-white text-center mb-6">
          Iniciar sesión
        </Text>
        
        <View className="mb-4">
          <Text className="text-white text-sm mb-2 font-medium">Usuario</Text>
          <TextInput
            className="bg-white rounded px-3 py-3 text-sm text-gray-800"
            placeholder="nombre.usuario"
            placeholderTextColor="#999"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <Text className="text-white text-sm mb-2 font-medium">Contraseña</Text>
          <TextInput
            className="bg-white rounded px-3 py-3 text-sm text-gray-800"
            placeholder="nombre.contraseña"
            placeholderTextColor="#999"
            value={contraseña}
            onChangeText={setContraseña}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          className="bg-bizcochito-dark-red rounded px-3 py-3.5 mt-2 mb-3"
          onPress={handleLogin}
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
