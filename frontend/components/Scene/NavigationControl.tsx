import React from 'react';

type ControlMode = 'orbit' | 'fly';

interface NavigationControlsProps {
  currentMode: ControlMode;
  onModeChange: (mode: ControlMode) => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentMode,
  onModeChange
}) => {
  const controlModes = [
    {
      id: 'orbit' as ControlMode,
      label: 'Orbit',
      icon: '🔄',
    },
    {
      id: 'fly' as ControlMode,
      label: 'Fly',
      icon: '✈️',
    },
  ];

  return null
};
export default NavigationControls;
