import { apiClient } from "./config";

export interface RecognitionResult {
  isMatch: boolean;
  confidence: number;
  message: string;
  recognitionId?: string;
  reciter?: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  };
}

export const identifyAudio = async (
  audioUri: string,
): Promise<RecognitionResult> => {
  try {
    const formData = new FormData();

    // Append the audio file to the form data
    formData.append("audioSnippet", {
      uri: audioUri,
      name: "recording.m4a",
      type: "audio/m4a",
    } as any);

    // Append additional metadata if needed (e.g., device info, timestamp)
    formData.append("deviceOs", "Mobile App");

    const response = await apiClient.post("/recognitions/identify", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data; // Our Express API wraps the payload in a 'data' object
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to identify reciter",
    );
  }
};
