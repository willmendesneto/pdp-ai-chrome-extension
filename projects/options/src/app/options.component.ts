import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChromeStorageService } from './chrome-storage.service';

@Component({
  selector: 'pdp-options-root',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="options-page">
      <header>
        <h1>Extension Settings</h1>
      </header>

      <div class="options-card">
        <p class="options-lead">
          Enter your Google Gemini API key to use PDP AI on product pages.
        </p>

        <div class="field-group">
          <label for="geminiApiKey">Gemini API Key</label>
          <input
            id="geminiApiKey"
            type="text"
            placeholder="Your API key here"
            autocomplete="off"
            [(ngModel)]="apiKey"
          />
          <span class="field-hint">
            Get a key from
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
              >Google AI Studio</a
            >. Stored locally in this browser only.
          </span>
        </div>

        <button type="button" class="primary" (click)="save()">Save Key</button>

        @if (statusMessage()) {
          <p class="status-message" [class]="statusClass()">{{ statusMessage() }}</p>
        }
      </div>
    </div>
  `,
})
export class OptionsComponent implements OnInit {
  apiKey = '';
  readonly statusMessage = signal('');
  readonly statusClass = signal('');

  constructor(private readonly storage: ChromeStorageService) {}

  async ngOnInit(): Promise<void> {
    const saved = await this.storage.getApiKey();
    if (saved) {
      this.apiKey = saved;
    }
  }

  async save(): Promise<void> {
    const trimmed = this.apiKey.trim();
    if (!trimmed) {
      this.statusMessage.set('Please enter a valid API key.');
      this.statusClass.set('status-error');
      return;
    }
    await this.storage.saveApiKey(trimmed);
    this.statusMessage.set('API key saved successfully!');
    this.statusClass.set('status-success');
    setTimeout(() => this.statusMessage.set(''), 3000);
  }
}
