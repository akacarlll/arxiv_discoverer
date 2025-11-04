import React, { useState } from 'react';

type ControlMode = 'orbit' | 'fly' | 'pointer';

interface NavigationControlsProps {
  currentMode: ControlMode;
  onModeChange: (mode: ControlMode) => void;
  showHelp?: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentMode,
  onModeChange,
  showHelp = true
}) => {
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(true);


  const controlModes = [
    {
      id: 'orbit' as ControlMode,
      label: 'Orbit',
      icon: '🔄',
      description: 'Rotate around a center point'
    },
    {
      id: 'fly' as ControlMode,
      label: 'Fly',
      icon: '✈️',
      description: 'Free movement through space'
    },
    {
      id: 'pointer' as ControlMode,
      label: 'FPS',
      icon: '🎮',
      description: 'First-person shooter style'
    },
  ];

  const getControlsHelp = () => {
    switch (currentMode) {
      case 'orbit':
        return [
          'Left Mouse: Rotate view',
          'Right Mouse: Pan',
          'Scroll: Zoom in/out',
          'Middle Mouse: Pan'
        ];
      case 'fly':
        return [
          'W/S: Move forward/backward',
          'A/D: Strafe left/right',
          'Q/E: Move down/up',
          'Mouse: Look around',
          'Shift: Move faster'
        ];
      case 'pointer':
        return [
          'Click to enable pointer lock',
          'WASD: Move',
          'Mouse: Look around',
          'Esc: Exit pointer lock'
        ];
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: '15px',
      borderRadius: '8px',
      color: 'white',
      fontFamily: 'sans-serif',
      fontSize: '14px',
      zIndex: 1000,
      minWidth: isOpen ? '200px' : 'auto'
    }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#333',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ☰ Navigation
        </button>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Navigation</h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: '1'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            {controlModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentMode === mode.id ? '#4CAF50' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  if (currentMode !== mode.id) {
                    e.currentTarget.style.backgroundColor = '#555';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentMode !== mode.id) {
                    e.currentTarget.style.backgroundColor = '#333';
                  }
                }}
              >
                <span>{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          {showHelp && (
            <>
              <button
                onClick={() => setIsHelpExpanded(!isHelpExpanded)}
                style={{
                  width: '100%',
                  padding: '6px',
                  backgroundColor: '#444',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginBottom: isHelpExpanded ? '8px' : '0'
                }}
              >
                {isHelpExpanded ? '▼' : '▶'} Controls
              </button>

              {isHelpExpanded && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {getControlsHelp().map((control, idx) => (
                    <div key={idx} style={{ marginBottom: '4px' }}>
                      {control}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default NavigationControls;
