import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ChoiceCard from "../../components/ChoiceCard";
import { colors, radius, shadow } from "../../theme";
import { loadProfile, saveProfile, Profile } from "../../utils/storage";

type Drill = { question: string; choices: string[]; answer: string; explanation: string; };
const letters = ["A","B","C","D","E"] as const;
const norm = (s:string)=>s.trim().toUpperCase();
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

async function getDrill(): Promise<Drill> {
  if (API_BASE) {
    const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/lsat`, {
      method: "POST", headers: { "content-type":"application/json" },
      body: JSON.stringify({ topic: "logical_reasoning" })
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  }
  const idx = Math.floor(Math.random()*5);
  const choices = ["Premise-strengthening","Assumption","Causal flaw","Inference","Principle"];
  return {
    question: "The argument concludes that a new study method guarantees higher LSAT scores because students who used it scored higher than those who did not. Which choice most accurately describes the reasoning error?",
    choices, answer: letters[idx], explanation: "Correlation ≠ causation; the credited response identifies the causal flaw."
  };
}

export default function Play() {
  const [profile, setProfile] = useState<Profile>({ xp:0, level:1, streak:0, lives:5, coins:0, lastPlayed:null });
  const [loading, setLoading] = useState(false);
  const [drill, setDrill] = useState<Drill | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<"correct"|"wrong"|null>(null);

  useEffect(()=>{(async()=>setProfile(await loadProfile()))();},[]);
  useEffect(()=>{ saveProfile(profile); },[profile]);

  const addXP = (n:number) => setProfile(prev=>{
    let xp = prev.xp + n, level = prev.level, coins = prev.coins + n;
    const need = (lvl:number)=>100 + (lvl-1)*40;
    while (xp >= need(level)) { xp -= need(level); level++; coins += 20; }
    return { ...prev, xp, level, coins };
  });
  const loseLife = ()=> setProfile(prev=>({ ...prev, lives: Math.max(0, prev.lives-1)}));

  const choiceState = (L:string):"idle"|"correct"|"wrong"|"dim"=>{
    if (!result) return "idle";
    const isCorrect = norm(L) === norm(drill?.answer ?? "");
    const isPicked = picked === L;
    if (isCorrect) return "correct";
    if (isPicked) return "wrong";
    return "dim";
  };

  const generate = async ()=>{
    setLoading(true); setDrill(null); setPicked(null); setResult(null);
    try { setDrill(await getDrill()); }
    catch(e:any){ Alert.alert("Oops", e?.message ?? "Failed to generate"); }
    finally{ setLoading(false); }
  };
  useEffect(()=>{ if(!drill) generate(); },[]);

  const submit = (L:string)=>{
    if (!drill || result) return;
    const ok = norm(L) === norm(drill.answer);
    setPicked(L);
    setResult(ok ? "correct" : "wrong");
    if (ok) addXP(10); else loseLife();
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 0 }}>
      {/* Header gradient */}
      <LinearGradient colors={["#22c55e","#16a34a"]} start={{x:0,y:0}} end={{x:1,y:1}} style={{ paddingTop: 50, paddingBottom: 24, paddingHorizontal: 16 }}>
        <Text style={{ color:"#fff", fontWeight:"900", fontSize: 22 }}>Lesson • Logical Reasoning</Text>
        <Text style={{ color:"#eafff0", marginTop: 4 }}>Level {profile.level} • 🔥 {profile.streak} • ❤️ {profile.lives} • 🪙 {profile.coins}</Text>
      </LinearGradient>

      {/* Card */}
      <View style={{ padding: 16 }}>
        <View style={[{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth:1, borderColor: colors.border, padding: 16, gap: 14 }, shadow.card]}>
          <Text style={{ color: "#8b5cf6", fontWeight:"800" }}>QUESTION</Text>
          <Text style={{ fontSize: 18, lineHeight: 24, color: colors.text, fontWeight:"700" }}>{drill?.question || (loading ? "Loading…" : " ")}</Text>

          <View style={{ gap: 10 }}>
            {drill?.choices?.map((t, i)=>{
              const L = letters[i] ?? String.fromCharCode(65+i);
              return <ChoiceCard key={L} letter={L} text={t} state={choiceState(L)} onPress={()=>submit(L)} />;
            })}
          </View>

          {result && (
            <View style={{
              borderRadius: radius.md, borderWidth:1,
              borderColor: result==="correct" ? "#86efac" : "#fca5a5",
              backgroundColor: result==="correct" ? "#ecfdf5" : "#fef2f2",
              padding: 12
            }}>
              <Text style={{ fontWeight:"800", marginBottom: 4 }}>
                {result==="correct" ? "Correct! ✅ +10 XP" : "Incorrect. ❌ -1 ❤️"}
              </Text>
              <Text style={{ color: colors.text }}>
                <Text style={{ fontWeight:"800" }}>Answer:</Text> {drill?.answer} — {drill?.explanation}
              </Text>
            </View>
          )}

          <View style={{ flexDirection:"row", gap: 10 }}>
            <Pressable onPress={generate} disabled={loading} style={{
              backgroundColor: "#22c55e", paddingVertical: 12, paddingHorizontal: 16,
              borderRadius: radius.md, opacity: loading ? 0.6 : 1
            }}>
              <Text style={{ color:"#fff", fontWeight:"900" }}>{loading ? "Loading…" : "Next"}</Text>
            </Pressable>
            <Pressable onPress={()=>setProfile(p=>({...p, lives:5}))} style={{
              backgroundColor:"#fff", borderWidth:1, borderColor: colors.border, paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.md
            }}>
              <Text style={{ color: colors.text, fontWeight:"800" }}>Refill ❤️</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
