import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';

interface ProfileCardProps {
  onEditPress?: () => void;
}


type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  Home: undefined;
  Profile: undefined;
};

export default function ProfileCard({ onEditPress }: ProfileCardProps) {
  const { user, perfil, handleLogout } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLogoutPress = async () => {
    try {
      await handleLogout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <View className="bg-bizcochito-beige rounded-3xl p-6 m-4 shadow-lg items-center">
      {/* Imagen de perfil */}
      <View className="bg-white rounded-full w-32 h-32 mb-4 items-center justify-center overflow-hidden">
        {perfil?.imagen ? (
          <Image
            source={{ uri: perfil.imagen }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <FontAwesome5 name="user" size={60} color="#FFFFFF" />
        )}
      </View>

      {/* Nombre del usuario */}
      <Text className="text-2xl font-bold text-gray-900 mb-1">
        {perfil?.nombre || 'Usuario'}
      </Text>

      {/* Rol/Tipo de usuario */}
      <Text className="text-gray-600 text-base mb-4">
        {perfil?.rol || 'Cliente'}
      </Text>

      {/* Email */}
      <View className="flex-row items-center mb-2">
        <MaterialIcons name="email" size={18} color="#C74444" />
        <Text className="text-gray-700 ml-2">
          {user?.email || 'Sin email'}
        </Text>
      </View>

      {/* Teléfono */}
      <View className="flex-row items-center mb-4">
        <Ionicons name="call" size={18} color="#C74444" />
        <Text className="text-gray-700 ml-2">
          {perfil?.telefono || 'Sin teléfono'}
        </Text>
      </View>

      {/* Contador de recetas */}
      <Text className="text-gray-800 text-base mb-4">
        Recetas: 1
      </Text>

      {/* Botones */}
      <View className="flex-row gap-3">
        {/* Botón Editar perfil */}
        <TouchableOpacity
          onPress={onEditPress}
          className="bg-bizcochito-red rounded-full px-6 py-2 shadow-md"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold">
            Editar perfil
          </Text>
        </TouchableOpacity>

        {/* Botón Cerrar sesión */}
        <TouchableOpacity
          onPress={handleLogoutPress}
          className="bg-gray-700 rounded-full px-6 py-2 shadow-md flex-row items-center"
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color="white" />
          <Text className="text-white font-semibold ml-1">
            Salir
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}