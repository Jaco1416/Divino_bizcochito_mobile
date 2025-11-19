import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LayoutWithNavbar from '../../components/Layout/LayoutWithNavbar';
import { RootStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from 'react-native-screens/lib/typescript/native-stack/types';
import { supabase } from "../../libs/supabaseClient";
import { useAuth } from '../../contexts/AuthContext';

interface CartItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  modificado: boolean;
  imagen?: string;
  topping?: string;
  toppingId?: number;
  relleno?: string;
  rellenoId?: number;
  mensajePersonalizado?: string;
  // NUEVO: clave única por variante
  variantKey: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Carrito">;

const ENVIO_COSTO = 2000;
const CART_STORAGE_KEY = '@cart_items';
type TipoEntrega = 'retiro' | 'envio';

function CartView() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>('retiro');
  const [formData, setFormData] = useState({
    nombreReceptor: '',
    direccion: '',
    correo: '',
    comentarios: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buildVariantKey = (item: Partial<CartItem>) => {
    return `${item.id}|t:${item.toppingId ?? 0}|r:${item.rellenoId ?? 0}|m:${(item.mensajePersonalizado ?? '').trim().toLowerCase()}`;
  };

  // Cargar carrito desde AsyncStorage y asignar variantKey si faltara
  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        const itemsParsed: any[] = JSON.parse(cartData);
        const normalized: CartItem[] = itemsParsed.map((it, idx) => {
          const variantKey = it.variantKey
            ? it.variantKey
            : buildVariantKey(it);
          return { ...it, variantKey };
        });
        setCartItems(normalized);
        // Guardar normalizado (por si antes no existía variantKey)
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
        console.log('✅ Carrito cargado normalizado:', normalized);
      }
    } catch (error) {
      console.error('❌ Error al cargar carrito:', error);
    }
  };

  const saveCart = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      console.log('✅ Carrito guardado');
    } catch (error) {
      console.error('❌ Error al guardar carrito:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const formatPrice = (price: number) => `$${price.toLocaleString('es-CL')}`;

  // Actualizar cantidad usando variantKey
  const updateQuantity = async (variantKey: string, increment: boolean) => {
    const updated = cartItems.map(item =>
      item.variantKey === variantKey
        ? { ...item, cantidad: Math.max(1, item.cantidad + (increment ? 1 : -1)) }
        : item
    );
    setCartItems(updated);
    await saveCart(updated);
  };

  // Eliminar solo la variante seleccionada
  const removeItem = async (variantKey: string) => {
    const updated = cartItems.filter(item => item.variantKey !== variantKey);
    setCartItems(updated);
    await saveCart(updated);
  };

  const calculateSubtotal = () =>
    cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return tipoEntrega === 'envio' ? subtotal + ENVIO_COSTO : subtotal;
  };

  // Enviar carrito (sin cambios en la lógica existente)
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const carritoData = {
        perfilid: user?.id ?? null,
        tipoentrega: tipoEntrega,
        datosenvio: formData,
        items: cartItems,
        estado: "pendiente",
      };

      console.log("🛒 Guardando carrito en Supabase:", carritoData);

      const { data: nuevoCarrito, error: errCarrito } = await supabase
        .from("Carrito")
        .insert([carritoData])
        .select()
        .single();

      if (errCarrito) {
        console.error("❌ Error guardando carrito:", errCarrito);
        alert("No se pudo guardar el carrito en la base de datos.");
        return;
      }

      console.log("✅ Carrito creado con ID:", nuevoCarrito.id);
      await AsyncStorage.setItem("@cart_id", String(nuevoCarrito.id));

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/webpay/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: cartItems.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
          sessionId: String(nuevoCarrito.id),
          returnUrl: `${process.env.EXPO_PUBLIC_API_URL}/webpay/commit-mobile`,
        }),
      });

      if (!res.ok) throw new Error("Error iniciando pago");
      const data = await res.json();
      console.log("💳 Transacción creada en Webpay:", data);

      navigation.navigate("PagoView", {
        paymentUrl: data.url,
        token: data.token,
      });

    } catch (error) {
      console.error("❌ Error en el pago:", error);
      alert("Ocurrió un error al iniciar el pago.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View className="flex-row items-center bg-[#9E8174] mb-1 rounded-lg overflow-hidden py-2">
      <View className="w-14 h-14 ml-2">
        {item.imagen ? (
          <Image
            source={{ uri: item.imagen }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-gray-400 rounded-lg items-center justify-center">
            <Ionicons name="image-outline" size={20} color="white" />
          </View>
        )}
      </View>

      <View className="flex-1 px-3">
        <Text className="text-white font-semibold text-sm" numberOfLines={2}>
          {item.nombre}
        </Text>
        {item.toppingId && (
          <Text className="text-white text-[10px] mt-1">Topping: {item.topping ?? item.toppingId}</Text>
        )}
        {item.rellenoId && (
          <Text className="text-white text-[10px]">Relleno: {item.relleno ?? item.rellenoId}</Text>
        )}
        {item.mensajePersonalizado && (
          <Text className="text-white text-[10px] italic" numberOfLines={1}>
            "{item.mensajePersonalizado}"
          </Text>
        )}
      </View>

      <View className="px-2 flex-row items-center justify-center">
        <TouchableOpacity
          onPress={() => updateQuantity(item.variantKey, false)}
          className="w-6 h-6 rounded-full border-2 border-white items-center justify-center"
        >
          <Ionicons name="remove" size={14} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold mx-2 text-base min-w-[20px] text-center">
          {item.cantidad}
        </Text>
        <TouchableOpacity
          onPress={() => updateQuantity(item.variantKey, true)}
          className="w-6 h-6 rounded-full bg-bizcochito-red items-center justify-center"
        >
          <Ionicons name="add" size={14} color="white" />
        </TouchableOpacity>
      </View>

      <View className="px-2 py-3 justify-center">
        <Text className="text-white font-bold text-sm">
          {formatPrice(item.precio)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => removeItem(item.variantKey)}
        className="bg-bizcochito-red rounded-full w-10 h-10 items-center justify-center mr-2"
      >
        <Ionicons name="trash-outline" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <LayoutWithNavbar>
      <ScrollView
        className="flex-1 bg-white px-4 py-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex-row items-center bg-bizcochito-dark-red mb-2 rounded-lg overflow-hidden px-2 py-3">
          <Text className="text-white font-bold text-xs ml-2" style={{ width: 56 }}>Foto</Text>
          <Text className="text-white font-bold text-xs flex-1">Producto</Text>
          <Text className="text-white font-bold text-xs" style={{ width: 90 }}>Cant.</Text>
          <Text className="text-white font-bold text-xs px-2" style={{ width: 90 }}>Precio</Text>
          <Text className="text-white font-bold text-xs pr-1" style={{ width: 30 }}>Del.</Text>
        </View>

        {cartItems.length === 0 ? (
          <View className="items-center py-10">
            <Ionicons name="cart-outline" size={64} color="#C74444" />
            <Text className="text-gray-500 mt-4 text-lg">Carrito vacío</Text>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.variantKey}
            scrollEnabled={false}
          />
        )}

        {cartItems.length === 0 && (
          <View className="bg-red-100 border border-red-400 rounded-lg p-3 mb-4 flex-row items-center">
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text className="text-red-700 ml-2">Ve a elegir un producto</Text>
          </View>
        )}

        {cartItems.length > 0 && (
          <>
            <View className="mt-6 mb-6">
              <Text className="text-bizcochito-red text-xl font-bold mb-4">
                Tipo de entrega
              </Text>
              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => setTipoEntrega('retiro')}
                  className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg border-2 ${
                    tipoEntrega === 'retiro'
                      ? 'bg-bizcochito-red border-bizcochito-red'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Ionicons
                    name={tipoEntrega === 'retiro' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={tipoEntrega === 'retiro' ? 'white' : '#9CA3AF'}
                  />
                  <Text
                    className={`ml-2 font-bold text-base ${
                      tipoEntrega === 'retiro' ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Retiro en tienda
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setTipoEntrega('envio')}
                  className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg border-2 ${
                    tipoEntrega === 'envio'
                      ? 'bg-bizcochito-red border-bizcochito-red'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Ionicons
                    name={tipoEntrega === 'envio' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={tipoEntrega === 'envio' ? 'white' : '#9CA3AF'}
                  />
                  <Text
                    className={`ml-2 font-bold text-base ${
                      tipoEntrega === 'envio' ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Envío a domicilio
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className={`mt-2 ${tipoEntrega === 'retiro' ? 'opacity-40' : 'opacity-100'}`}>
              <Text className="text-bizcochito-red text-xl font-bold mb-4">
                Formulario de envío
              </Text>
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Nombre del receptor</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
                  placeholder="Joaquín"
                  value={formData.nombreReceptor}
                  editable={tipoEntrega === 'envio'}
                  onChangeText={(text) => setFormData({ ...formData, nombreReceptor: text })}
                />
              </View>
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Dirección</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
                  placeholder="Calle 1221"
                  value={formData.direccion}
                  editable={tipoEntrega === 'envio'}
                  onChangeText={(text) => setFormData({ ...formData, direccion: text })}
                />
              </View>
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Correo electrónico</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
                  placeholder="correo@correo.com"
                  value={formData.correo}
                  keyboardType="email-address"
                  editable={tipoEntrega === 'envio'}
                  onChangeText={(text) => setFormData({ ...formData, correo: text })}
                />
              </View>
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2">Comentarios</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
                  placeholder='"Portón blanco, tocar timbre..."'
                  value={formData.comentarios}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={tipoEntrega === 'envio'}
                  onChangeText={(text) => setFormData({ ...formData, comentarios: text })}
                />
              </View>
            </View>

            <View className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
              <Text className="text-2xl font-bold text-bizcochito-red text-center mb-3">
                Total
              </Text>
              <Text className="text-4xl font-bold text-bizcochito-red text-center mb-4">
                {formatPrice(calculateTotal())}
              </Text>
              <View className="space-y-1">
                <Text className="text-gray-700">
                  • Total del carrito: {formatPrice(calculateSubtotal())}
                </Text>
                {tipoEntrega === 'envio' && (
                  <Text className="text-gray-700">
                    • Envío: {formatPrice(ENVIO_COSTO)}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`bg-bizcochito-red rounded-lg py-4 items-center ${isSubmitting ? 'opacity-60' : ''}`}
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg font-bold">
                {isSubmitting ? 'Procesando...' : 'Ir a pagar'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </LayoutWithNavbar>
  );
}

export default CartView;