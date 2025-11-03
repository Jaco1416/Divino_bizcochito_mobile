import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import "./global.css"
import LoginCard from './components/LoginCard/LoginCard';
import RegisterCard from './components/RegisterCard/RegisterCard';
import Home from './views/Home/home';

export default function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'home'>('login');

  return (
    <View style={{ flex: 1 }}>
      {currentView === 'login' ? (
        <LoginCard 
          onNavigateToRegister={() => setCurrentView('register')}
          onLogin={() => setCurrentView('home')}
        />
      ) : currentView === 'register' ? (
        <RegisterCard onBack={() => setCurrentView('login')} />
      ) : (
        <Home />
      )}
      <StatusBar style="auto" />
    </View>
  );
}
