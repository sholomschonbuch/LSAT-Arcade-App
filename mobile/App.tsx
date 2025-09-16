import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, TextInput, Button, View, Text } from 'react-native';
import { Provider as PaperProvider, Appbar, Card, Title, Paragraph } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { generateQuestion, tutorChat } from '../src/lib/openai';

// Type definitions for chat messages and questions
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Question {
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
}

function TutorScreen() {
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    const updated = [...history, userMsg];
    setHistory(updated);
    setInput('');
    setLoading(true);
    const reply = await tutorChat(updated);
    setHistory([...updated, { role: 'assistant', content: reply }]);
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Tutor Chat" />
      </Appbar.Header>
      <ScrollView style={{ flex: 1, padding: 12 }}>
        {history.map((msg, i) => (
          <Card key={i} style={{ marginVertical: 4, backgroundColor: msg.role === 'user' ? '#E0F2FE' : '#F0FFF4' }}>
            <Card.Content>
              <Paragraph>{msg.content}</Paragraph>
            </Card.Content>
          </Card>
        ))}
        {loading && <Paragraph style={{ margin: 8 }}>Thinking…</Paragraph>}
      </ScrollView>
      <View style={{ flexDirection: 'row', padding: 12 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question…"
          style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
        />
        <Button title="Send" onPress={send} disabled={loading} />
      </View>
    </SafeAreaView>
  );
}

function DrillScreen() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExp, setShowExp] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNew = async () => {
    setLoading(true);
    const q = await generateQuestion();
    setQuestion(q);
    setSelected(null);
    setShowExp(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchNew();
  }, []);

  const submit = () => {
    if (!question || !selected) return;
    if (selected === question.answer) {
      setXp((x) => x + 10);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
    setShowExp(true);
  };

  if (!question) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button title="Load Question" onPress={fetchNew} disabled={loading} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Drill Game" />
        <Text style={{ color: '#fff', marginRight: 12 }}>XP: {xp} | Streak: {streak}</Text>
      </Appbar.Header>
      <ScrollView style={{ flex: 1, padding: 12 }}>
        <Title>{question.question}</Title>
        {question.choices.map((c, i) => {
          const letter = String.fromCharCode(65 + i);
          const isSelected = selected === letter;
          const correct = showExp && letter === question.answer;
          return (
            <Card
              key={letter}
              onPress={() => !showExp && setSelected(letter)}
              style={{
                marginVertical: 4,
                borderWidth: 1,
                borderColor: isSelected ? (correct ? 'green' : 'red') : '#ccc',
              }}
            >
              <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', marginRight: 4 }}>{letter}.</Text>
                <Text>{c}</Text>
              </Card.Content>
            </Card>
          );
        })}
        {showExp && (
          <Card style={{ marginTop: 12, backgroundColor: '#FEFCE8', borderLeftWidth: 4, borderLeftColor: 'gold' }}>
            <Card.Content>
              <Text>Explanation: {question.explanation}</Text>
              <Button title="Next Question" onPress={fetchNew} />
            </Car.Content>
        </Card>
        )}
        {!showExp && (
          <Button title="Submit" onPress={submit} disabled={!selected} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              const icons: Record<string, keyof typeof Ionicons.glyphMap> = { Tutor: 'chatbubbles', Drill: 'bulb' };
              return <Ionicons name={icons[route.name]} color={color} size={size} />;
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name="Tutor" component={TutorScreen} />
          <Tab.Screen name="Drill" component={DrillScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
