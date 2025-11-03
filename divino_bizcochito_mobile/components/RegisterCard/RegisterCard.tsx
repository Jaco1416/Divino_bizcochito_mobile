import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface RegisterCardProps {
  onBack: () => void;
}

export default function RegisterCard({ onBack }: RegisterCardProps) {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');

  const handleRegistro = () => {
    console.log('Registrarse', { 
      usuario, 
      contraseña, 
      confirmarContraseña, 
      numeroTelefono, 
      correoElectronico 
    });
    // Aquí puedes agregar la lógica de registro
  };

  return (
    <View className="flex-1 bg-bizcochito-beige justify-center items-center px-5">
      <TouchableOpacity 
        className="absolute top-10 left-5 z-10"
        onPress={onBack}
      >
        <View className="bg-bizcochito-red w-12 h-12 rounded-full justify-center items-center shadow-md">
          <Text className="text-white text-3xl font-bold">←</Text>
        </View>
      </TouchableOpacity>

      <View className="bg-bizcochito-red rounded-2xl p-8 w-full max-w-md shadow-lg">
        <Text className="text-2xl font-bold text-white text-center mb-6">
          Registro
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
            placeholder="Ej: asd123@1ASDcz"
            placeholderTextColor="#999"
            value={contraseña}
            onChangeText={setContraseña}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <Text className="text-white text-sm mb-2 font-medium">Confirmar contraseña</Text>
          <TextInput
            className="bg-white rounded px-3 py-3 text-sm text-gray-800"
            placeholder="Ej: asd123@1ASDcz"
            placeholderTextColor="#999"
            value={confirmarContraseña}
            onChangeText={setConfirmarContraseña}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <Text className="text-white text-sm mb-2 font-medium">Número de teléfono</Text>
          <TextInput
            className="bg-white rounded px-3 py-3 text-sm text-gray-800"
            placeholder="Ej: 3127821982"
            placeholderTextColor="#999"
            value={numeroTelefono}
            onChangeText={setNumeroTelefono}
            keyboardType="phone-pad"
          />
        </View>

        <View className="mb-4">
          <Text className="text-white text-sm mb-2 font-medium">Correo electrónico</Text>
          <TextInput
            className="bg-white rounded px-3 py-3 text-sm text-gray-800"
            placeholder="ejemplo@correo.com"
            placeholderTextColor="#999"
            value={correoElectronico}
            onChangeText={setCorreoElectronico}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          className="bg-bizcochito-dark-red rounded px-3 py-3.5 mt-2"
          onPress={handleRegistro}
        >
          <Text className="text-white text-base font-bold text-center">
            Registrarse
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
