// Global Call Service & Event Dispatcher
export interface CallDetails {
  recipientTitle: string;
  phoneNumber: string;
  department?: string;
}

const CALL_EVENT_NAME = 'itum_serva_initiate_call';

export const initiateCall = (recipientTitle: string, phoneNumber = '+94 77 149 0016', department = 'Central Facilities'): void => {
  // 1. Dispatch custom event for in-app dialer UI
  window.dispatchEvent(
    new CustomEvent<CallDetails>(CALL_EVENT_NAME, {
      detail: {
        recipientTitle,
        phoneNumber,
        department,
      },
    })
  );

  // 2. Also trigger native tel: handler if mobile browser supports it without blocking
  try {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `tel:${phoneNumber.replace(/\s+/g, '')}`;
    }
  } catch (e) {
    // Ignore fallback errors on desktop
  }
};

export const subscribeToCallEvents = (callback: (details: CallDetails) => void): (() => void) => {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<CallDetails>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  window.addEventListener(CALL_EVENT_NAME, handler);
  return () => window.removeEventListener(CALL_EVENT_NAME, handler);
};
