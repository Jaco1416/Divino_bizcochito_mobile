import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from "react-native";

interface DatosEnvio {
    nombre: string;
    correo: string;
    direccion: string;
    comentarios?: string;
}

interface DetallePedido {
    id: number;
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

export default function PedidoDetail({
    pedido,
    onCancelar,
    onVolver,
}: PedidoDetailProps) {
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
            } catch (error) {
              Alert.alert("Error", "No se pudo cancelar el pedido");
            }
          },
        },
      ]
    );
  };
  const renderProducto = ({ item }: { item: DetallePedido }) => (
    <View className="flex-row bg-white p-3 rounded-xl mb-3 shadow-sm border border-gray-100">
      {item.imagenProducto && (
        <Image
          source={{ uri: item.imagenProducto }}
          className="w-20 h-20 rounded-lg mr-3"
          resizeMode="cover"
        />
      )}
      <View className="flex-1 justify-center">
        <Text className="font-bold text-[#8B2E2E] text-base">{item.nombreProducto}</Text>
        {item.toppingId && (
          <Text className="text-gray-600 text-xs">
            Topping: <Text className="font-medium">{item.toppingId}</Text>
          </Text>
        )}
        {item.rellenoId && (
          <Text className="text-gray-600 text-xs">
            Relleno: <Text className="font-medium">{item.rellenoId}</Text>
          </Text>
        )}
        <Text className="text-gray-700 text-sm mt-1">
          Cantidad: {item.cantidad}
        </Text>
        <Text className="text-[#8B2E2E] font-semibold text-sm">
          ${(item.precioUnitario || 0).toLocaleString("es-CL")}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#FDF7F7] p-5 pb-32">
      {/* Botones - posicionado encima de la barra de navegación */}
      <View className="absolute bottom-20 left-5 right-5 z-10">
        <View className="flex-row gap-3">
          {onCancelar && pedido.estado !== "Entregado" && (
            <TouchableOpacity
              onPress={handleCancelar}
              className="flex-1 bg-red-600 py-3 rounded-xl"
            >
              <Text className="text-white text-center font-semibold text-base">
                Cancelar pedido
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onVolver}
            className={`py-3 rounded-xl ${onCancelar && pedido.estado !== "Entregado" ? "flex-1 bg-[#8B2E2E]" : "bg-[#8B2E2E]"}`}
          >
            <Text className="text-white text-center font-semibold text-base ml-2 mr-2">
              Volver al historial
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Encabezado */}
      <View className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-5">
        <Text className="text-2xl font-bold text-[#8B2E2E] text-center mb-4">
          Detalle del Pedido
        </Text>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-700 font-bold">
            ID Pedido: <Text className="font-normal text-gray-600">{pedido.id}</Text>
          </Text>
          <Text
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              pedido.estado === "Recibido"
                ? "bg-blue-300 text-blue-900"
                : pedido.estado === "En producción" || pedido.estado === "En Producción"
                ? "bg-yellow-300 text-yellow-900"
                : pedido.estado === "Listo"
                ? "bg-purple-300 text-purple-900"
                : pedido.estado === "Entregado"
                ? "bg-green-600 text-green-100"
                : pedido.estado === "Cancelado"
                ? "bg-red-500 text-red-100"
                : "bg-gray-300 text-gray-900"
            }`}
          >
            {pedido.estado}
          </Text>
        </View>
        <Text className="text-left font-bold text-gray-700 text-sm">
          Fecha: <Text className="font-normal text-gray-600">{new Date(pedido.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Text>
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
        <Text className="font-bold text-[#8B2E2E] text-lg mb-2">
          Información del pedido
        </Text>
        <Text className="text-gray-700">
          Tipo de entrega:{" "}
          <Text className="font-medium capitalize">{pedido.tipoEntrega}</Text>
        </Text>

        {pedido.tipoEntrega === "envio" && pedido.datosEnvio && (
          <>
            <Text className="text-gray-700 mt-1">
              Receptor: <Text className="font-medium">{pedido.datosEnvio.nombre}</Text>
            </Text>
            <Text className="text-gray-700">
              Dirección: <Text className="font-medium">{pedido.datosEnvio.direccion}</Text>
            </Text>
            <Text className="text-gray-700">
              Correo: <Text className="font-medium">{pedido.datosEnvio.correo}</Text>
            </Text>
            {pedido.datosEnvio.comentarios ? (
              <Text className="text-gray-700">
                Comentarios:{" "}
                <Text className="font-medium">{pedido.datosEnvio.comentarios}</Text>
              </Text>
            ) : null}
          </>
        )}

        <Text className="text-[#8B2E2E] font-bold text-lg mt-3">
          Total: ${(pedido.total || 0).toLocaleString("es-CL")}
        </Text>
      </View>
    </View>
  );
}
