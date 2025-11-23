import React, { useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from "react-native";
import { useNavigation, useFocusEffect, NavigationProp } from "@react-navigation/native";
import ProductCard from "../../components/ProductCard/ProductCard";
import LayoutWithNavbar from "../../components/Layout/LayoutWithNavbar";
import type { RootStackParamList } from "../../types/navigation";

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

// Configuración de grilla y paginación (como en Recetas)
const PRODUCTS_PER_PAGE = 9; // 3 columnas x 3 filas

function CatalogView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE)),
    [products.length]
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return products.slice(start, start + PRODUCTS_PER_PAGE);
  }, [products, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/productos`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : data?.data ?? []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar fetch cuando la vista esté en foco
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const Pagination = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
      <View className="flex-row items-center justify-end px-4 py-2">
        {pages.map((p) => {
          const active = p === currentPage;
          return (
            <TouchableOpacity
              key={p}
              onPress={() => setCurrentPage(p)}
              className={`mx-1 px-3 py-1 rounded-full ${active ? "bg-bizcochito-red" : "bg-gray-200"}`}
              activeOpacity={0.85}
            >
              <Text className={`text-sm ${active ? "text-white font-semibold" : "text-gray-800"}`}>
                {p}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LayoutWithNavbar>
        <View className="px-4 pt-4">
          <Text className="text-bizcochito-red text-xl font-bold mb-1 mt-6 text-center">
            Catálogo
          </Text>
        </View>

        <Pagination />

        <FlatList
          contentContainerStyle={{
            paddingHorizontal: 4,
            paddingBottom: 40,
          }}
          data={paginatedProducts}
          renderItem={({ item }) => (
            <ProductCard
              id={item.id.toString()}
              name={item.nombre || "Sin nombre"}
              category={item.categoriaId?.toString() || "Sin categoría"}
              price={item.precio || 0}
              description={item.descripcion || "Sin descripción"}
              image={item.imagen || ""}
              onPress={() => navigation.navigate("DetalleProducto", { id: item.id })}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-10">
              <Text className="text-gray-500">
                {loading ? "Cargando productos..." : "No hay productos disponibles."}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        {loading && products.length > 0 && (
          <View className="items-center justify-center pb-4">
            <ActivityIndicator color="#8B2EE2" />
          </View>
        )}
      </LayoutWithNavbar>
    </SafeAreaView>
  );
}

export default CatalogView;
