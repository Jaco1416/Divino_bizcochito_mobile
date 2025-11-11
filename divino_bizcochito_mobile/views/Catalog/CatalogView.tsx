import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import ProductCard from '../../components/ProductCard/ProductCard';
import LayoutWithNavbar from '../../components/Layout/LayoutWithNavbar';
import type { RootStackParamList } from '../../types/navigation';

// Importar la variable de entorno
const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Product {
    id: string;
    nombre: string;
    precio: number;
    descripcion: string;
    imagen: string;
    categoriaId: number;
}


function CatalogView() {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const productsPerPage = 9; // 3 columnas x 3 filas
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();


    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/productos`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProducts(data);
            setTotalPages(Math.ceil(data.length / productsPerPage));
        } catch (error) {
            console.error('Error al obtener productos:', error);
        }
    };

    // Ejecutar fetch cuando la vista esté en foco
    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    // Obtener productos de la página actual
    const getCurrentPageProducts = () => {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        return products.slice(startIndex, endIndex);
    };

    // Componente de paginador
    const Pagination = () => {
        const renderPageNumbers = () => {
            const pages = [];
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <TouchableOpacity
                        key={i}
                        onPress={() => setCurrentPage(i)}
                        className={`w-8 h-8 rounded-full items-center justify-center mx-1 ${currentPage === i ? 'bg-bizcochito-red' : 'bg-gray-300'
                            }`}
                    >
                        <Text className={`font-semibold ${currentPage === i ? 'text-white' : 'text-gray-700'}`}>
                            {i}
                        </Text>
                    </TouchableOpacity>
                );
            }
            return pages;
        };

        return (
            <View className="flex-row items-center justify-end px-4 py-2">
                {renderPageNumbers()}
            </View>
        );
    };

    return (
        <LayoutWithNavbar>
            <ScrollView className="bg-white">
                <View className="px-3 py-4">
                    {/* Título */}
                    <Text className="text-bizcochito-red text-3xl font-bold mb-3 text-center">
                        Catálogo
                    </Text>

                    {/* Paginador superior */}
                    <Pagination />

                    {/* Grid de productos */}
                    <FlatList
                        data={getCurrentPageProducts()}
                        renderItem={({ item }) => (
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
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={3}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        scrollEnabled={false}
                    />

                    {/* Paginador inferior */}
                    <Pagination />
                </View>
            </ScrollView>
        </LayoutWithNavbar>
    );
}

export default CatalogView;