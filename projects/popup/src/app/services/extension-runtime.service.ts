import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { MESSAGE_TYPES, type RuntimeMessage } from '@pdp-ai/messaging';
import { Observable, Subject } from 'rxjs';

export type PopupRuntimeEvent =
  | { kind: 'success'; payload: RuntimeMessage & { type: typeof MESSAGE_TYPES.UPDATE_SUCCESS } }
  | { kind: 'error' };

@Injectable({ providedIn: 'root' })
export class ExtensionRuntimeService implements OnDestroy {
  private readonly eventsSubject = new Subject<PopupRuntimeEvent>();
  readonly events$: Observable<PopupRuntimeEvent> = this.eventsSubject.asObservable();

  private readonly listener = (request: { type?: string; payload?: unknown }) => {
    this.ngZone.run(() => {
      if (request.type === MESSAGE_TYPES.UPDATE_SUCCESS) {
        this.eventsSubject.next({
          kind: 'success',
          payload: request as RuntimeMessage & { type: typeof MESSAGE_TYPES.UPDATE_SUCCESS },
        });
      } else if (
        request.type === MESSAGE_TYPES.UPDATE_ERROR ||
        request.type === MESSAGE_TYPES.LLM_ERROR
      ) {
        this.eventsSubject.next({ kind: 'error' });
      }
    });
  };

  constructor(private readonly ngZone: NgZone) {
    chrome.runtime.onMessage.addListener(this.listener);
  }

  ngOnDestroy(): void {
    chrome.runtime.onMessage.removeListener(this.listener);
  }
}
