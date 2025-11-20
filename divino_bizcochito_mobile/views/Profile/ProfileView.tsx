import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, FlatList, ScrollView } from 'react-native';
import ProfileCard from '../../components/ProfileCard/ProfileCard'
import PedidosTable from '../../components/PedidosTable/PedidosTable';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import LayoutWithNavbar from '../../components/Layout/LayoutWithNavbar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Profile">;
// Importar la variable de entorno
const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Pedido {
  id: number;
  tipoEntrega: String;
  estado: string;
  total: string;
  fechaEntrega: string;
}

interface Receta {
  id: number;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
}

function ProfileView() {

  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);

  const fetchPedidos = async () => {
    try {
      const response = await fetch(`${API_URL}/pedidos/usuario?usuarioId=${user.id}`);
      const data = await response.json();
      setPedidos(data);
    } catch (error) {
      console.error("Error fetching pedidos:", error);
    }
  };
  const fetchRecetas = async () => {
    try {
      const response = await fetch(`${API_URL}/recetas`);
      const data = await response.json();
      // Filtrar solo las recetas del usuario actual
      const misRecetas = data.filter((receta: any) => receta.autorId === user.id);
      setRecetas(misRecetas);
    } catch (error) {
      console.error("Error fetching recetas:", error);
    }
  };
  // Ejecutar fetch cuando la vista esté en foco
  useFocusEffect(
    useCallback(() => {
      fetchPedidos();
      fetchRecetas();
    }, [])
  );


  return (
    <LayoutWithNavbar>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <ProfileCard />
        
        <View className="p-4">
          <Text className="text-xl font-bold text-[#8B2E2E] mb-4">Mis Recetas</Text>
          <FlatList
            data={recetas}
            renderItem={({ item }) => (
              <RecipeCard
                id={item.id}
                nombre={item.titulo}
                autor={user?.nombre || "Tú"}
                descripcion={item.descripcion}
                imagen={item.imagenUrl}
                onPress={() => {navigation.navigate('DetalleReceta', {
                    id: item.id,
                    recipe: item, // pasa la receta para evitar refetch
                  }) }}
              />
            )}
            keyExtractor={(item) => String(item.id)}
            numColumns={3}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text className="text-center text-gray-500 mt-4">No tienes recetas aún.</Text>
            }
          />
        </View>
        <PedidosTable pedidos={pedidos} onVerDetalle={(id) => {navigation.navigate("PedidoDetalle", { id }); }} />
      </ScrollView>
    </LayoutWithNavbar>
  )
}

export default ProfileView