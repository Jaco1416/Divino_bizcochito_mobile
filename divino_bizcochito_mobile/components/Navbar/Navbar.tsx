import React from "react";
import { View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppNavigation } from "../../types/navigation";

type NavbarProps = {
  activeTab?: "home" | "edit" | "messages" | "cart" | "profile";
};

export default function Navbar({ activeTab = "home" }: NavbarProps) {
  const navigation = useNavigation<AppNavigation>();
  const route = useRoute();

  const routeTab = (() => {
    switch (route.name) {
      case "Home":
        return "home";
      case "Recetas":
      case "DetalleReceta":
      case "CrearReceta":
        return "edit";
      case "Catalogo":
      case "DetalleProducto":
        return "messages";
      case "Carrito":
      case "PagoView":
      case "ResultadoPago":
        return "cart";
      case "Profile":
      case "EditProfileView":
        return "profile";
      default:
        return activeTab;
    }
  })();

  const getColors = (tab: string) => {
    const isActive = routeTab === tab;
    return {
      icon: isActive ? "#8B2E2E" : "#C74444",
      circle: isActive ? "#F3D4D4" : "transparent",
    };
  };

  const handleTabPress = (tab: "home" | "edit" | "messages" | "cart" | "profile") => {
    switch (tab) {
      case "home":
        navigation.navigate("Home");
        break;
      case "profile":
        navigation.navigate("Profile");
        break;
      case "edit":
        navigation.navigate("Recetas");
        break;
      case "messages":
        navigation.navigate("Catalogo");
        break;
      case "cart":
        navigation.navigate("Carrito");
        break;
    }
  };

  const TabButton = ({
    tab,
    children,
  }: {
    tab: "home" | "edit" | "messages" | "cart" | "profile";
    children: React.ReactNode;
  }) => {
    const colors = getColors(tab);
    return (
      <TouchableOpacity
        className="p-2 justify-center items-center"
        onPress={() => handleTabPress(tab)}
        activeOpacity={0.85}
      >
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.circle }}
        >
          {children}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="bg-bizcochito-beige">
      <View className="flex-row justify-around items-center bg-bizcochito-beige py-3 px-5 border-b-2 border-[#D4C4B0] shadow-sm">
        <TabButton tab="home">
          <Ionicons name="home" size={28} color={getColors("home").icon} />
        </TabButton>

        <TabButton tab="edit">
          <MaterialIcons name="edit" size={28} color={getColors("edit").icon} />
        </TabButton>

        <TabButton tab="messages">
          <Ionicons name="pricetags-sharp" size={24} color={getColors("messages").icon} />
        </TabButton>

        <TabButton tab="cart">
          <Ionicons name="cart" size={28} color={getColors("cart").icon} />
        </TabButton>

        <TabButton tab="profile">
          <FontAwesome5 name="user" size={24} color={getColors("profile").icon} />
        </TabButton>
      </View>
    </SafeAreaView>
  );
}
