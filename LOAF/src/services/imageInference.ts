
import * as ImagePicker from 'expo-image-picker';

const HF_TOKEN = "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";
const API_URL = "https://api-inference.huggingface.co/models/rajistics/finetuned-indian-food";

export async function predictFoodFromImage(imageUri: string) {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const result = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${HF_TOKEN}` },
      method: "POST",
      body: blob,
    });

    const data = await result.json();
    
    if (data.error) throw new Error(data.error);
    
    // Return top 3 predictions
    return Array.isArray(data) ? data.slice(0, 3) : [];
  } catch (error) {
    console.error("Image inference error:", error);
    return [];
  }
}

export async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  return result.canceled ? null : result.assets[0].uri;
}

export async function takePhoto() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Camera permission not granted');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  return result.canceled ? null : result.assets[0].uri;
}
