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
import AsyncStorage from '@react-native-async-storage/async-storage';
import LayoutWithNavbar from "../../components/Layout/LayoutWithNavbar";
import { useRoute, useNavigation, useFocusEffect, RouteProp } from "@react-navigation/native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const PRODUCTS_PATH = "productos";
const TOPPINGS_PATH = "toppings";
const RELLENOS_PATH = "relleno";
const CART_STORAGE_KEY = '@cart_items';

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

interface Topping {
  id: number;
  nombre: string;
}

interface Relleno {
  id: number;
  nombre: string;
}

interface CartItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  modificado: boolean;
  topping?: string;
  relleno?: string;
  mensajePersonalizado?: string;
  imagen?: string;
}

type RootStackParamList = {
  DetalleProducto: {
    id: number;
    product?: Product;
  };
};

type DetalleProductoRouteProp = RouteProp<RootStackParamList, 'DetalleProducto'>;

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
  const [mensajePersonalizado, setMensajePersonalizado] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(!passed);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const formatPrice = (price: number) => {
    if (!price && price !== 0) return '$0';
    return `$${price.toLocaleString('es-CL')}`;
  };

  const incrementarCantidad = () => {
    setCantidad(prev => prev + 1);
  };

  const decrementarCantidad = () => {
    setCantidad(prev => (prev > 1 ? prev - 1 : 1));
  };

  const calcularTotal = () => {
    if (!product) return 0;
    return product.precio * cantidad;
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
      console.log('Fetching product from:', url);
      const res = await fetch(url);

      if (!res.ok) {
        console.error(`Error HTTP ${res.status} al obtener producto ${productId}`);
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('Producto obtenido:', data);

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

      // Set default selections from product
      if (data?.toppingId) {
        setSelectedTopping(data.toppingId);
      }
      if (data?.rellenoId) {
        setSelectedRelleno(data.rellenoId);
      }
    } catch (e: any) {
      console.error('Error al cargar producto:', e);
      setError(`No se pudo cargar el producto (ID: ${productId}). Verifica que exista en la base de datos.`);
    } finally {
      setLoading(false);
    }
  }, [API_URL, productId]);

  const fetchToppings = useCallback(async () => {
    if (!API_URL) return;
    try {
      const url = `${API_URL}/${TOPPINGS_PATH}`;
      console.log('Fetching toppings from:', url);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log('Toppings obtenidos:', data);
        setToppings(Array.isArray(data) ? data : []);
      } else {
        console.error(`Error HTTP ${res.status} al obtener toppings`);
      }
    } catch (e) {
      console.error('Error al cargar toppings:', e);
    }
  }, [API_URL]);

  const fetchRellenos = useCallback(async () => {
    if (!API_URL) return;
    try {
      const url = `${API_URL}/${RELLENOS_PATH}`;
      console.log('Fetching rellenos from:', url);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log('Rellenos obtenidos:', data);
        setRellenos(Array.isArray(data) ? data : []);
      } else {
        console.error(`Error HTTP ${res.status} al obtener rellenos`);
      }
    } catch (e) {
      console.error('Error al cargar rellenos:', e);
    }
  }, [API_URL]);

  // Ejecutar fetch cuando la vista esté en foco
  useFocusEffect(
    useCallback(() => {
      if (!passed) fetchProduct();
      fetchToppings();
      fetchRellenos();
    }, [passed, fetchProduct, fetchToppings, fetchRellenos])
  );

  const addToCart = async () => {
    if (!product) return;

    // Validar que las selecciones sean obligatorias
    if (!selectedTopping || !selectedRelleno) {
      Alert.alert(
        'Selección requerida',
        'Debes seleccionar un topping y un relleno antes de agregar al carrito.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Obtener carrito actual
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const currentCart: CartItem[] = cartData ? JSON.parse(cartData) : [];

      const toppingName = selectedTopping ? toppings.find(t => t.id === selectedTopping)?.nombre : undefined;
      const rellenoName = selectedRelleno ? rellenos.find(r => r.id === selectedRelleno)?.nombre : undefined;
      const modificado = !!(toppingName || rellenoName);

      // Crear nuevo item (siempre como item separado)
      const newItem: CartItem = {
        id: product.id,
        nombre: product.nombre,
        cantidad: cantidad,
        precio: product.precio,
        modificado,
        topping: toppingName,
        relleno: rellenoName,
        mensajePersonalizado: mensajePersonalizado.trim() || undefined,
        imagen: product.imagen,
      };

      // Agregar al carrito (siempre como item separado)
      const updatedCart = [...currentCart, newItem];
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));

      Alert.alert(
        'Producto agregado',
        `${product.nombre} se agregó al carrito correctamente.`,
        [
          { text: 'Seguir comprando', style: 'cancel' },
          { text: 'Ir al carrito', onPress: () => navigation.navigate('Carrito' as never) }
        ]
      );

      console.log('✅ Producto agregado al carrito:', newItem);
    } catch (error) {
      console.error('❌ Error al agregar al carrito:', error);
      Alert.alert('Error', 'No se pudo agregar el producto al carrito');
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
              {/* Imagen del producto */}
              <View className="rounded-2xl overflow-hidden mb-5 bg-gray-100" style={{ height: 300 }}>
                {product.imagen ? (
                  <Image
                    source={{ uri: product.imagen }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-400">Sin imagen</Text>
                  </View>
                )}
              </View>

              {/* Nombre del producto */}
              <Text className="text-3xl font-bold text-bizcochito-red mb-2">
                {product.nombre}
              </Text>

              {/* Precio */}
              <Text className="text-2xl font-bold text-gray-900 mb-4">
                {formatPrice(product.precio)}
              </Text>

              {/* Categoría */}
              {!!product.categoriaId && (
                <Text className="text-sm text-gray-600 mb-4">
                  Categoría: {product.categoriaId}
                </Text>
              )}
              {/* Descripción */}
              {!!product.descripcion && (
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-bizcochito-red mb-2">
                    Descripción
                  </Text>
                  <Text className="text-base text-gray-700 leading-relaxed">
                    {product.descripcion}
                  </Text>
                </View>
              )}
              {/* Selector de Topping */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-bizcochito-red mb-3">
                  Selecciona un Topping (Requerido)
                </Text>
                {toppings.length === 0 ? (
                  <Text className="text-gray-500 italic">
                    Cargando toppings... (Total: {toppings.length})
                  </Text>
                ) : (
                  <View className="flex-row flex-wrap gap-2">
                    {toppings.map((topping) => (
                      <TouchableOpacity
                        key={topping.id}
                        onPress={() => setSelectedTopping(topping.id)}
                        className={`px-4 py-2 rounded-full border-2 ${selectedTopping === topping.id
                            ? 'bg-bizcochito-red border-bizcochito-red'
                            : 'bg-white border-gray-300'
                          }`}
                      >
                        <Text
                          className={`font-semibold ${selectedTopping === topping.id
                              ? 'text-white'
                              : 'text-gray-700'
                            }`}
                        >
                          {topping.nombre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Selector de Relleno */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-bizcochito-red mb-3">
                  Selecciona un Relleno (Requerido)
                </Text>
                {rellenos.length === 0 ? (
                  <Text className="text-gray-500 italic">
                    Cargando rellenos... (Total: {rellenos.length})
                  </Text>
                ) : (
                  <View className="flex-row flex-wrap gap-2">
                    {rellenos.map((relleno) => (
                      <TouchableOpacity
                        key={relleno.id}
                        onPress={() => setSelectedRelleno(relleno.id)}
                        className={`px-4 py-2 rounded-full border-2 ${selectedRelleno === relleno.id
                            ? 'bg-bizcochito-red border-bizcochito-red'
                            : 'bg-white border-gray-300'
                          }`}
                      >
                        <Text
                          className={`font-semibold ${selectedRelleno === relleno.id
                              ? 'text-white'
                              : 'text-gray-700'
                            }`}
                        >
                          {relleno.nombre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Mensaje Personalizado */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-bizcochito-red mb-3">
                  Mensaje personalizado
                </Text>
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
                    <Text className="text-lg font-semibold text-gray-800 mb-2">
                      Cantidad
                    </Text>
                    <View className="flex-row items-center">
                      <TouchableOpacity
                        onPress={decrementarCantidad}
                        className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center"
                        activeOpacity={0.7}
                      >
                        <Text className="text-xl font-bold text-gray-700">−</Text>
                      </TouchableOpacity>
                      <Text className="text-2xl font-bold text-gray-800 mx-6">
                        {cantidad}
                      </Text>
                      <TouchableOpacity
                        onPress={incrementarCantidad}
                        className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center"
                        activeOpacity={0.7}
                      >
                        <Text className="text-xl font-bold text-gray-700">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-semibold text-bizcochito-red">
                      Total: {formatPrice(calcularTotal())}
                    </Text>
                  </View>
                </View>
              </View>



              {/* Botón de agregar pedido */}
              <TouchableOpacity
                onPress={addToCart}
                className="bg-bizcochito-red rounded-full py-4 items-center mt-4"
                activeOpacity={0.8}
              >
                <Text className="text-white text-lg font-semibold">
                  Agregar pedido
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LayoutWithNavbar>
    </SafeAreaView>
  );
}
