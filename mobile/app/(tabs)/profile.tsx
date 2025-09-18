import { View, Text, Pressable, ScrollView } from "react-native";
import { colors } from "../../theme";
import { loadProfile } from "../../utils/storage";
import { useEffect, useState } from "react";

export default function Profile() {
  const [p, setP] = useState<any>(null);
  useEffect(()=>{ (async()=> setP(await loadProfile()))(); },[]);
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight:"900", color:"#4f46e5" }}>Profile</Text>
      <Text>Level: {p?.level ?? "-"}</Text>
      <Text>XP: {p?.xp ?? "-"}</Text>
      <Text>Streak: {p?.streak ?? "-"}</Text>
      <Text>Lives: {p?.lives ?? "-"}</Text>
      <Text>Coins: {p?.coins ?? "-"}</Text>
    </ScrollView>
  );
}
