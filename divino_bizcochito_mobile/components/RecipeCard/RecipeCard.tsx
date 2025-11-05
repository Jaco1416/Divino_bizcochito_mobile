import React from 'react';
import { View, Text, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';

interface RecipeCardProps {
  id: number;
  nombre: string;
  autor: string;
  descripcion: string;
  imagen: ImageSourcePropType | string;
  onPress?: () => void;
}

export default function RecipeCard({ 
  nombre, 
  autor, 
  descripcion, 
  imagen,
  onPress 
}: RecipeCardProps) {
  const imageSource = typeof imagen === 'string' 
    ? { uri: imagen } 
    : imagen;

  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-bizcochito-beige rounded-2xl overflow-hidden shadow-lg m-1 flex-1"
      style={{ maxWidth: '32%' }}
      activeOpacity={0.8}
    >
      {/* Imagen de la receta */}
      <View className="bg-white">
        <Image 
          source={imageSource}
          className="w-full h-32"
          resizeMode="cover"
        />
      </View>
      
      {/* Información de la receta */}
      <View className="p-2">
        {/* Nombre de la receta */}
        <Text 
          className="text-bizcochito-red text-base font-semibold mb-1"
          numberOfLines={2}
        >
          {nombre}
        </Text>
        
        {/* Autor */}
        <Text 
          className="text-gray-900 text-xs font-bold mb-1"
          numberOfLines={1}
        >
          {autor}
        </Text>
        
        {/* Descripción */}
        <Text 
          className="text-gray-600 text-xs leading-4"
          numberOfLines={2}
        >
          {descripcion}
        </Text>
      </View>
    </TouchableOpacity>
  );
}