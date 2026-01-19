import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons'; 

export interface PhotoResult {
  uri: string;
  base64?: string | null;
  width: number;
  height: number;
}

interface SelfieCameraProps {
  onPhotoSelected: (photo: PhotoResult) => void;
  onClose?: () => void; 
}

export default function SelfieCamera({ onPhotoSelected, onClose }: SelfieCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need camera access to analyze your hair style!
        </Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

const takePicture = async () => {
  if (cameraRef.current) {
    try {
      console.log("Attempting to capture...");

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5, 
        base64: true, 
        exif: false, 
      });

      console.log("Photo taken!", photo.uri);

      if (photo) {
        onPhotoSelected({
          uri: photo.uri,
          base64: photo.base64,
          width: photo.width,
          height: photo.height,
        });
      }
    } catch (error) {
      console.error("Camera Error:", error); 
      Alert.alert('Error', 'Camera failed. See terminal for details.');
    }
  }
};

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'We need access to your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5], 
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      onPhotoSelected({
        uri: asset.uri,
        base64: asset.base64,
        width: asset.width,
        height: asset.height,
      });
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          
          <View style={styles.overlay}>
            <View style={styles.faceGuide} />
            <Text style={styles.guideText}>Align face here</Text>
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
              <Ionicons name="images-outline" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shutterButtonOuter} onPress={takePicture}>
              <View style={styles.shutterButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          )}

        </CameraView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permButtonText: {
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    margin: 0,
  },
  camera: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, 
  },
  faceGuide: {
    width: 260,
    height: 350,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 180, 
    borderStyle: 'dashed',
  },
  guideText: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },

  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
  },
  shutterButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});