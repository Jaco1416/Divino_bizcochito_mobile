import { View, Text, FlatList, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import Carousel from '../../components/Carousel/Carouse';
import ProductCard from '../../components/ProductCard/ProductCard';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import LayoutWithNavbar from '../../components/Layout/LayoutWithNavbar';
import AboutUs from '../../components/AboutUs/AboutUs';
import type { RootStackParamList } from '../../types/navigation';

// Endpoint base (usa la misma que en RecetasView)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://divino-bizcochito-web.vercel.app/api';

// Imágenes del carousel
const pastelCarousel1 = require('../../assets/pastel_carousel_1.png');
const pastelCarousel2 = require('../../assets/pastel_carousel_2.png');
const pastelCarousel3 = require('../../assets/pastel_carousel_3.png');
const pastelCarousel4 = require('../../assets/pastel_carousel_4.png');

function isPublishedRaw(raw: any): boolean {
  if (!raw) return false;
  const estado = raw.estado;
  if (estado == null) return false;
  if (typeof estado === 'boolean') return estado === true;
  if (typeof estado === 'number') return estado === 1;
  if (typeof estado === 'string') {
    const lv = estado.trim().toLowerCase();
    return lv === 'publicada' || lv === 'publicado' || lv === 'published' || lv === 'true' || lv === '1';
  }
  return false;
}

export default function Home() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const carouselImages = [pastelCarousel1, pastelCarousel2, pastelCarousel3, pastelCarousel4];

  const [bestSellingProducts, setBestSellingProducts] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!API_URL) {
      setError('Falta EXPO_PUBLIC_API_URL');
      return;
    }
    try {
      setError(null);
      const prodRes = await fetch(`${API_URL}/productos`);
      const recRes = await fetch(`${API_URL}/recetas`);

      if (!prodRes.ok) throw new Error(`Productos HTTP ${prodRes.status}`);
      if (!recRes.ok) throw new Error(`Recetas HTTP ${recRes.status}`);

      const prodData = await prodRes.json();
      const recData = await recRes.json();

      // Top 3 productos por ventas
      const topThreeProducts = (Array.isArray(prodData) ? prodData : prodData?.data ?? [])
        .sort((a: any, b: any) => (b.ventas || 0) - (a.ventas || 0))
        .slice(0, 3);

      // Normalizar posible estructura recetas y filtrar publicadas
      const rawRecetas = Array.isArray(recData) ? recData : recData?.data ?? recData?.items ?? recData?.rows ?? [];
      const publishedRecetas = rawRecetas.filter((r: any) => isPublishedRaw(r));
      const topThreeRecipes = publishedRecetas.slice(0, 3);

      setBestSellingProducts(topThreeProducts);
      setRecipes(topThreeRecipes);
    } catch (e: any) {
      console.error('Error fetch Home:', e);
      setError('No se pudieron cargar datos');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <LayoutWithNavbar>
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 32 }}>
        <Carousel images={carouselImages} />

        <View className="px-3 py-4">
          {!!error && (
            <Text className="text-center text-red-600 text-sm mb-2">
              {error}
            </Text>
          )}

            {/* Productos más vendidos */}
          <Text className="text-bizcochito-red text-xl font-bold mb-3 text-center">Productos más vendidos</Text>
          <FlatList
            data={bestSellingProducts}
            renderItem={({ item }) => (
              <ProductCard
                id={item.id?.toString() ?? ''}
                name={item.nombre || 'Sin nombre'}
                category={item.categoriaId?.toString() || 'Sin categoría'}
                price={item.precio || 0}
                description={item.descripcion || 'Sin descripción'}
                image={item.imagen || ''}
                onPress={() => navigation.navigate('DetalleProducto', { id: item.id })}
              />
            )}
            keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            scrollEnabled={false}
          />

          <AboutUs />

          {/* Recetas publicadas destacadas */}
          <Text className="text-bizcochito-red text-xl font-bold mb-3 mt-6 text-center">Recetas Destacadas</Text>
          <FlatList
            data={recipes}
            renderItem={({ item }) => (
              <RecipeCard
                id={item.id}
                nombre={item.titulo || 'Sin nombre'}
                autor={item.autor || 'Autor desconocido'}
                descripcion={item.descripcion || 'Sin descripción'}
                imagen={item.imagenUrl || ''}
                onPress={() =>
                  navigation.navigate('DetalleReceta', {
                    id: item.id,
                    recipe: item, // pasa la receta para evitar refetch
                  })
                }
              />
            )}
            keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </LayoutWithNavbar>
  );
}