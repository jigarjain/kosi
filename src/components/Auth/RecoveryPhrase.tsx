import React from "react";

interface RecoveryPhraseProps {
  phrase: string;
  onClose?: () => void;
}

export default function RecoveryPhrase({
  phrase,
  onClose
}: RecoveryPhraseProps) {
  const handleCopy = () => {
    navigator.clipboard
      .writeText(phrase)
      .then(() => {
        alert("Recovery phrase copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy the recovery phrase", err);
      });
  };

  return (
    <div className="card card-border border-base-300 card-sm overflow-hidden">
      <div className="card-body">
        <h2 className="card-title mb-4">Your Recovery Phrase</h2>
        <p className="text-sm text-gray-600 mb-4">
          Save the below phrase securely. It will be required to access your
          account if you ever forget your password.
        </p>
        <p>
          <pre className="whitespace-pre-wrap">{phrase}</pre>
        </p>
        <div className="card-actions justify-end mt-4">
          <button onClick={handleCopy} className="btn btn-primary">
            Copy to Clipboard
          </button>
          {onClose && (
            <button onClick={onClose} className="btn btn-secondary ml-2">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
