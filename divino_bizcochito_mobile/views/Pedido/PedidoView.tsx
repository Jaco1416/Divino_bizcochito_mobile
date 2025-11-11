import React, { useCallback, useEffect, useState } from 'react'
import { View, Text } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import LayoutWithNavbar from '../../components/Layout/LayoutWithNavbar';
import PedidoDetail from '../../components/PedidoDetail/PedidoDetail';
import type { RootStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


interface PedidoData {
    id: string;
    estado: string;
    fecha: string;
    total: number;
    tipoEntrega: string;
    datosEnvio?: {
        nombre: string;
        direccion: string;
        correo: string;
        comentarios: string;
    };
    productos: Array<{
        id: string;
        nombre: string;
        cantidad: number;
        precioUnitario: number;
        imagen: string;
        topping?: string;
        relleno?: string;
    }>;
}
const API_URL = process.env.EXPO_PUBLIC_API_URL;

function PedidoView() {
    const route = useRoute();
    const navigation = useNavigation<NavigationProp>();
    const pedido = route.params as any;
    const [loading, setLoading] = useState(true);
    const [pedidoData, setPedidoData] = useState<any>(null);

    const fetchPedidoData = async () => {
        try {
            const response = await fetch(`${API_URL}/pedidos/${pedido.id}`);
            const data = await response.json();
            setPedidoData(data);
            console.log('Fetched pedido data:', data);
        } catch (error) {
            console.error('Error fetching pedido data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Ejecutar fetch cuando la vista esté en foco
    useFocusEffect(
        useCallback(() => {
            fetchPedidoData();
        }, [])
    );

    const handleCancelar = async () => {
        try {
            const response = await fetch(`${API_URL}/pedidos/${pedidoData.id}/cancelar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                // Actualizar el estado del pedido localmente
                setPedidoData((prev: any) => prev ? { ...prev, estado: 'Cancelado' } : null);
            } else {
                throw new Error('Error al cancelar el pedido');
            }
        } catch (error) {
            console.error('Error canceling pedido:', error);
            throw error;
        }
    };

    return (
        <LayoutWithNavbar>
            {loading || !pedidoData ? (
                <View className="flex-1 justify-center items-center">
                    <Text>Cargando...</Text>
                </View>
            ) : (
                <PedidoDetail
                    pedido={pedidoData}
                    onCancelar={handleCancelar}
                    onVolver={() => navigation.goBack()}
                />
            )}
        </LayoutWithNavbar>
    )
}

export default PedidoView