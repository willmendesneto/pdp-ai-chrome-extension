import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { buildComparisonFields, type LlmPayload } from '@pdp-ai/llm-contract';
import { Subscription } from 'rxjs';
import { ComparisonBlockComponent } from './components/comparison-block.component';
import { ChromeScriptingService } from './services/chrome-scripting.service';
import { ExtensionRuntimeService } from './services/extension-runtime.service';

type PopupView = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'pdp-root',
  standalone: true,
  imports: [ComparisonBlockComponent],
  template: `
    <div class="container">
      <h1>PDP Analysis</h1>
      <p>Click the button to analyze the page and see suggestions in real time.</p>

      @if (view() !== 'loading') {
        <button type="button" class="primary" (click)="analyze()" [disabled]="view() === 'loading'">
          Analyze Page
        </button>
      }

      @if (view() === 'loading') {
        <div class="loading-block">
          <div class="spinner"></div>
          <p>Analyzing and generating content...</p>
        </div>
      }

      @if (view() === 'success') {
        <p><strong>Success!</strong> The suggestions have been applied to the page.</p>
      }

      @if (view() === 'success' && payload()) {
        <div>
          <h2>Generated Suggestions</h2>
          <p>
            The changes were applied already, but don't worry! In case you don't want that to be
            published just refresh the page and they will be reverted to the previous version.
          </p>
          <div class="results-container">
            <pdp-comparison-block
              sectionTitle="Metadata (SEO)"
              [fields]="headFields()"
            />
            <pdp-comparison-block
              sectionTitle="Page Content (UX)"
              [fields]="bodyFields()"
            />
          </div>
        </div>
      }

      @if (view() === 'error') {
        <p>An error occurred. Please try again in a few minutes or contact us.</p>
      }
    </div>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  readonly view = signal<PopupView>('idle');
  readonly payload = signal<LlmPayload | null>(null);

  private sub?: Subscription;

  constructor(
    private readonly scripting: ChromeScriptingService,
    private readonly runtime: ExtensionRuntimeService,
  ) {}

  ngOnInit(): void {
    this.sub = this.runtime.events$.subscribe((event) => {
      if (event.kind === 'success') {
        this.payload.set(event.payload.payload);
        this.view.set('success');
      } else {
        this.view.set('error');
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  headFields() {
    const p = this.payload();
    return p ? buildComparisonFields(p.head, false) : [];
  }

  bodyFields() {
    const p = this.payload();
    return p ? buildComparisonFields(p.body, true) : [];
  }

  analyze(): void {
    this.view.set('loading');
    this.payload.set(null);
    this.scripting.getActiveTabId((tabId) => {
      if (tabId === undefined) {
        this.view.set('error');
        return;
      }
      this.scripting.injectAnalyzeScripts(tabId);
    });
  }
}
