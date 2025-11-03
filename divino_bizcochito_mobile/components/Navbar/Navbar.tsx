import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface NavbarProps {
  activeTab?: 'home' | 'edit' | 'messages' | 'cart' | 'profile';
  onTabPress?: (tab: 'home' | 'edit' | 'messages' | 'cart' | 'profile') => void;
}

export default function Navbar({ activeTab = 'home', onTabPress }: NavbarProps) {
  const getColor = (tab: string) => {
    return activeTab === tab ? '#8B2E2E' : '#C74444';
  };

  return (
    <SafeAreaView edges={['top']} className="bg-bizcochito-beige">
      <View className="flex-row justify-around items-center bg-bizcochito-beige py-3 px-5 border-b-2 border-[#D4C4B0] shadow-sm">
      <TouchableOpacity 
        className="p-2 justify-center items-center"
        onPress={() => onTabPress?.('home')}
      >
        <Ionicons 
          name="home" 
          size={28} 
          color={getColor('home')} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        className="p-2 justify-center items-center"
        onPress={() => onTabPress?.('edit')}
      >
        <MaterialIcons 
          name="edit" 
          size={28} 
          color={getColor('edit')} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        className="p-2 justify-center items-center"
        onPress={() => onTabPress?.('messages')}
      >
        <Ionicons 
          name="mail" 
          size={28} 
          color={getColor('messages')} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        className="p-2 justify-center items-center"
        onPress={() => onTabPress?.('cart')}
      >
        <Ionicons 
          name="cart" 
          size={28} 
          color={getColor('cart')} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        className="p-2 justify-center items-center"
        onPress={() => onTabPress?.('profile')}
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
