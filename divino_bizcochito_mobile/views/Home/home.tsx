import { View, Text, FlatList, ScrollView } from 'react-native'
import Navbar from '../../components/Navbar/Navbar'
import Carousel from '../../components/Carousel/Carouse'
import ProductCard from '../../components/ProductCard/ProductCard';
import { useEffect, useState } from 'react';

// Importar la variable de entorno
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Importar las imágenes del carousel
const pastelCarousel1 = require('../../assets/pastel_carousel_1.png');
const pastelCarousel2 = require('../../assets/pastel_carousel_2.png');
const pastelCarousel3 = require('../../assets/pastel_carousel_3.png');
const pastelCarousel4 = require('../../assets/pastel_carousel_4.png');

function home() {
    const carouselImages = [
        pastelCarousel1,
        pastelCarousel2,
        pastelCarousel3,
        pastelCarousel4,
    ];

    const [bestSellingProducts, setBestSellingProducts] = useState([]);

    useEffect(() => {
        const fetchBestSellingProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/productos`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Ordenar por ventas descendente y tomar solo los 3 primeros
                const topThree = data
                    .sort((a: any, b: any) => (b.ventas || 0) - (a.ventas || 0))
                    .slice(0, 3);

                setBestSellingProducts(topThree);
            } catch (error) {
                console.error('Error al obtener productos:', error);
                console.error('API_URL:', API_URL);
                // Puedes agregar un estado para mostrar el error en la UI si lo deseas
            }
        }
        fetchBestSellingProducts();
    }, []);

    return (
        <ScrollView className="flex-1 bg-white">
            <Navbar />
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
                        />
                    )}
                    keyExtractor={(item: any) => item.id.toString()}
                    numColumns={3}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    scrollEnabled={false}
                />
            </View>
        </ScrollView>
    )
}

export default home