import axios from 'axios';

type UploadPayload = {
  url: string;
  file: File;
  onProgress?: (percentage: number) => void;
};

export async function uploadFile({ url, file, onProgress }: UploadPayload) {
  await axios.put(url, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: ({ total = 1, loaded }) => {
      const percentage = Math.round(loaded / total) * 100;
      onProgress?.(percentage);
    },
  });
}
