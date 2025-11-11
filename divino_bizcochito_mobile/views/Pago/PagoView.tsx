import React, { useRef, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

export default function PagoView({ route, navigation }: any) {
  const { paymentUrl, token } = route.params;
  const [loading, setLoading] = useState(false);
  const hasCommittedRef = useRef(false); // 👈 evita doble commit sincronizando en la misma render

  const handlePaymentResult = async () => {
    if (hasCommittedRef.current) return; // 🚫 Evita commit duplicado
    hasCommittedRef.current = true;

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/webpay/commit-mobile?token_ws=${token}`
      );
      const data = await res.json();

      if (data.success) {
        navigation.navigate("ResultadoPago", {
          estado: "exito",
          pedidoId: data.pedidoId,
        });
      } else {
        navigation.navigate("ResultadoPago", { estado: "error" });
      }
    } catch (err) {
      navigation.navigate("ResultadoPago", { estado: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleShouldStartLoad = (request: any) => {
    if (request.url.includes("/webpay/commit-mobile")) {
      handlePaymentResult();
      return false; // evitamos que WebView haga el request (ya lo manejamos manualmente)
    }
    return true;
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0b9444" />
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: `${paymentUrl}?token_ws=${token}` }}
      style={{ flex: 1 }}
      onShouldStartLoadWithRequest={handleShouldStartLoad}
    />
  );
}
