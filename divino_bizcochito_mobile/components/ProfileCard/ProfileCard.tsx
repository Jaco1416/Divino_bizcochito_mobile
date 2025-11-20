import React, { useEffect, useState, useCallback } from 'react';
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

// Usa la misma base de API que el resto de la app
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://divino-bizcochito-web.vercel.app/api';
const RECIPES_PATH = 'recetas';

// Normaliza respuesta de la API a arreglo
function normalizeArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  return data?.data ?? data?.items ?? data?.rows ?? [];
}

export default function ProfileCard({ onEditPress }: ProfileCardProps) {
  const { user, perfil, handleLogout } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [recipesCount, setRecipesCount] = useState<number>(0);
  const [loadingRecipes, setLoadingRecipes] = useState<boolean>(false);
  const [errorRecipes, setErrorRecipes] = useState<boolean>(false);

  const fetchUserRecipesCount = useCallback(async () => {
    const autorId = perfil?.id; // uuid del perfil
    if (!autorId || !API_URL) {
      setRecipesCount(0);
      return;
    }

    setLoadingRecipes(true);
    setErrorRecipes(false);

    try {
      // 1) Intentar endpoint con filtro por autorId
      const urlByAuthor = `${API_URL}/${RECIPES_PATH}?autorId=${encodeURIComponent(String(autorId))}`;
      let res = await fetch(urlByAuthor);

      if (res.ok) {
        const data = await res.json();
        const arr = normalizeArray(data);
        // IMPORTANTE: SIEMPRE filtrar localmente por autorId (por si el backend ignora el query param)
        const own = (arr || []).filter((r: any) => String(r?.autorId) === String(autorId));
        setRecipesCount(own.length);
        setLoadingRecipes(false);
        return;
      }

      // 2) Fallback: traer todas y filtrar localmente
      res = await fetch(`${API_URL}/${RECIPES_PATH}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const dataAll = await res.json();
      const all = normalizeArray(dataAll);
      const own = (all || []).filter((r: any) => String(r?.autorId) === String(autorId));
      setRecipesCount(own.length);
    } catch (e) {
      console.warn('Error obteniendo recetas del usuario:', e);
      setErrorRecipes(true);
      setRecipesCount(0);
    } finally {
      setLoadingRecipes(false);
    }
  }, [perfil?.id]);

  useEffect(() => {
    fetchUserRecipesCount();
  }, [fetchUserRecipesCount]);

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

      {/* Contador de recetas (todas del autor, para que coincida con "Mis Recetas") */}
      <Text className="text-gray-800 text-base mb-4">
        Recetas:{' '}
        {loadingRecipes
          ? 'cargando...'
          : errorRecipes
          ? '0 (error)'
          : recipesCount}
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