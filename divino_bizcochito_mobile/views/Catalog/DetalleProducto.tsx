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
  Alert,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LayoutWithNavbar from "../../components/Layout/LayoutWithNavbar";
import { useRoute, useNavigation, useFocusEffect, RouteProp } from "@react-navigation/native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const PRODUCTS_PATH = "productos";
const TOPPINGS_PATH = "toppings";
const RELLENOS_PATH = "relleno";
const CART_STORAGE_KEY = "@cart_items";

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoriaId: number;
  ventas?: number;
  toppingId?: number;
  rellenoId?: number;
}

interface Topping { id: number; nombre: string; }
interface Relleno { id: number; nombre: string; }

interface CartItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  modificado: boolean;
  topping?: string;
  toppingId?: number;
  relleno?: string;
  rellenoId?: number;
  mensajePersonalizado?: string;
  imagen?: string;
  variantKey: string;
}

type RootStackParamList = {
  DetalleProducto: { id: number; product?: Product; };
};

type DetalleProductoRouteProp = RouteProp<RootStackParamList, "DetalleProducto">;

export default function DetalleProductoView() {
  const route = useRoute<DetalleProductoRouteProp>();
  const navigation = useNavigation();
  const productId = route.params?.id;
  const passed = route.params?.product;

  const [product, setProduct] = useState<Product | null>(passed ?? null);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [rellenos, setRellenos] = useState<Relleno[]>([]);
  const [selectedTopping, setSelectedTopping] = useState<number | null>(null);
  const [selectedRelleno, setSelectedRelleno] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [mensajePersonalizado, setMensajePersonalizado] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(!passed);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const formatPrice = (price: number) => `$${(price ?? 0).toLocaleString("es-CL")}`;
  const incrementarCantidad = () => setCantidad((p) => p + 1);
  const decrementarCantidad = () => setCantidad((p) => (p > 1 ? p - 1 : 1));
  const calcularTotal = () => (product ? product.precio * cantidad : 0);

  // Clave canónica
  const canonicalVariantKey = (
    id: number,
    toppingId?: number | null,
    rellenoId?: number | null,
    mensaje?: string | null
  ) => {
    const msg = (mensaje ?? "").trim().toLowerCase();
    return `${Number(id)}|t:${Number(toppingId ?? 0)}|r:${Number(rellenoId ?? 0)}|m:${msg}`;
  };

  const fetchProduct = useCallback(async () => {
    if (!API_URL || productId == null) {
      setError(!API_URL ? "Falta EXPO_PUBLIC_API_URL." : "ID inválido.");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const url = `${API_URL}/${PRODUCTS_PATH}?id=${productId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const normalized: Product = {
        id: data?.id ?? productId,
        nombre: data?.nombre ?? "Sin nombre",
        descripcion: data?.descripcion ?? "",
        precio: data?.precio ?? 0,
        imagen: data?.imagen ?? "",
        categoriaId: data?.categoriaId ?? 0,
        ventas: data?.ventas ?? 0,
        toppingId: data?.toppingId,
        rellenoId: data?.rellenoId,
      };

      setProduct(normalized);
      if (data?.toppingId) setSelectedTopping(data.toppingId);
      if (data?.rellenoId) setSelectedRelleno(data.rellenoId);
    } catch (e) {
      setError(`No se pudo cargar el producto (ID: ${productId}).`);
    } finally {
      setLoading(false);
    }
  }, [API_URL, productId]);

  const fetchToppings = useCallback(async () => {
    if (!API_URL) return;
    try {
      const res = await fetch(`${API_URL}/${TOPPINGS_PATH}`);
      if (res.ok) {
        const data = await res.json();
        setToppings(Array.isArray(data) ? data : data?.data ?? []);
      }
    } catch {}
  }, [API_URL]);

  const fetchRellenos = useCallback(async () => {
    if (!API_URL) return;
    try {
      const res = await fetch(`${API_URL}/${RELLENOS_PATH}`);
      if (res.ok) {
        const data = await res.json();
        setRellenos(Array.isArray(data) ? data : data?.data ?? []);
      }
    } catch {}
  }, [API_URL]);

  useFocusEffect(
    useCallback(() => {
      if (!passed) fetchProduct();
      fetchToppings();
      fetchRellenos();
    }, [passed, fetchProduct, fetchToppings, fetchRellenos])
  );

  // Agregar al carrito (merge robusto con clave canónica)
  const addToCart = async () => {
    if (!product) return;

    if (!selectedTopping || !selectedRelleno) {
      Alert.alert("Selección requerida", "Debes seleccionar un topping y un relleno antes de agregar al carrito.", [{ text: "OK" }]);
      return;
    }

    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const existing: CartItem[] = cartData ? JSON.parse(cartData) : [];

      // Normalizar existentes a clave canónica y fusionar
      const map = new Map<string, CartItem>();
      for (const it of existing) {
        const key = canonicalVariantKey(it.id, it.toppingId, it.rellenoId, it.mensajePersonalizado);
        const prev = map.get(key);
        if (prev) {
          prev.cantidad += Number(it.cantidad) || 0;
          if (!prev.topping && it.topping) prev.topping = it.topping;
          if (!prev.relleno && it.relleno) prev.relleno = it.relleno;
        } else {
          map.set(key, { ...it, variantKey: key });
        }
      }

      const toppingName = toppings.find((t) => t.id === selectedTopping)?.nombre;
      const rellenoName = rellenos.find((r) => r.id === selectedRelleno)?.nombre;
      const msg = (mensajePersonalizado || "").trim();
      const key = canonicalVariantKey(product.id, selectedTopping, selectedRelleno, msg);

      const ex = map.get(key);
      if (ex) {
        ex.cantidad += cantidad;
        if (!ex.topping && toppingName) ex.topping = toppingName;
        if (!ex.relleno && rellenoName) ex.relleno = rellenoName;
      } else {
        map.set(key, {
          id: product.id,
          nombre: product.nombre,
          cantidad,
          precio: product.precio,
          modificado: !!(toppingName || rellenoName || msg),
          topping: toppingName,
          toppingId: selectedTopping ?? undefined,
          relleno: rellenoName,
          rellenoId: selectedRelleno ?? undefined,
          mensajePersonalizado: msg || undefined,
          imagen: product.imagen,
          variantKey: key,
        });
      }

      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(Array.from(map.values())));

      Alert.alert(
        "Producto agregado",
        `${product.nombre} se agregó al carrito correctamente.`,
        [
          { text: "Seguir comprando", style: "cancel" },
          { text: "Ir al carrito", onPress: () => navigation.navigate("Carrito" as never) },
        ]
      );
    } catch {
      Alert.alert("Error", "No se pudo agregar el producto al carrito");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProduct();
    setRefreshing(false);
  }, [fetchProduct]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LayoutWithNavbar>
        <ScrollView
          className="flex-1 px-5 pt-5"
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-bizcochito-red text-xl font-bold">Detalle del producto</Text>
            <View style={{ width: 80 }} />
          </View>

          {loading && (
            <View className="items-center justify-center mt-10">
              <ActivityIndicator color="#C74444" size="large" />
              <Text className="text-gray-500 mt-3">Cargando...</Text>
            </View>
          )}

          {!!error && !loading && (
            <View className="items-center mt-10">
              <Text className="text-red-600">{error}</Text>
            </View>
          )}

          {!loading && !error && product && (
            <View>
              {/* Imagen */}
              <View className="rounded-2xl overflow-hidden mb-5 bg-gray-100" style={{ height: 300 }}>
                {product.imagen ? (
                  <Image source={{ uri: product.imagen }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-400">Sin imagen</Text>
                  </View>
                )}
              </View>

              {/* Nombre y precio */}
              <Text className="text-3xl font-bold text-bizcochito-red mb-2">{product.nombre}</Text>
              <Text className="text-2xl font-bold text-gray-900 mb-4">{formatPrice(product.precio)}</Text>

              {!!product.categoriaId && <Text className="text-sm text-gray-600 mb-4">Categoría: {product.categoriaId}</Text>}

              {!!product.descripcion && (
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-bizcochito-red mb-2">Descripción</Text>
                  <Text className="text-base text-gray-700 leading-relaxed">{product.descripcion}</Text>
                </View>
              )}

              {/* Toppings */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-bizcochito-red mb-3">Selecciona un Topping (Requerido)</Text>
                {toppings.length === 0 ? (
                  <Text className="text-gray-500 italic">Cargando toppings...</Text>
                ) : (
                  <View className="flex-row flex-wrap gap-2">
                    {toppings.map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        onPress={() => setSelectedTopping(t.id)}
                        className={`px-4 py-2 rounded-full border-2 ${selectedTopping === t.id ? "bg-bizcochito-red border-bizcochito-red" : "bg-white border-gray-300"}`}
                      >
                        <Text className={`font-semibold ${selectedTopping === t.id ? "text-white" : "text-gray-700"}`}>{t.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Rellenos */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-bizcochito-red mb-3">Selecciona un Relleno (Requerido)</Text>
                {rellenos.length === 0 ? (
                  <Text className="text-gray-500 italic">Cargando rellenos...</Text>
                ) : (
                  <View className="flex-row flex-wrap gap-2">
                    {rellenos.map((r) => (
                      <TouchableOpacity
                        key={r.id}
                        onPress={() => setSelectedRelleno(r.id)}
                        className={`px-4 py-2 rounded-full border-2 ${selectedRelleno === r.id ? "bg-bizcochito-red border-bizcochito-red" : "bg-white border-gray-300"}`}
                      >
                        <Text className={`font-semibold ${selectedRelleno === r.id ? "text-white" : "text-gray-700"}`}>{r.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Mensaje */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-bizcochito-red mb-3">Mensaje personalizado</Text>
                <TextInput
                  value={mensajePersonalizado}
                  onChangeText={setMensajePersonalizado}
                  placeholder="Inserte su mensaje personalizado"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="border-2 border-gray-300 rounded-lg p-3 text-base text-gray-700"
                  style={{ minHeight: 80 }}
                />
              </View>

              {/* Cantidad y Total */}
              <View className="mb-6">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-lg font-semibold text-gray-800 mb-2">Cantidad</Text>
                    <View className="flex-row items-center">
                      <TouchableOpacity onPress={decrementarCantidad} className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center" activeOpacity={0.7}>
                        <Text className="text-xl font-bold text-gray-700">−</Text>
                      </TouchableOpacity>
                      <Text className="text-2xl font-bold text-gray-800 mx-6">{cantidad}</Text>
                      <TouchableOpacity onPress={incrementarCantidad} className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center" activeOpacity={0.7}>
                        <Text className="text-xl font-bold text-gray-700">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-semibold text-bizcochito-red">Total: {formatPrice(calcularTotal())}</Text>
                  </View>
                </View>
              </View>

              {/* Botón agregar */}
              <TouchableOpacity onPress={addToCart} className="bg-bizcochito-red rounded-full py-4 items-center mt-4" activeOpacity={0.8}>
                <Text className="text-white text-lg font-semibold">Agregar pedido</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LayoutWithNavbar>
    </SafeAreaView>
  );
}