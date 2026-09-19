import { Injectable } from '@angular/core';
import { EXTENSION_SCRIPT_PATHS } from '@pdp-ai/extension-paths';

@Injectable({ providedIn: 'root' })
export class ChromeScriptingService {
  injectAnalyzeScripts(tabId: number): void {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: [EXTENSION_SCRIPT_PATHS.contentScript],
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error('Content script injection failed:', chrome.runtime.lastError.message);
          return;
        }
        chrome.scripting.executeScript({
          target: { tabId },
          world: 'MAIN',
          files: [EXTENSION_SCRIPT_PATHS.domUpdater],
        });
      },
    );
  }

  getActiveTabId(callback: (tabId: number | undefined) => void): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      callback(tabs[0]?.id);
    });
  }
}
