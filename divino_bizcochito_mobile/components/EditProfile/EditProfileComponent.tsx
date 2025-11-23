import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../libs/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import type { ImagePickerAsset } from "expo-image-picker";

const DEFAULT_AVATAR =
  "https://kvouupzgdjriuvzynidv.supabase.co/storage/v1/object/public/project_assets/Users/User_default.png";
const STORAGE_BUCKET = "project_assets";
const STORAGE_FOLDER = "Users";

const formatTelefono = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)} ${digits.slice(4)}`.trim();
};

function EditProfileComponent() {
  const { user, perfil, refreshPerfil } = useAuth();
  const navigation = useNavigation();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [uploading, setUploading] = useState(false);
  const [forceDefault, setForceDefault] = useState(false);

  const initialImage = useMemo(() => perfil?.imagen || DEFAULT_AVATAR, [perfil?.imagen]);

  useEffect(() => {
    setNombre(perfil?.nombre || "");
    const tel = perfil?.telefono?.replace(/\+56\s?9\s?/, "") || "";
    setTelefono(formatTelefono(tel));
    setImageUri(perfil?.imagen || null);
    setForceDefault(false);
  }, [perfil]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tus fotos para cambiar el avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset: ImagePickerAsset = result.assets[0];
      setImageUri(asset.uri);
      setImageMime(asset.mimeType || "image/jpeg");
      setForceDefault(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUri(DEFAULT_AVATAR);
    setForceDefault(true);
  };

  const uploadImageIfNeeded = async (): Promise<string> => {
    if (forceDefault) return DEFAULT_AVATAR;
    if (!imageUri || imageUri === initialImage) {
      return imageUri || DEFAULT_AVATAR;
    }

    const ext = imageUri.split(".").pop() || "jpg";
    const filePath = `${STORAGE_FOLDER}/user-${user?.id}-${Date.now()}.${ext}`;

    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, arrayBuffer, { upsert: true, contentType: imageMime || "image/jpeg" });

    if (uploadError) {
      console.error("Error al subir imagen:", uploadError);
      throw new Error("No se pudo subir la imagen");
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    return data.publicUrl || DEFAULT_AVATAR;
  };

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('session user id', session?.user.id);
    console.log('perfil id', perfil?.id);
    if (!user?.id) {
      Alert.alert("Error", "No hay usuario autenticado.");
      return;
    }
    if (!nombre.trim()) {
      Alert.alert("Nombre requerido", "Ingresa tu nombre.");
      return;
    }
    const telDigits = telefono.replace(/\D/g, "");
    if (telDigits.length !== 8) {
      Alert.alert("Teléfono inválido", "El teléfono debe tener 8 dígitos (formato 8888 8888).");
      return;
    }
    setUploading(true);
    try {
      const finalImageUrl = await uploadImageIfNeeded();
      const formattedPhone = `+56 9 ${formatTelefono(telDigits)}`.trim();

      const { error } = await supabase
        .from("Perfiles")
        .update({
          nombre: nombre.trim(),
          telefono: formattedPhone,
          imagen: finalImageUrl,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error al actualizar perfil:", error);
        throw new Error("No se pudo actualizar el perfil");
      }

      Alert.alert("Listo", "Perfil actualizado correctamente.", [
        {
          text: "Aceptar",
          onPress: async () => {
            try {
              await refreshPerfil();
            } catch (errRefresh) {
              console.error("Error refrescando perfil:", errRefresh);
            }
            navigation.goBack();
          },
        },
      ]);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "No se pudo actualizar el perfil.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#FDF7F7]"
      contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40, alignItems: "center" }}
    >
      <View className="w-full max-w-xl">
        <Text className="text-2xl font-bold text-[#8B2E2E] mb-4 text-center">Editar perfil</Text>

        <View className="items-center mb-6">
          <View className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#8B2E2E] mb-3 bg-white">
            <Image
              source={{ uri: imageUri || initialImage || DEFAULT_AVATAR }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={pickImage}
              className="bg-bizcochito-red px-4 py-2 rounded-full"
              activeOpacity={0.85}
            >
              <Text className="text-white font-semibold">Cambiar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRemoveImage}
              className="bg-gray-200 px-4 py-2 rounded-full"
              activeOpacity={0.85}
            >
              <Text className="text-[#8B2E2E] font-semibold">Quitar foto</Text>
            </TouchableOpacity>
          </View>
          {!imageUri && (
            <Text className="text-gray-500 text-xs mt-2 text-center">
              Si no eliges una foto, se usará la imagen por defecto.
            </Text>
          )}
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <Text className="text-gray-700 font-semibold mb-1">Nombre</Text>
          <TextInput
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            className="bg-gray-100 rounded-lg px-3 py-2 mb-4 text-gray-900"
            placeholderTextColor="#9CA3AF"
          />

          <Text className="text-gray-700 font-semibold mb-1">Teléfono</Text>
          <View className="flex-row items-center mb-1">
            <Text className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 mr-2">+56 9</Text>
            <TextInput
              value={telefono}
              onChangeText={(val) => setTelefono(formatTelefono(val))}
              placeholder="8888 8888"
              keyboardType="phone-pad"
              className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-gray-900"
              placeholderTextColor="#9CA3AF"
              maxLength={9}
            />
          </View>
          <Text className="text-xs text-gray-500 mb-4">Formato requerido: 8888 8888</Text>

          <TouchableOpacity
            onPress={handleSave}
            className="bg-bizcochito-red py-3 rounded-xl items-center"
            activeOpacity={0.85}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Guardar cambios</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-3 bg-gray-200 py-3 rounded-xl items-center"
            activeOpacity={0.85}
            disabled={uploading}
          >
            <Text className="text-[#8B2E2E] font-semibold text-base">Volver al perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

export default EditProfileComponent;
