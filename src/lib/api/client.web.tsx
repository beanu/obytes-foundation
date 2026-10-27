import Env from '@env';
import axios from 'axios';

// Web and static rendering must not import the native Nitro module.
export const client = axios.create({
  baseURL: Env.EXPO_PUBLIC_API_URL,
});
