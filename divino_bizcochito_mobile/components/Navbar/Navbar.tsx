import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppNavigation } from '../../types/navigation';

type NavbarProps = {
  activeTab?: 'home' | 'edit' | 'messages' | 'cart' | 'profile';
}

export default function Navbar({ activeTab = 'home' }: NavbarProps) {
  const navigation = useNavigation<AppNavigation>();

  const getColor = (tab: string) => {
    return activeTab === tab ? '#8B2E2E' : '#C74444';
  };

  const handleTabPress = (tab: 'home' | 'edit' | 'messages' | 'cart' | 'profile') => {
    switch (tab) {
      case 'home':
        navigation.navigate('Home');
        break;
      case 'profile':
        navigation.navigate('Profile');
        break;
      case 'edit':
        // TODO: Navegar a vista de edición/recetas
        navigation.navigate('Recetas');
        break;
      case 'messages':
        // TODO: Navegar a vista de mensajes
        navigation.navigate('Catalogo');
        break;
      case 'cart':
        // TODO: Navegar a vista de carrito
        navigation.navigate('Carrito');
        break;
    }
  };

  return (
    <SafeAreaView edges={['top']} className="bg-bizcochito-beige">
      <View className="flex-row justify-around items-center bg-bizcochito-beige py-3 px-5 border-b-2 border-[#D4C4B0] shadow-sm">
      <TouchableOpacity 
        className="p-2 justify-center items-center"
        onPress={() => handleTabPress('home')}
      >
        <Ionicons 
          name="home" 
          size={28} 
          color={getColor('home')} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        className="p-2 justify-center items-center"
        onPress={() => handleTabPress('edit')}
      >
        <MaterialIcons 
          name="edit" 
          size={28} 
          color={getColor('edit')} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        className="p-2 justify-center items-center"
        onPress={() => handleTabPress('messages')}
      >
        <Ionicons 
          name="pricetags-sharp" 
          size={24} 
          color={getColor('messages')} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        className="p-2 justify-center items-center"
        onPress={() => handleTabPress('cart')}
      >
        <Ionicons 
          name="cart" 
          size={28} 
          color={getColor('cart')} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        className="p-2 justify-center items-center"
        onPress={() => handleTabPress('profile')}
      >
        <FontAwesome5 
          name="user" 
          size={24} 
          color={getColor('profile')} 
        />
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
