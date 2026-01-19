import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import SelfieCamera, { PhotoResult } from '@/components/SelfieCamera';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export default function HomeScreen({ navigation }: Props) {

  const handlePhotoCaptured = (result: PhotoResult) => {
    console.log("Navigating to Results with:", result.uri);
    
    navigation.navigate('Results', { 
      photoUri: result.uri,
      base64: result.base64 ?? undefined 
    });
  };

  return (
    <View style={styles.container}>
      <SelfieCamera onPhotoSelected={handlePhotoCaptured} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
});