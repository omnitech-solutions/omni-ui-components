type NotificationApi = {
  success: (args: { message: string; description?: string }) => void;
  error: (args: { message: string; description?: string }) => void;
  info: (args: { message: string; description?: string }) => void;
  warning: (args: { message: string; description?: string }) => void;
};

const notify = ({ message, description }: { message: string; description?: string }) => {
  if (typeof window !== 'undefined') window.setTimeout(() => window.alert(description ? `${message}\n\n${description}` : message), 0);
};

export const notification: NotificationApi = {
  success: notify,
  error: notify,
  info: notify,
  warning: notify,
};
