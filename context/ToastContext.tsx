import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type ToastType = "success" | "error" | "info";

interface ToastContextType {
  isVisible: boolean;
  message: string;
  type: ToastType;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");

  const showToast = useCallback(
    (msg: string, toastType: ToastType = "success") => {
      setMessage(msg);
      setType(toastType);
      setIsVisible(true);
    },
    [],
  );

  const hideToast = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <ToastContext.Provider
      value={{ isVisible, message, type, showToast, hideToast }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
