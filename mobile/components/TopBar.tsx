import { View, Text } from "react-native";
import { colors, radius } from "../theme";

export default function TopBar({ lives, streak, coins }:{ lives:number; streak:number; coins:number; }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
      <View style={{ flexDirection:"row", alignItems:"center", gap:6, backgroundColor: "#fff", paddingHorizontal:10, paddingVertical:6, borderRadius: radius.md, borderWidth:1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16 }}>❤️</Text>
        <Text style={{ fontWeight: "800", color: colors.text }}>{lives}</Text>
      </View>
      <View style={{ flexDirection:"row", alignItems:"center", gap:6, backgroundColor: "#fff", paddingHorizontal:10, paddingVertical:6, borderRadius: radius.md, borderWidth:1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16 }}>🔥</Text>
        <Text style={{ fontWeight:"800", color: colors.text }}>{streak}</Text>
      </View>
      <View style={{ flexDirection:"row", alignItems:"center", gap:6, backgroundColor: "#fff", paddingHorizontal:10, paddingVertical:6, borderRadius: radius.md, borderWidth:1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16 }}>🪙</Text>
        <Text style={{ fontWeight:"800", color: colors.text }}>{coins}</Text>
      </View>
    </View>
  );
}
