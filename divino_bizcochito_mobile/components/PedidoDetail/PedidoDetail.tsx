import React, { useCallback, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://divino-bizcochito-web.vercel.app/api";
const TOPPINGS_PATH = "toppings";
const RELLENOS_PATH = "relleno";
const CART_STORAGE_KEY = "@cart_items";

interface DatosEnvio {
  nombre: string;
  correo: string;
  direccion: string;
  comentarios?: string;
}

interface DetallePedido {
  id: number; // id de la fila detalle (no usar para merge)
  productoId?: number;
  productId?: number;
  producto_id?: number;
  product_id?: number;
  cantidad: number;
  precioUnitario: number;
  nombreProducto: string;
  imagenProducto: string | null;
  toppingId: number | null;
  rellenoId: number | null;
}

interface Pedido {
  id: number;
  tipoEntrega: string;
  datosEnvio: DatosEnvio | null;
  estado: string;
  fechaCreacion: string;
  fechaEntrega: string | null;
  total: number;
  perfil?: { nombre: string };
  detalle_pedido: DetallePedido[];
}

interface PedidoDetailProps {
  pedido: Pedido;
  onCancelar?: () => Promise<void>;
  onVolver: () => void;
}

interface CartItem {
  id: number; // SIEMPRE id de PRODUCTO
  nombre: string;
  cantidad: number;
  precio: number;
  modificado: boolean;
  toppingId?: number;
  rellenoId?: number;
  topping?: string;   // nombre
  relleno?: string;   // nombre
  imagen?: string | null;
  mensajePersonalizado?: string;
  variantKey: string; // `${id}|t:${t}|r:${r}|m:${msg}`
}

type Topping = { id: number; nombre: string };
type Relleno = { id: number; nombre: string };

export default function PedidoDetail({ pedido, onCancelar, onVolver }: PedidoDetailProps) {
  const navigation = useNavigation();

  // Mapas id -> nombre
  const [toppingById, setToppingById] = useState<Record<number, string>>({});
  const [rellenoById, setRellenoById] = useState<Record<number, string>>({});

  const fetchToppings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/${TOPPINGS_PATH}`);
      if (!res.ok) return;
      const data = await res.json();
      const arr: Topping[] = Array.isArray(data) ? data : data?.data ?? [];
      const map: Record<number, string> = {};
      for (const t of arr) if (t?.id != null) map[t.id] = t.nombre ?? String(t.id);
      setToppingById(map);
    } catch {}
  }, []);

  const fetchRellenos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/${RELLENOS_PATH}`);
      if (!res.ok) return;
      const data = await res.json();
      const arr: Relleno[] = Array.isArray(data) ? data : data?.data ?? [];
      const map: Record<number, string> = {};
      for (const r of arr) if (r?.id != null) map[r.id] = r.nombre ?? String(r.id);
      setRellenoById(map);
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchToppings();
      fetchRellenos();
    }, [fetchToppings, fetchRellenos])
  );

  const handleCancelar = async () => {
    if (!onCancelar) return;
    Alert.alert(
      "Confirmar cancelación",
      "¿Estás seguro de que quieres cancelar este pedido?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await onCancelar();
            } catch {
              Alert.alert("Error", "No se pudo cancelar el pedido");
            }
          },
        },
      ]
    );
  };

  // Clave canónica
  const canonicalVariantKey = (
    productId: number,
    toppingId?: number | null,
    rellenoId?: number | null,
    mensaje?: string | null
  ) => {
    const msg = (mensaje ?? "").trim().toLowerCase();
    return `${Number(productId)}|t:${Number(toppingId ?? 0)}|r:${Number(rellenoId ?? 0)}|m:${msg}`;
  };

  // Obtener siempre el productId de la fila
  const getProductIdFromRow = (row: DetallePedido): number | null => {
    const pid = row.productoId ?? row.productId ?? row.producto_id ?? row.product_id ?? null;
    return typeof pid === "number" ? pid : null;
  };

  // Volver a pedir con merge robusto
  const volverAPedir = useCallback(async () => {
    try {
      const detalle = Array.isArray(pedido.detalle_pedido) ? pedido.detalle_pedido : [];
      if (detalle.length === 0) {
        Alert.alert("Sin items", "Este pedido no contiene productos para volver a pedir.");
        return;
      }

      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const currentCart: CartItem[] = cartData ? JSON.parse(cartData) : [];

      // 1) Normalizar carrito existente a clave canónica y fusionar duplicados existentes
      const map = new Map<string, CartItem>();
      for (const it of currentCart) {
        const key = canonicalVariantKey(it.id, it.toppingId, it.rellenoId, it.mensajePersonalizado);
        const existing = map.get(key);
        if (existing) {
          existing.cantidad += Number(it.cantidad) || 0;
          // Completar nombres si faltan
          if (!existing.topping && it.topping) existing.topping = it.topping;
          if (!existing.relleno && it.relleno) existing.relleno = it.relleno;
        } else {
          map.set(key, { ...it, variantKey: key });
        }
      }

      // 2) Agregar filas del pedido usando SIEMPRE productId
      for (const row of detalle) {
        const productId = getProductIdFromRow(row);
        const topId = row.toppingId ?? 0;
        const relId = row.rellenoId ?? 0;

        if (!productId) {
          // Raro: si la fila no trae productId, usa un id negativo para no mezclar con productos reales
          const fallbackId = -Math.abs(row.id);
          const key = canonicalVariantKey(fallbackId, topId, relId, "");
          const ex = map.get(key);
          if (ex) {
            ex.cantidad += row.cantidad || 1;
          } else {
            map.set(key, {
              id: fallbackId,
              nombre: row.nombreProducto,
              cantidad: row.cantidad || 1,
              precio: row.precioUnitario || 0,
              modificado: !!(row.toppingId || row.rellenoId),
              toppingId: row.toppingId ?? undefined,
              rellenoId: row.rellenoId ?? undefined,
              topping: row.toppingId != null ? toppingById[row.toppingId] : undefined,
              relleno: row.rellenoId != null ? rellenoById[row.rellenoId] : undefined,
              imagen: row.imagenProducto || null,
              mensajePersonalizado: undefined,
              variantKey: key,
            });
          }
          continue;
        }

        const key = canonicalVariantKey(productId, topId, relId, "");
        const ex = map.get(key);
        if (ex) {
          ex.cantidad += row.cantidad || 1;
          if (!ex.topping && row.toppingId != null) ex.topping = toppingById[row.toppingId];
          if (!ex.relleno && row.rellenoId != null) ex.relleno = rellenoById[row.rellenoId];
        } else {
          map.set(key, {
            id: productId,
            nombre: row.nombreProducto,
            cantidad: row.cantidad || 1,
            precio: row.precioUnitario || 0,
            modificado: !!(row.toppingId || row.rellenoId),
            toppingId: row.toppingId ?? undefined,
            rellenoId: row.rellenoId ?? undefined,
            topping: row.toppingId != null ? toppingById[row.toppingId] : undefined,
            relleno: row.rellenoId != null ? rellenoById[row.rellenoId] : undefined,
            imagen: row.imagenProducto || null,
            mensajePersonalizado: undefined, // al reordenar asumimos sin mensaje
            variantKey: key,
          });
        }
      }

      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(Array.from(map.values())));

      Alert.alert(
        "Pedido agregado",
        "Los productos del pedido se agregaron al carrito.",
        [
          { text: "Seguir viendo", style: "cancel" },
          { text: "Ir al carrito", onPress: () => navigation.navigate("Carrito" as never) },
        ]
      );
    } catch {
      Alert.alert("Error", "No se pudo agregar el contenido del pedido al carrito.");
    }
  }, [pedido, navigation, toppingById, rellenoById]);

  const renderProducto = ({ item }: { item: DetallePedido }) => {
    const toppingNombre = item.toppingId != null ? toppingById[item.toppingId] ?? `#${item.toppingId}` : null;
    const rellenoNombre = item.rellenoId != null ? rellenoById[item.rellenoId] ?? `#${item.rellenoId}` : null;

    return (
      <View className="flex-row bg-white p-3 rounded-xl mb-3 shadow-sm border border-gray-100">
        {item.imagenProducto && (
          <Image source={{ uri: item.imagenProducto }} className="w-20 h-20 rounded-lg mr-3" resizeMode="cover" />
        )}
        <View className="flex-1 justify-center">
          <Text className="font-bold text-[#8B2E2E] text-base">{item.nombreProducto}</Text>
          {!!toppingNombre && (
            <Text className="text-gray-600 text-xs">Topping: <Text className="font-medium">{toppingNombre}</Text></Text>
          )}
          {!!rellenoNombre && (
            <Text className="text-gray-600 text-xs">Relleno: <Text className="font-medium">{rellenoNombre}</Text></Text>
          )}
          <Text className="text-gray-700 text-sm mt-1">Cantidad: {item.cantidad}</Text>
          <Text className="text-[#8B2E2E] font-semibold text-sm">
            ${(item.precioUnitario || 0).toLocaleString("es-CL")}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#FDF7F7] p-5 pb-32">
      {/* Barra inferior */}
      <View className="absolute bottom-20 left-5 right-5 z-10">
        <View className="flex-row gap-3">
          {onCancelar && pedido.estado !== "Entregado" && (
            <TouchableOpacity onPress={handleCancelar} className="flex-1 bg-red-600 py-3 rounded-xl" activeOpacity={0.85}>
              <Text className="text-white text-center font-semibold text-base">Cancelar pedido</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={volverAPedir} className="flex-1 bg-bizcochito-red py-3 rounded-xl" activeOpacity={0.85}>
            <Text className="text-white text-center font-semibold text-base">Volver a pedir</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onVolver} className="flex-1 bg-[#8B2E2E] py-3 rounded-xl" activeOpacity={0.85}>
            <Text className="text-white text-center font-semibold text-base">Volver al historial</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Encabezado */}
      <View className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-5">
        <Text className="text-2xl font-bold text-[#8B2E2E] text-center mb-4">Detalle del Pedido</Text>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-700 font-bold">ID Pedido: <Text className="font-normal text-gray-600">{pedido.id}</Text></Text>
          <Text className={`px-3 py-1 rounded-md text-xs font-semibold ${
            pedido.estado === "Recibido" ? "bg-blue-300 text-blue-900"
            : (pedido.estado === "En producción" || pedido.estado === "En Producción") ? "bg-yellow-300 text-yellow-900"
            : pedido.estado === "Listo" ? "bg-purple-300 text-purple-900"
            : pedido.estado === "Entregado" ? "bg-green-600 text-green-100"
            : pedido.estado === "Cancelado" ? "bg-red-500 text-red-100"
            : "bg-gray-300 text-gray-900"
          }`}>
            {pedido.estado}
          </Text>
        </View>
        <Text className="text-left font-bold text-gray-700 text-sm">
          Fecha: <Text className="font-normal text-gray-600">
            {new Date(pedido.fechaCreacion).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </Text>
        </Text>
      </View>

      {/* Lista de productos */}
      <FlatList
        data={pedido.detalle_pedido}
        renderItem={renderProducto}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
      />

      {/* Información de entrega */}
      <View className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-4 mb-2">
        <Text className="font-bold text-[#8B2E2E] text-lg mb-2">Información del pedido</Text>
        <Text className="text-gray-700">Tipo de entrega: <Text className="font-medium capitalize">{pedido.tipoEntrega}</Text></Text>

        {pedido.tipoEntrega === "envio" && pedido.datosEnvio && (
          <>
            <Text className="text-gray-700 mt-1">Receptor: <Text className="font-medium">{pedido.datosEnvio.nombre}</Text></Text>
            <Text className="text-gray-700">Dirección: <Text className="font-medium">{pedido.datosEnvio.direccion}</Text></Text>
            <Text className="text-gray-700">Correo: <Text className="font-medium">{pedido.datosEnvio.correo}</Text></Text>
            {!!pedido.datosEnvio.comentarios && (
              <Text className="text-gray-700">Comentarios: <Text className="font-medium">{pedido.datosEnvio.comentarios}</Text></Text>
            )}
          </>
        )}

        <Text className="text-[#8B2E2E] font-bold text-lg mt-3">
          Total: ${(pedido.total || 0).toLocaleString("es-CL")}
        </Text>
      </View>
    </View>
  );
}