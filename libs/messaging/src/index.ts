import type { LlmPayload } from '@pdp-ai/llm-contract';

export const MESSAGE_TYPES = {
  SEND_HTML_TO_EXTENSION: 'SEND_HTML_TO_EXTENSION',
  PROCESS_HTML: 'PROCESS_HTML',
  LLM_RESPONSE_UPDATE: 'LLM_RESPONSE_UPDATE',
  UPDATE_PAGE_CONTENT: 'UPDATE_PAGE_CONTENT',
  UPDATE_SUCCESS: 'UPDATE_SUCCESS',
  LLM_ERROR: 'LLM_ERROR',
  UPDATE_ERROR: 'UPDATE_ERROR',
  EXTENSION_CONTEXT_INVALID: 'EXTENSION_CONTEXT_INVALID',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

export interface SendHtmlToExtensionMessage {
  type: typeof MESSAGE_TYPES.SEND_HTML_TO_EXTENSION;
  payload: string;
}

export interface ProcessHtmlMessage {
  type: typeof MESSAGE_TYPES.PROCESS_HTML;
  payload: string;
}

export interface LlmResponseUpdateMessage {
  type: typeof MESSAGE_TYPES.LLM_RESPONSE_UPDATE;
  payload: LlmPayload;
}

export interface UpdatePageContentMessage {
  type: typeof MESSAGE_TYPES.UPDATE_PAGE_CONTENT;
  payload: LlmPayload;
}

export interface UpdateSuccessMessage {
  type: typeof MESSAGE_TYPES.UPDATE_SUCCESS;
  payload: LlmPayload;
}

export interface LlmErrorMessage {
  type: typeof MESSAGE_TYPES.LLM_ERROR;
  payload: { message: string };
}

export interface ExtensionContextInvalidMessage {
  type: typeof MESSAGE_TYPES.EXTENSION_CONTEXT_INVALID;
  payload: { message: string };
}

export type WindowPostMessage =
  | SendHtmlToExtensionMessage
  | UpdatePageContentMessage
  | ExtensionContextInvalidMessage;

export type RuntimeMessage =
  | ProcessHtmlMessage
  | LlmResponseUpdateMessage
  | UpdateSuccessMessage
  | LlmErrorMessage;

export type ExtensionMessage = WindowPostMessage | RuntimeMessage;

export const isRuntimeMessage = (data: unknown): data is RuntimeMessage =>
  typeof data === 'object' &&
  data !== null &&
  'type' in data &&
  typeof (data as { type: unknown }).type === 'string';
