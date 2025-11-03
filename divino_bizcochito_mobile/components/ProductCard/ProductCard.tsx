import React from 'react';
import { View, Text, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string | ImageSourcePropType;
  onPress?: () => void;
}

export default function ProductCard({
  name,
  category,
  price,
  description,
  image,
  onPress,
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    if (!price && price !== 0) return '$0';
    return `$${price.toLocaleString('es-CO')}`;
  };

  return (
    <TouchableOpacity
      className="bg-bizcochito-beige rounded-2xl overflow-hidden shadow-lg m-1 flex-1"
      style={{ maxWidth: '32%' }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Imagen del producto */}
      <View className="bg-white">
        <Image
          source={typeof image === 'string' ? { uri: image } : image}
          className="w-full h-32"
          resizeMode="cover"
        />
      </View>

      {/* Información del producto */}
      <View className="p-2">
        {/* Nombre */}
        <Text className="text-bizcochito-red text-sm font-semibold mb-1" numberOfLines={2}>
          {name}
        </Text>

        {/* Precio */}
        <Text className="text-gray-900 text-base font-bold mb-1">
          {formatPrice(price)}
        </Text>

        {/* Descripción */}
        <Text className="text-gray-600 text-xs leading-4" numberOfLines={2}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}