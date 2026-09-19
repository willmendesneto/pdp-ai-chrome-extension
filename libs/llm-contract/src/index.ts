export interface FieldWithSelectors {
  text: string;
  selectors: string[];
}

export interface SuggestedField {
  text: string;
  reason: string;
}

export interface LlmSection {
  originalTitle: FieldWithSelectors;
  originalDescription: FieldWithSelectors;
  originalShippingReturns: FieldWithSelectors;
  newTitle: SuggestedField;
  newDescription: SuggestedField;
  newShippingReturns: SuggestedField;
}

export interface LlmPayload {
  head: LlmSection;
  body: LlmSection;
}

export interface ComparisonFieldView {
  label: string;
  originalText: string;
  suggestedText: string;
  reason: string;
}

export const buildComparisonFields = (
  section: LlmSection,
  includeShippingReturns: boolean,
): ComparisonFieldView[] => {
  const fields: ComparisonFieldView[] = [
    {
      label: 'Title',
      originalText: section.originalTitle.text,
      suggestedText: section.newTitle.text,
      reason: section.newTitle.reason,
    },
    {
      label: 'Description',
      originalText: section.originalDescription.text,
      suggestedText: section.newDescription.text,
      reason: section.newDescription.reason,
    },
  ];
  if (includeShippingReturns) {
    fields.push({
      label: 'Shipping and Returns',
      originalText: section.originalShippingReturns.text,
      suggestedText: section.newShippingReturns.text,
      reason: section.newShippingReturns.reason,
    });
  }
  return fields;
};
