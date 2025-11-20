import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

interface Pedido {
  id: number ;
  tipoEntrega: String;
  estado: string;
  total: string;
  fechaEntrega: string;
}

interface PedidosTableProps {
  pedidos: Pedido[];
  onVerDetalle: (id: number) => void;
}

export default function PedidosTable({ pedidos, onVerDetalle }: PedidosTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredPedidos = selectedStatus ? pedidos.filter(p => p.estado === selectedStatus) : pedidos;
  const renderItem = ({ item }: { item: Pedido }) => (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 p-4">
      {/* Encabezado de la tarjeta */}
      <View className="flex-row justify-between mb-2">
        <Text className="text-[#8B2E2E] font-bold text-base">
          Compra #{item.id}
        </Text>
        <Text
          className={`px-3 py-1 rounded-md text-xs font-semibold ${
            item.estado === "Recibido"
              ? "bg-blue-300 text-blue-900"
              : item.estado === "En Producción"
              ? "bg-yellow-300 text-yellow-900"
              : item.estado === "Listo"
              ? "bg-purple-300 text-purple-900"
              : item.estado === "Entregado"
              ? "bg-green-600 text-green-100"
              : item.estado === "Cancelado"
              ? "bg-red-500 text-red-100"
              : "bg-gray-300 text-gray-900"
          }`}
        >
          {item.estado}
        </Text>
      </View>

      {/* Detalles en 2 columnas */}
      <View className="flex-row justify-between mt-1">
        <View>
          <Text className="text-gray-500 text-xs">Tipo de entrega</Text>
          <Text className="font-semibold text-sm">{item.tipoEntrega}</Text>
        </View>

        <View>
          <Text className="text-gray-500 text-xs">Total</Text>
          <Text className="font-semibold text-sm">{item.total}</Text>
        </View>

        <View>
          <Text className="text-gray-500 text-xs">Entrega</Text>
          <Text className="font-semibold text-sm">{item.fechaEntrega || "Pendiente"}</Text>
        </View>
      </View>

      {/* Botón de acción */}
      <TouchableOpacity
        onPress={() => onVerDetalle(item.id)}
        className="bg-[#8B2E2E] mt-3 py-2 rounded-lg"
      >
        <Text className="text-center text-white font-semibold text-sm">
          Ver detalle
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
     <View className="flex-1 p-4">
      <Text className="text-center text-2xl font-bold text-[#8B2E2E] mb-4">
        Historial de compras
      </Text>

      {/* Filtros por estado */}
      <View className="flex-row flex-wrap justify-center mb-4">
        <TouchableOpacity
          onPress={() => setSelectedStatus(null)}
          className={`px-3 py-1 rounded-md mr-2 mb-2 ${selectedStatus === null ? "bg-[#8B2E2E] text-white" : "bg-gray-200 text-gray-700"}`}
        >
          <Text className={`text-xs font-semibold ${selectedStatus === null ? "text-white" : "text-gray-700"}`}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedStatus("Recibido")}
          className={`px-3 py-1 rounded-md mr-2 mb-2 ${selectedStatus === "Recibido" ? "bg-blue-300 text-blue-900" : "bg-gray-200 text-gray-700"}`}
        >
          <Text className={`text-xs font-semibold ${selectedStatus === "Recibido" ? "text-blue-900" : "text-gray-700"}`}>Recibido</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedStatus("En Producción")}
          className={`px-3 py-1 rounded-md mr-2 mb-2 ${selectedStatus === "En Producción" ? "bg-yellow-300 text-yellow-900" : "bg-gray-200 text-gray-700"}`}
        >
          <Text className={`text-xs font-semibold ${selectedStatus === "En Producción" ? "text-yellow-900" : "text-gray-700"}`}>En Producción</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedStatus("Listo")}
          className={`px-3 py-1 rounded-md mr-2 mb-2 ${selectedStatus === "Listo" ? "bg-purple-300 text-purple-900" : "bg-gray-200 text-gray-700"}`}
        >
          <Text className={`text-xs font-semibold ${selectedStatus === "Listo" ? "text-purple-900" : "text-gray-700"}`}>Listo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedStatus("Entregado")}
          className={`px-3 py-1 rounded-md mr-2 mb-2 ${selectedStatus === "Entregado" ? "bg-green-600 text-green-100" : "bg-gray-200 text-gray-700"}`}
        >
          <Text className={`text-xs font-semibold ${selectedStatus === "Entregado" ? "text-green-100" : "text-gray-700"}`}>Entregado</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedStatus("Cancelado")}
          className={`px-3 py-1 rounded-md mr-2 mb-2 ${selectedStatus === "Cancelado" ? "bg-red-500 text-red-100" : "bg-gray-200 text-gray-700"}`}
        >
          <Text className={`text-xs font-semibold ${selectedStatus === "Cancelado" ? "text-red-100" : "text-gray-700"}`}>Cancelado</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPedidos}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-8">
            {selectedStatus ? `No hay pedidos con estado "${selectedStatus}".` : "No tienes compras registradas aún."}
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
