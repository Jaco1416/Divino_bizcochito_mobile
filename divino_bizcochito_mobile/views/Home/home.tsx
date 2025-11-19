import { View, Text, FlatList, ScrollView } from 'react-native'
import { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import Carousel from '../../components/Carousel/Carouse'
import ProductCard from '../../components/ProductCard/ProductCard';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import LayoutWithNavbar from '../../components/Layout/LayoutWithNavbar';
import AboutUs from '../../components/AboutUs/AboutUs';
import type { RootStackParamList } from '../../types/navigation';


// Importar la variable de entorno
const API_URL = "https://divino-bizcochito-web.vercel.app/api";

// Importar las imágenes del carousel
const pastelCarousel1 = require('../../assets/pastel_carousel_1.png');
const pastelCarousel2 = require('../../assets/pastel_carousel_2.png');
const pastelCarousel3 = require('../../assets/pastel_carousel_3.png');
const pastelCarousel4 = require('../../assets/pastel_carousel_4.png');

function isPublishedRaw(raw: any): boolean {
    if (!raw) return false;
    const estado = raw?.estado;
    if (estado == null) return false;

    if (typeof estado === "boolean") return estado === true;
    if (typeof estado === "number") return estado === 1;

    if (typeof estado === "string") {
        const lv = estado.trim().toLowerCase();
        return lv === "publicada" || lv === "publicado" || lv === "published" || lv === "true" || lv === "1";
    }
    return false;
}

function Home() {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const carouselImages = [
        pastelCarousel1,
        pastelCarousel2,
        pastelCarousel3,
        pastelCarousel4,
    ];

    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const [recipes, setRecipes] = useState([]);

    const fetchBestSellingProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/productos`);
            const responseRecetas = await fetch(`${API_URL}/recetas`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (!responseRecetas.ok) {
                throw new Error(`HTTP error! recetas status: ${responseRecetas.status}`);
            }

            const data = await response.json();
            const recetasData = await responseRecetas.json();

            // Ordenar por ventas descendente y tomar solo los 3 primeros
            const topThree = data
                .sort((a: any, b: any) => (b.ventas || 0) - (a.ventas || 0))
                .slice(0, 3);

            // Normalizar posible estructura y filtrar solo recetas publicadas
            const rawRecetas = Array.isArray(recetasData)
                ? recetasData
                : recetasData?.data ?? recetasData?.items ?? recetasData?.rows ?? [];

            // Aquí se filtran SOLO las recetas publicadas
            const publishedRecetas = (rawRecetas || []).filter((r: any) => isPublishedRaw(r));

            // Tomar solo las 3 primeras recetas publicadas
            const topThreeRecipes = publishedRecetas.slice(0, 3);

            setBestSellingProducts(topThree);
            setRecipes(topThreeRecipes);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            console.error('API_URL:', API_URL);
        }
    };

    // Ejecutar fetch cuando la vista esté en foco
    useFocusEffect(
        useCallback(() => {
            fetchBestSellingProducts();
        }, [])
    );


    return (
        <LayoutWithNavbar>
            <ScrollView className="flex-1 bg-white">
                <Carousel images={carouselImages} />
                <View className='px-3 py-4'>
                    <Text className="text-bizcochito-red text-xl font-bold mb-3 text-center">Productos más vendidos</Text>
                    <FlatList
                        data={bestSellingProducts}
                        renderItem={({ item }: { item: any }) => (
                            <ProductCard
                                id={item.id.toString()}
                                name={item.nombre || 'Sin nombre'}
                                category={item.categoriaId?.toString() || 'Sin categoría'}
                                price={item.precio || 0}
                                description={item.descripcion || 'Sin descripción'}
                                image={item.imagen || ''}
                                onPress={() => navigation.navigate('DetalleProducto', { id: item.id })}
                            />
                        )}
                        keyExtractor={(item: any) => item.id.toString()}
                        numColumns={3}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        scrollEnabled={false}
                    />
                    <AboutUs />
                    {/* Sección de Recetas */}
                    <Text className="text-bizcochito-red text-xl font-bold mb-3 mt-6 text-center">Recetas Destacadas</Text>
                    <FlatList
                        data={recipes}
                        renderItem={({ item }: { item: any }) => (
                            <RecipeCard
                                id={item.id}
                                nombre={item.titulo || 'Sin nombre'}
                                autor={item.autor || 'Autor desconocido'}
                                descripcion={item.descripcion || 'Sin descripción'}
                                imagen={item.imagenUrl || ''}
                            />
                        )}
                        keyExtractor={(item: any) => item.id.toString()}
                        numColumns={3}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        scrollEnabled={false}
                    />
                    
                </View>
            </ScrollView>
        </LayoutWithNavbar>
    )
}

export default Home