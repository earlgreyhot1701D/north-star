"use client";

interface ErrorNoticeProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorNotice({ message, onRetry, onDismiss }: ErrorNoticeProps) {
  return (
    <div
      role="alert"
      className="ns-panel relative rounded-xl border-danger/70 p-5"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl text-danger" aria-hidden>
          ⚠
        </span>
        <div className="flex-1">
          <h4 className="mb-1 text-lg text-danger">Something went wrong</h4>
          <p className="text-paper-dim">{message}</p>
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-3">
              {onRetry && (
                <button type="button" className="ns-btn" onClick={onRetry}>
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  className="ns-btn ns-btn-ghost"
                  onClick={onDismiss}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
