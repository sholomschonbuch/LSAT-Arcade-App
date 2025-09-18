import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          height: 62,
          paddingTop: 6,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          backgroundColor: "#ffffff",
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
        tabBarIconStyle: { marginTop: 4 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({color}) => <Text style={{color,fontSize:18}}>🏠</Text> }} />
      <Tabs.Screen name="play" options={{ title: "Play", tabBarIcon: ({color}) => <Text style={{color,fontSize:18}}>🎯</Text> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({color}) => <Text style={{color,fontSize:18}}>👤</Text> }} />
    </Tabs>
  );
}
