type MessageApi = {
  success: (content: string) => void;
  error: (content: string) => void;
  info: (content: string) => void;
  warning: (content: string) => void;
};

const notify = (content: string) => {
  if (typeof window !== 'undefined') window.setTimeout(() => window.alert(content), 0);
};

export const message: MessageApi = {
  success: notify,
  error: notify,
  info: notify,
  warning: notify,
};
