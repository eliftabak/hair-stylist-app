const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/analyze`;

export interface AnalysisResult {
  status: string;
  analysis: {
    faceShape: string;
    skinTone: string;
    hairTexture: string;
  };
  suggestions: { name: string; reason: string }[];
}

export const analyzeFace = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image, 
      }),
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
};