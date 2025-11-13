import { useEffect, useRef } from "react";
import { Platform, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

type TokenCallback = (token: string) => void;
type ResponseCallback = (
  response: Notifications.NotificationResponse
) => void;

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
}

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert(
      "Notificaciones",
      "Solo los dispositivos físicos pueden recibir notificaciones push."
    );
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert(
      "Permiso requerido",
      "Activa las notificaciones para recibir alertas de tus pedidos."
    );
    return null;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
    "014dfe65-3188-4e00-878a-da4eeeb3f9a8";

  if (!projectId) {
    console.warn("⚠️ No se encontró projectId para obtener token push.");
    return null;
  }

  const pushToken = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  await ensureAndroidChannel();

  return pushToken;
}

export function usePushNotifications(
  onToken?: TokenCallback,
  onResponse?: ResponseCallback
) {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (token && onToken && mounted) {
        onToken(token);
      }
    })();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📥 Notificación recibida:", notification.request.content);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("🔁 Usuario interactuó con la notificación");
        onResponse?.(response);
      });

    return () => {
      mounted = false;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [onToken, onResponse]);
}
