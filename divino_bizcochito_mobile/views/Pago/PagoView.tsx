import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

export default function PagoView({ route, navigation }: any) {
  const { paymentUrl, token } = route.params;
  const [loading, setLoading] = useState(false);
  const [hasCommitted, setHasCommitted] = useState(false); // 👈 evita doble commit

  const handlePaymentResult = async () => {
    if (hasCommitted) return; // 🚫 Evita commit duplicado
    setHasCommitted(true);

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
      onNavigationStateChange={(navState) => {
        if (
          navState.url.includes("/webpay/commit-mobile") &&
          !hasCommitted
        ) {
          handlePaymentResult();
        }
      }}
    />
  );
}
