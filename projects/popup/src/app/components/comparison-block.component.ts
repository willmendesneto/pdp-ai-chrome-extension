import { Component, Input } from '@angular/core';
import type { ComparisonFieldView } from '@pdp-ai/llm-contract';

@Component({
  selector: 'pdp-comparison-block',
  standalone: true,
  template: `
    <div class="result-section">
      <h3><small>Optimization for</small> {{ sectionTitle }}</h3>
      @for (field of fields; track field.label) {
        <div class="result-item">
          <h4>{{ field.label }}</h4>
          <div><strong>Original:</strong> {{ field.originalText }}</div>
          <div><strong>Suggestion:</strong> {{ field.suggestedText }}</div>
          <div><strong>Reason:</strong> {{ field.reason }}</div>
        </div>
      }
    </div>
  `,
})
export class ComparisonBlockComponent {
  @Input({ required: true }) sectionTitle!: string;
  @Input({ required: true }) fields!: ComparisonFieldView[];
}
