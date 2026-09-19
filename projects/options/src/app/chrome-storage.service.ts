import { Injectable } from '@angular/core';
import { GEMINI_API_KEY_STORAGE } from '@pdp-ai/extension-paths';

@Injectable({ providedIn: 'root' })
export class ChromeStorageService {
  getApiKey(): Promise<string | undefined> {
    return new Promise((resolve) => {
      chrome.storage.local.get(GEMINI_API_KEY_STORAGE, (data) => {
        resolve(data[GEMINI_API_KEY_STORAGE] as string | undefined);
      });
    });
  }

  saveApiKey(apiKey: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [GEMINI_API_KEY_STORAGE]: apiKey }, () => resolve());
    });
  }
}
