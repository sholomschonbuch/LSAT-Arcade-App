import { Pressable, View, Text } from "react-native";
import { colors, radius } from "../theme";

export default function ChoiceCard({
  letter, text, state, onPress
}:{ letter:string; text:string; state:"idle"|"correct"|"wrong"|"dim"; onPress:()=>void; }) {
  const styles = {
    idle:   { bg:"#fff", border: colors.border },
    correct:{ bg:"#ecfdf5", border:"#86efac" },
    wrong:  { bg:"#fef2f2", border:"#fca5a5" },
    dim:    { bg:"#f9fafb", border: colors.border }
  }[state];

  return (
    <Pressable onPress={onPress} disabled={state!=="idle"} style={{
      backgroundColor: styles.bg, borderWidth:1, borderColor: styles.border,
      padding: 14, borderRadius: radius.lg, flexDirection:"row", gap:12, alignItems:"flex-start"
    }}>
      <View style={{
        width: 30, height: 30, borderRadius: 9999, borderWidth:1, borderColor: colors.border,
        backgroundColor:"#fff", alignItems:"center", justifyContent:"center"
      }}>
        <Text style={{ fontWeight:"800" }}>{letter}</Text>
      </View>
      <Text style={{ flex:1, color: colors.text }}>{text}</Text>
    </Pressable>
  );
}
