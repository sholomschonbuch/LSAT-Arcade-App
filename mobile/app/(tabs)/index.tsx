import { Link } from "expo-router";
import { View, Text, Pressable, ScrollView } from "react-native";
import { colors, radius, shadow } from "../../theme";
import { useEffect, useState } from "react";
import { loadProfile, Profile } from "../../utils/storage";

export default function Home() {
  const [profile, setProfile] = useState<Profile>({ xp:0, level:1, streak:0, lives:5, coins:0, lastPlayed:null });
  useEffect(() => { (async()=>setProfile(await loadProfile()))(); }, []);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 28, fontWeight:"900", color: "#4f46e5" }}>LSAT Arcade</Text>

      <View style={[{ backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, gap: 10, borderWidth:1, borderColor: colors.border }, shadow.card]}>
        <Text style={{ color: colors.subtext, fontWeight:"800" }}>YOUR STATS</Text>
        <Row label="Level" value={String(profile.level)} />
        <Row label="XP" value={String(profile.xp)} />
        <Row label="Streak 🔥" value={String(profile.streak)} />
        <Row label="Lives ❤️" value={String(profile.lives)} />
        <Row label="Coins 🪙" value={String(profile.coins)} />
      </View>

      <Link href="/(tabs)/play" asChild>
        <Pressable style={{
          backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.lg,
          alignItems:"center"
        }}>
          <Text style={{ color: "#fff", fontWeight:"900", fontSize: 16 }}>Continue Lesson</Text>
        </Pressable>
      </Link>

      <View style={{ flexDirection:"row", gap: 10 }}>
        <Link href="/(tabs)/play" asChild>
          <Pressable style={pill("#8b5cf6")}><Text style={pillText()}>Logical Reasoning</Text></Pressable>
        </Link>
        <Pressable style={pill("#f59e0b")}><Text style={pillText()}>Reading Comp</Text></Pressable>
        <Pressable style={pill("#06b6d4")}><Text style={pillText()}>Logic Games</Text></Pressable>
      </View>
    </ScrollView>
  );
}

function Row({ label, value }:{label:string; value:string}) {
  return (
    <View style={{ flexDirection:"row", justifyContent:"space-between", paddingVertical: 6 }}>
      <Text style={{ color: colors.text, fontWeight:"700" }}>{label}</Text>
      <Text style={{ color: colors.text }}>{value}</Text>
    </View>
  );
}
const pill = (bg:string)=>({ backgroundColor: bg, paddingVertical:10, paddingHorizontal:12, borderRadius: 9999 });
const pillText = ()=>({ color:"#fff", fontWeight:"800" });
