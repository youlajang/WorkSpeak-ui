import React, { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";

type DialogType = "alert" | "confirm" | null;

type ConfirmOptions = { destructive?: boolean };

type DialogState = {
  type: DialogType;
  message: string;
  destructive?: boolean;
  resolve: (value: boolean) => void;
};

const DialogContext = createContext<{
  alert: (message: string) => Promise<void>;
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
} | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null);

  const alert = useCallback((message: string) => {
    return new Promise<void>((resolve) => {
      setState({
        type: "alert",
        message,
        resolve: () => {
          setState(null);
          resolve();
        },
      });
    });
  }, []);

  const confirm = useCallback((message: string, options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        type: "confirm",
        message,
        destructive: options?.destructive,
        resolve: (ok) => {
          setState(null);
          resolve(ok);
        },
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    state?.resolve(state.type === "confirm" ? false : true);
  }, [state]);

  const handleConfirm = useCallback(() => {
    state?.resolve(true);
  }, [state]);

  const value = { alert, confirm };

  return (
    <DialogContext.Provider value={value}>
      {children}
      {state &&
        createPortal(
          <div
            className="ws-dialogOverlay"
            onClick={state.type === "confirm" ? handleClose : handleConfirm}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ws-dialog-message"
          >
            <div
              className="ws-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <p id="ws-dialog-message" className="ws-dialogMessage">
                {state.message}
              </p>
              <div className="ws-dialogActions">
                {state.type === "confirm" && (
                  <button
                    type="button"
                    className={`ws-dialogBtn ${state.destructive ? "ws-dialogBtnOk" : "ws-dialogBtnCancel"}`}
                    onClick={handleClose}
                  >
                    No
                  </button>
                )}
                <button
                  type="button"
                  className={`ws-dialogBtn ${state.type === "confirm" && state.destructive ? "ws-dialogBtnCancel" : "ws-dialogBtnOk"}`}
                  onClick={state.type === "confirm" ? handleConfirm : handleClose}
                >
                  {state.type === "confirm" ? "Yes" : "OK"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}
