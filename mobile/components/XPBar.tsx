import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "../theme";

function nextLevelXP(level:number) {
  // simple curve
  return 100 + (level - 1) * 40;
}

export default function XPBar({ xp, level }:{ xp:number; level:number }) {
  const goal = nextLevelXP(level);
  const pct = Math.max(0, Math.min(1, xp / goal));
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", justifyContent:"space-between" }}>
        <Text style={{ fontWeight: "800", color: colors.text }}>Level {level}</Text>
        <Text style={{ color: colors.subtext }}>{Math.floor(pct*100)}% to next</Text>
      </View>
      <View style={{ height: 14, backgroundColor: "#e9f8ef", borderRadius: radius.round, overflow:"hidden", borderColor:"#d1fae5", borderWidth:1 }}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x:0, y:0.5 }} end={{ x:1, y:0.5 }}
          style={{ width: `${pct*100}%`, height: "100%" }}
        />
      </View>
    </View>
  );
}
