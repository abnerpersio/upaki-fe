import { Env } from '@/config/env';
import axios from 'axios';

type PrepareUploadResponse = {
  urls: string[];
};

export async function prepareUpload(fileNames: string[]) {
  const { data } = await axios.post<PrepareUploadResponse>(
    '/prepare-upload',
    { fileNames },
    { baseURL: Env.apiUrl },
  );
  return data.urls;
}
