import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';

export default function AboutUs() {
  return (
    <ScrollView className="bg-white">
      <View className="p-6">
        {/* Título principal */}
        <Text className="text-3xl font-bold text-bizcochito-red mb-6">
          Acerca de nuestro negocio
        </Text>

        {/* Imagen del negocio */}
        <View className="mb-6 rounded-lg overflow-hidden">
          <Image
            source={require('../../assets/pastelera.png')}
            className="w-full h-64"
            resizeMode="cover"
          />
        </View>

        {/* Origen */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-bizcochito-dark-red mb-2">
            Origen
          </Text>
          <Text className="text-gray-700 text-base leading-6">
            Nuestro negocio nació desde la pasión por la repostería y pastelería empezando por pedidos pequeños realizados por necesidad.
          </Text>
        </View>

        {/* Visión */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-bizcochito-dark-red mb-2">
            Visión
          </Text>
          <Text className="text-gray-700 text-base leading-6">
            Nuestra visión es poder extender nuestro rango de clientela llegando más comunas dentro de nuestro alcance además de implementar nuevas recetas con el tiempo.
          </Text>
        </View>

        {/* Misión */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-bizcochito-dark-red mb-2">
            Misión
          </Text>
          <Text className="text-gray-700 text-base leading-6">
            Nuestra misión es que todos nuestros vecinos puedan disfrutar nuestros productos de manera cómoda y rápida.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}