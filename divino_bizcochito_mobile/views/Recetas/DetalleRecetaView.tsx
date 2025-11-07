import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import LayoutWithNavbar from "../../components/Layout/LayoutWithNavbar";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import type { DetalleRecetaRouteProp, AppNavigation, RecipeFromDB } from "../../types/navigation";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const RECIPES_PATH = "recetas";

export default function DetalleRecetaView() {
  const route = useRoute<DetalleRecetaRouteProp>();
  const navigation = useNavigation<AppNavigation>();
  const recipeId = route.params?.id;
  const passed = route.params?.recipe;

  const [recipe, setRecipe] = useState<RecipeFromDB | null>(passed ?? null);
  const [loading, setLoading] = useState<boolean>(!passed);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchRecipe = useCallback(async () => {
    if (!API_URL || recipeId == null) {
      setError(!API_URL ? "Falta EXPO_PUBLIC_API_URL." : "ID inválido.");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`${API_URL}/${RECIPES_PATH}/${recipeId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Normalización directa (solo canónico)
      const normalized: RecipeFromDB = {
        id: data?.id ?? recipeId,
        titulo: data?.titulo ?? "Sin título",
        descripcion: data?.descripcion ?? "",
        imagenUrl: data?.imagenUrl ?? "",
        autor: data?.autor ?? null,
        categoria: data?.categoria ?? null,
        ingredientes: data?.ingredientes ?? null,
        pasos: data?.pasos ?? null,
      };

      setRecipe(normalized);
    } catch (e: any) {
      setError("No se pudo cargar la receta.");
    } finally {
      setLoading(false);
    }
  }, [API_URL, recipeId]);

  // Ejecutar fetch cuando la vista esté en foco
  useFocusEffect(
    useCallback(() => {
      if (!passed) fetchRecipe();
    }, [passed, fetchRecipe])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecipe();
    setRefreshing(false);
  }, [fetchRecipe]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LayoutWithNavbar>
        <ScrollView
          className="flex-1 px-5 pt-5"
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-bizcochito-red text-xl font-bold">Detalle de la receta</Text>
            <View style={{ width: 80 }} />
          </View>

          {loading && (
            <View className="items-center justify-center mt-10">
              <ActivityIndicator color="#8B2EE2" size="large" />
              <Text className="text-gray-500 mt-3">Cargando...</Text>
            </View>
          )}

          {!!error && !loading && (
            <View className="items-center mt-10">
              <Text className="text-red-600">{error}</Text>
            </View>
          )}

          {!loading && !error && recipe && (
            <View>
              <View className="rounded-2xl overflow-hidden mb-5 bg-gray-100" style={{ height: 260 }}>
                {recipe.imagenUrl ? (
                  <Image source={{ uri: recipe.imagenUrl }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-400">Sin imagen</Text>
                  </View>
                )}
              </View>

              <Text className="text-2xl font-bold text-bizcochito-red mb-1">{recipe.titulo}</Text>
              {!!recipe.autor && <Text className="text-sm text-gray-600 mb-3">Autor: {recipe.autor}</Text>}
              {!!recipe.categoria && (
                <Text className="text-xs text-gray-500 mb-4">Categoría: {recipe.categoria}</Text>
              )}

              {!!recipe.descripcion && (
                <View className="mb-6">
                  <Text className="text-base text-gray-700 leading-snug">{recipe.descripcion}</Text>
                </View>
              )}

              {!!recipe.ingredientes && (
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-bizcochito-red mb-2">Ingredientes</Text>
                  <Text className="text-gray-700 whitespace-pre-line">{recipe.ingredientes}</Text>
                </View>
              )}

              {!!recipe.pasos && (
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-bizcochito-red mb-2">Paso a paso</Text>
                  <Text className="text-gray-700 whitespace-pre-line">{recipe.pasos}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </LayoutWithNavbar>
    </SafeAreaView>
  );
}