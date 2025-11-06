import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import LayoutWithNavbar from "../../components/Layout/LayoutWithNavbar";
import { CommonActions, useNavigation } from "@react-navigation/native";
import type { AppNavigation } from "../../types/navigation";
import { useAuth } from "../../contexts/AuthContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const RECIPES_PATH = "recetas";

function fileFromUri(uri: string) {
  const parts = uri.split("/");
  const name = parts[parts.length - 1] || `receta_${Date.now()}.jpg`;
  const ext = name.split(".").pop()?.toLowerCase();
  const type =
    ext === "png" ? "image/png" :
    ext === "webp" ? "image/webp" :
    ext === "heic" || ext === "heif" ? "image/heic" :
    "image/jpeg";
  return { uri, name, type };
}

export default function CrearRecetaView() {
  const navigation = useNavigation<AppNavigation>();
  const { user, perfil } = useAuth();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ingredientes, setIngredientes] = useState("");
  const [pasos, setPasos] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso requerido", "Necesitas permitir acceso a la galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri ?? null);
    }
  }

  function validate() {
    if (!user?.id) return "Debes iniciar sesión.";
    if (!titulo.trim()) return "El título es obligatorio.";
    if (!descripcion.trim()) return "La descripción es obligatoria.";
    if (!ingredientes.trim()) return "Los ingredientes son obligatorios.";
    if (!pasos.trim()) return "Los pasos son obligatorios.";
    if (!categoria.trim()) return "La categoría es obligatoria.";
    if (!imageUri) return "Debes seleccionar una imagen.";
    if (!API_URL) return "Falta EXPO_PUBLIC_API_URL.";
    return null;
  }

  async function handleSubmit() {
    const v = validate();
    if (v) {
      Alert.alert("Error", v);
      return;
    }
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("titulo", titulo.trim());
      form.append("descripcion", descripcion.trim());
      form.append("ingredientes", ingredientes.trim());
      form.append("pasos", pasos.trim());
      form.append("categoria", categoria.trim());
      form.append("autorId", String(user!.id));
      if (imageUri) {
        const file = fileFromUri(imageUri);
        form.append("imagen", file as any);
      }

      const res = await fetch(`${API_URL}/${RECIPES_PATH}`, {
        method: "POST",
        body: form,
      });

      const raw = await res.text();
      let data: any = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch {}
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status} - ${raw}`);
      }

      Alert.alert("Éxito", "Receta creada correctamente.");

      // Reset + flag para bloquear volver
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Recetas", params: { lockBack: true } }],
        })
      );
    } catch (e: any) {
      Alert.alert("Error", e?.message || "No se pudo crear la receta.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LayoutWithNavbar>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 120 }}>
            <Text className="text-bizcochito-red text-2xl font-bold text-center mb-4">Crear receta</Text>
            {perfil?.nombre && (
              <Text className="text-center text-gray-600 mb-2">
                Autor: {perfil.nombre} ({perfil.rol})
              </Text>
            )}
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.85}
              className="bg-bizcochito-red rounded-2xl items-center justify-center mb-6 overflow-hidden"
              style={{ height: 260 }}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="items-center">
                  <Text className="text-white text-6xl mb-2">+</Text>
                  <Text className="text-white text-sm">Sube una foto del resultado</Text>
                </View>
              )}
            </TouchableOpacity>

            <Field label="Título" value={titulo} onChangeText={setTitulo} placeholder="Ej: Torta de chocolate" />
            <Field label="Descripción" value={descripcion} onChangeText={setDescripcion} multiline minHeight={90} placeholder="Describe la receta..." />
            <Field label="Ingredientes" value={ingredientes} onChangeText={setIngredientes} multiline minHeight={90} placeholder="Lista los ingredientes..." />
            <Field label="Pasos" value={pasos} onChangeText={setPasos} multiline minHeight={110} placeholder="Explica el paso a paso..." />
            <Field label="Categoría" value={categoria} onChangeText={setCategoria} placeholder="Ej: Torta, Pie..." />

            <View className="mt-6 items-end">
              <TouchableOpacity
                disabled={submitting}
                onPress={handleSubmit}
                activeOpacity={0.9}
                className={`bg-bizcochito-red rounded-lg px-6 py-3 ${submitting ? "opacity-70" : ""}`}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">Crear receta</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LayoutWithNavbar>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  minHeight,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  minHeight?: number;
}) {
  return (
    <View className="mb-4">
      <Text className="text-black font-medium mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="border border-gray-300 rounded-lg px-3 py-2 text-[#530708]"
        multiline={multiline}
        style={multiline ? { minHeight, textAlignVertical: "top" } : undefined}
      />
    </View>
  );
}