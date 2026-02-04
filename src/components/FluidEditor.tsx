import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

interface FluidEditorProps {
  filePath: string;
  onChange?: (content: string) => void;
}

const FluidEditor: React.FC<FluidEditorProps> = ({ filePath, onChange }) => {
  const [content, setContent] = useState('');

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      if (onChange) onChange(value);
    }
  };

  return (
    <div style={{ height: '90vh', border: '1px solid #ccc' }}>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        value={content}
        onChange={handleEditorChange}
        options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on' }}
      />
    </div>
  );
};

export default FluidEditor;