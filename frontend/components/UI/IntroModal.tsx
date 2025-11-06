import React, { useEffect, useState } from "react";

type ControlMode = "orbit" | "fly";

interface IntroModalProps {
  defaultMode?: ControlMode;
  onStart: (mode: ControlMode, dontShowAgain: boolean) => void;
  show: boolean;
}

const IntroModal: React.FC<IntroModalProps> = ({ defaultMode = "fly", onStart, show }) => {
  const [selectedMode, setSelectedMode] = useState<ControlMode>(defaultMode);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  useEffect(() => {
    setSelectedMode(defaultMode);
  }, [defaultMode]);

  if (!show) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <h2 style={{ margin: 0 }}>Welcome — ArXiv Embeddings 3D Explorer</h2>
            <p style={{ marginTop: 8 }}>
              Discover relationships between thousands of ArXiv research papers in an interactive 3D embedding space.
              Fly through clusters of topics, find related papers, and uncover hidden connections.
            </p>
          </div>
          <button onClick={() => onStart(defaultMode, dontShowAgain)} style={closeXButtonStyle} aria-label="Fermer le modal">×</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <h4 style={{ marginBottom: 8 }}>Choose the navigation mode</h4>

          
          <label style={radioLabelStyle}>
            <input
              type="radio"
              name="navmode"
              value="fly"
              checked={selectedMode === "fly"}
              onChange={() => setSelectedMode("fly")}
            />
            <span style={{ marginLeft: 8 }}>✈️ Fly — Fly Freely in Space (Recommended).</span>
          </label>

          <label style={radioLabelStyle}>
            <input
              type="radio"
              name="navmode"
              value="orbit"
              checked={selectedMode === "orbit"}
              onChange={() => setSelectedMode("fly")}
            />
            <span style={{ marginLeft: 8 }}>🌀 Orbit — Make the Camera orbit around a fix point.</span>
          </label>
        </div>

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span>Ne plus afficher ce message</span>
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onStart(selectedMode, dontShowAgain)} style={primaryButtonStyle}>
              Start Exploring 🚀
            </button>
            <button onClick={() => onStart(defaultMode, dontShowAgain)} style={secondaryButtonStyle}>
              Skipper (mode par défaut)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroModal;

/* --- Styles (inline pour simplicité) --- */
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
  backdropFilter: "blur(4px)",
  padding: 20,
};

const modalStyle: React.CSSProperties = {
  width: "min(720px, 95%)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
  borderRadius: 12,
  padding: 20,
  color: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const radioLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 0",
  cursor: "pointer",
  userSelect: "none",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  backgroundColor: "#4caf50",
  border: "none",
  color: "white",
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  backgroundColor: "#333",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "white",
  cursor: "pointer",
};

const closeXButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: 22,
  cursor: "pointer",
  padding: 4,
  lineHeight: 1,
};
