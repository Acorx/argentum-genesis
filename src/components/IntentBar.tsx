import React, { useState } from 'react';

interface IntentBarProps {
  onSubmit: (intent: string) => void;
}

const IntentBar: React.FC<IntentBarProps> = ({ onSubmit }) => {
  const [intent, setIntent] = useState('');

  const handleSubmit = () => {
    if (intent.trim()) {
      onSubmit(intent);
      setIntent('');
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, left: 20, right: 20, zIndex: 1000 }}>
      <input
        type="text"
        value={intent}
        onChange={(e) => setIntent(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Ex: 'Fais marcher ce code'"
        style={{ width: '100%', padding: 10, fontSize: 16 }}
      />
    </div>
  );
};

export default IntentBar;