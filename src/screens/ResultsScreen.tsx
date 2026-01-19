import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { analyzeFace, AnalysisResult } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export default function ResultsScreen({ route, navigation }: Props) {
  const { photoUri, base64 } = route.params; 
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    try {
      if (!base64) throw new Error("No image data found");
      
      const data = await analyzeFace(base64);
      setResult(data);
    } catch (error) {
      alert("Analysis failed. Check your computer IP and try again.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Analyzing your face structure...</Text>
        <Image source={{ uri: photoUri }} style={styles.thumbnail} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.headerImage} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Your Profile</Text>
        
        <View style={styles.row}>
          <InfoCard label="Face Shape" value={result?.analysis.faceShape} icon="scan-outline" />
          <InfoCard label="Skin Tone" value={result?.analysis.skinTone} icon="color-palette-outline" />
        </View>

        <Text style={styles.sectionTitle}>Recommended Styles</Text>
        
        {result?.suggestions.map((item, index) => (
          <View key={index} style={styles.suggestionCard}>
             <View style={styles.suggestionHeader}>
               <Ionicons name="sparkles" size={20} color="#FFD700" />
               <Text style={styles.suggestionName}>{item.name}</Text>
             </View>
             <Text style={styles.suggestionReason}>{item.reason}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Welcome')}>
          <Text style={styles.buttonText}>Start Over</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const InfoCard = ({ label, value, icon }: any) => (
  <View style={styles.card}>
    <Ionicons name={icon} size={24} color="#333" />
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 20, fontSize: 16, fontWeight: '500' },
  thumbnail: { width: 100, height: 100, borderRadius: 50, marginTop: 20, opacity: 0.5 },
  
  headerImage: { width: '100%', height: 300 },
  content: { padding: 20, marginTop: -20, backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  
  row: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  card: { flex: 1, backgroundColor: '#f8f9fa', padding: 15, borderRadius: 16, alignItems: 'center' },
  cardLabel: { fontSize: 12, color: '#666', marginTop: 5 },
  cardValue: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  suggestionCard: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 12, marginBottom: 10 },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 },
  suggestionName: { fontSize: 16, fontWeight: 'bold' },
  suggestionReason: { color: '#555', lineHeight: 20 },

  button: { backgroundColor: '#000', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 30 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});