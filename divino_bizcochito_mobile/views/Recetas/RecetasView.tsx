import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  ListRenderItemInfo,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import LayoutWithNavbar from "../../components/Layout/LayoutWithNavbar";
import RecipeCard from "../../components/RecipeCard/RecipeCard";
import type {
  AppNavigation,
  RecipeFromDB,
  RecetasRouteProp,
} from "../../types/navigation";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const RECIPES_PATH = "recetas";

// Configuración de grilla y paginación
const ITEMS_PER_PAGE = 9; // 3 columnas x 3 filas
const FAB_SIZE = 80; // w-20 h-20
const PAGINATION_GAP = 12; // separación entre paginador y FAB

// Normaliza el objeto de backend al tipo canónico de la app
function normalizeRecipe(raw: any, idx: number): RecipeFromDB {
  return {
    id: raw?.id ?? raw?.ID ?? raw?.recipeId ?? `temp-${idx}`,
    titulo: String(raw?.titulo ?? "Sin título"),
    descripcion: String(raw?.descripcion ?? ""),
    imagenUrl: String(raw?.imagenUrl ?? ""),
    autor: raw?.autor ?? null,
    categoria: raw?.categoria ?? null,
    ingredientes: raw?.ingredientes ?? null,
    pasos: raw?.pasos ?? null,
  };
}

// Detecta si un objeto raw indica que la receta está publicada.
// Acepta string "publicada"/"publicado" (case-insensitive), boolean true o number 1.
function isPublishedRaw(raw: any): boolean {
  if (!raw) return false;
  const estado = raw.estado;
  if (estado == null) return false;

  if (typeof estado === "boolean") return estado === true;
  if (typeof estado === "number") return estado === 1;

  if (typeof estado === "string") {
    const lv = estado.trim().toLowerCase();
    return lv === "publicada" || lv === "publicado" || lv === "published" || lv === "true" || lv === "1";
  }

  return false;
}

export default function RecetasView() {
  const navigation = useNavigation<AppNavigation>();
  const route = useRoute<RecetasRouteProp>();
  const insets = useSafeAreaInsets();

  // Si venimos de una acción final (crear/editar) y queremos bloquear "volver"
  const lockBack = route.params?.lockBack === true;

  const [allRecipes, setAllRecipes] = useState<RecipeFromDB[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(allRecipes.length / ITEMS_PER_PAGE)),
    [allRecipes.length]
  );

  const paginatedRecipes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allRecipes.slice(start, start + ITEMS_PER_PAGE);
  }, [allRecipes, currentPage]);

  const fetchAllRecipes = useCallback(async () => {
    if (!API_URL) {
      setError("Falta EXPO_PUBLIC_API_URL.");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`${API_URL}/${RECIPES_PATH}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rawArr = Array.isArray(data)
        ? data
        : data?.data ?? data?.items ?? data?.rows ?? [];

      // Filtrar solo recetas con estado = 'publicada' (o equivalentes)
      const publishedRaw = (rawArr || []).filter((r: any) => isPublishedRaw(r));

      // Normalizar solo las recetas publicadas
      const arr = publishedRaw.map((r: any, i: number) => normalizeRecipe(r, i));

      setAllRecipes(arr);
      setCurrentPage(1);
    } catch (e: any) {
      console.error("Error recetas:", e);
      setError("No se pudieron cargar las recetas.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Ejecutar fetch cuando la vista esté en foco
  useFocusEffect(
    useCallback(() => {
      fetchAllRecipes();
    }, [fetchAllRecipes])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllRecipes();
    setRefreshing(false);
  }, [fetchAllRecipes]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
  };

  // Bloquea el botón físico atrás SOLO cuando lockBack está activo
  useFocusEffect(
    React.useCallback(() => {
      if (!lockBack) return;

      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        // Consumir el evento: no hacer pop
        return true;
      });

      return () => {
        sub.remove();
      };
    }, [lockBack])
  );

  // iOS: habilita/deshabilita el gesto atrás según lockBack
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !lockBack });
  }, [lockBack, navigation]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<RecipeFromDB>) => (
      <RecipeCard
        id={Number(item.id)}
        nombre={item.titulo}
        autor={item.autor || "Autor desconocido"}
        descripcion={item.descripcion}
        imagen={item.imagenUrl}
        onPress={() =>
          navigation.navigate("DetalleReceta", {
            id: item.id,
            recipe: item, // ya normalizado
          })
        }
      />
    ),
    [navigation]
  );

  // Posiciones absolutas para paginador y FAB respetando safe area
  const FAB_BOTTOM = Math.max(24, 24 + insets.bottom);
  const PAGINATION_BOTTOM = FAB_BOTTOM + FAB_SIZE + PAGINATION_GAP;

  const renderPagination = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
      <View
        className="absolute left-0 right-0 items-center"
        style={{ bottom: PAGINATION_BOTTOM }}
        pointerEvents="box-none"
      >
        <View className="flex-row justify-center items-center bg-white/90 rounded-full px-4 py-2">
          {pages.map((p) => {
            const active = p === currentPage;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => goToPage(p)}
                className={`mx-1 px-2 py-1 rounded ${
                  active ? "bg-bizcochito-red" : ""
                }`}
                style={{ minWidth: 32 }}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-sm ${
                    active ? "text-white font-semibold" : "text-gray-700"
                  } text-center`}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderFab = () => (
    <View
      className="absolute left-0 right-0 items-center"
      style={{ bottom: FAB_BOTTOM }}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        onPress={() => navigation.navigate("CrearReceta")}
        activeOpacity={0.85}
        className="w-20 h-20 rounded-full bg-bizcochito-red items-center justify-center shadow-lg"
        style={{ elevation: 6 }}
      >
        <Text className="text-white text-4xl leading-none">+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LayoutWithNavbar>
        <View className="px-4 pt-4">
          <Text className="text-bizcochito-red text-xl font-bold mb-1 mt-6 text-center">
            Recetas publicadas
          </Text>
          {!!error && (
            <Text className="text-center text-red-600 text-sm mb-2">
              {error}
            </Text>
          )}
        </View>

        <FlatList
          contentContainerStyle={{
            paddingHorizontal: 4,
            // Espacio para que el contenido no quede bajo el paginador/FAB
            paddingBottom: PAGINATION_BOTTOM + 24,
          }}
          data={paginatedRecipes}
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
                {loading ? "Cargando recetas..." : "No hay recetas publicadas."}
              </Text>
            </View>
          }
        />

        {loading && allRecipes.length > 0 && (
          <View className="items-center justify-center pb-4">
            <ActivityIndicator color="#8B2EE2" />
          </View>
        )}

        {renderPagination()}
        {renderFab()}
      </LayoutWithNavbar>
    </SafeAreaView>
  );
}