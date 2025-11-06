import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  ListRenderItemInfo,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import RecipeCard from "../../components/RecipeCard/RecipeCard";
import LayoutWithNavbar from "../../components/Layout/LayoutWithNavbar";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
// Ajusta este path si tu backend usa otro endpoint para recetas
const RECIPES_PATH = "recetas";

type RecipeFromDB = {
  id: number | string;
  titulo?: string | null;
  nombre?: string | null;       // por si tu API usa "nombre"
  autor?: string | null;
  descripcion?: string | null;
  description?: string | null;  // por si tu API usa "description"
  imagenUrl?: string | null;
  imagen?: string | null;       // por si tu API usa "imagen"
};

export default function RecetasView() {
  const [recipes, setRecipes] = useState<RecipeFromDB[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllRecipes = useCallback(async () => {
    if (!API_URL) {
      setError("Falta EXPO_PUBLIC_API_URL en las variables de entorno.");
      return;
    }
    try {
      setError(null);
      setLoading(true);

      const res = await fetch(`${API_URL}/${RECIPES_PATH}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const arr: RecipeFromDB[] = Array.isArray(data) ? data : (data?.data ?? data?.items ?? data?.rows ?? []);

      setRecipes(arr);
    } catch (e: any) {
      console.error("Error al obtener recetas:", e);
      setError("No se pudieron cargar las recetas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllRecipes();
  }, [fetchAllRecipes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllRecipes();
    setRefreshing(false);
  }, [fetchAllRecipes]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<RecipeFromDB>) => (
      <RecipeCard
        id={Number(item.id)}
        nombre={item.titulo || item.nombre || "Sin nombre"}
        autor={item.autor || "Autor desconocido"}
        descripcion={item.descripcion || item.description || "Sin descripción"}
        imagen={item.imagenUrl || item.imagen || ""}
        onPress={() => {
          console.log("Abrir detalle receta:", item.id);
        }}
      />
    ),
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LayoutWithNavbar>
        <View className="px-4 pt-4">
          <Text className="text-bizcochito-red text-xl font-bold mb-3 mt-6 text-center">
            Todas las recetas
          </Text>
          {!!error && (
            <Text className="text-center text-red-600 text-sm">{error}</Text>
          )}
        </View>

        <FlatList
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 24 }}
          data={recipes}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          numColumns={3}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-10">
              <Text className="text-gray-500">
                {loading ? "Cargando recetas..." : "No hay recetas disponibles."}
              </Text>
            </View>
          }
          ListFooterComponent={
            loading && recipes.length > 0 ? (
              <View style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator color="#8B2EE2" />
              </View>
            ) : null
          }
        />
      </LayoutWithNavbar>
    </SafeAreaView>
  );
}