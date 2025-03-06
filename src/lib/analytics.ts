type EventParams = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

interface WindowWithGtag extends Window {
  gtag: (command: string, action: string, params: Record<string, unknown>) => void;
}

export const trackEvent = ({ action, category, label, value }: EventParams) => {
  if (typeof window !== 'undefined') {
    const windowWithGtag = window as unknown as WindowWithGtag;
    if (windowWithGtag.gtag) {
      windowWithGtag.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }
}; 