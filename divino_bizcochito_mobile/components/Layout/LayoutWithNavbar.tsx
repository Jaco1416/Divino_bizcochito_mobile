import React from 'react';
import { View } from 'react-native';
import Navbar from '../Navbar/Navbar';

interface LayoutWithNavbarProps {
  children: React.ReactNode;
}

export default function LayoutWithNavbar({ children }: LayoutWithNavbarProps) {
  return (
    <View className="flex-1">
      <Navbar />
      {children}
    </View>
  );
}
