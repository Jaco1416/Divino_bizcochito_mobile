import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation"; // ajusta la ruta
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';



type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ResultadoPago">;

export default function ResultadoPagoView({ route }: any) {
    const { estado } = route.params;
    const navigation = useNavigation<NavigationProp>();

    const esExito = estado === "exito";

    useEffect(() => {
        if (esExito) {
            AsyncStorage.removeItem('@cart_items');
        }
    }, [esExito]);

    return (
        <View className="flex-1 justify-center items-center p-6 bg-gray-100">
            <Text className="text-2xl font-semibold mb-4">
                {esExito ? "✅ Pago Exitoso" : "❌ Pago Rechazado"}
            </Text>
            <Text className="text-center text-gray-700 mb-8">
                {esExito
                    ? `Tu pedido fue recibido correctamente.`
                    : "Hubo un problema al procesar tu pago. Intenta nuevamente o revisa tu método de pago."}
            </Text>

            <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
                className={`w-3/4 p-3 rounded-xl ${esExito ? "bg-green-600" : "bg-red-600"
                    }`}
            >
                <Text className="text-center text-white font-bold text-lg">
                    Volver al inicio
                </Text>
            </TouchableOpacity>
        </View>
    );
}
