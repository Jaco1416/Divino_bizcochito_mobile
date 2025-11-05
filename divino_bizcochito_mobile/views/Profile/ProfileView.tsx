import React from 'react'
import { View } from 'react-native';
import ProfileCard from '../../components/ProfileCard/ProfileCard'
import LayoutWithNavbar from '../../components/Layout/LayoutWithNavbar';

function ProfileView() {
  return (
    <LayoutWithNavbar>
      <View className="flex-1">
        <ProfileCard />
      </View>
    </LayoutWithNavbar>
  )
}

export default ProfileView