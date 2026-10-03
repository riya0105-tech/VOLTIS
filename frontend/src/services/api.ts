import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : '';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export let isUsingMockData = false;

type MockStatusListener = (val: boolean) => void;
const listeners = new Set<MockStatusListener>();

export function setUsingMockData(val: boolean) {
  if (isUsingMockData !== val) {
    isUsingMockData = val;
    listeners.forEach((l) => l(val));
  }
}

export function subscribeMockStatus(cb: MockStatusListener): () => void {
  listeners.add(cb);
  cb(isUsingMockData);
  return () => {
    listeners.delete(cb);
  };
}

