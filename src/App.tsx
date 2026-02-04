import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import FluidEditor from './components/FluidEditor';
import IntentBar from './components/IntentBar';
import DiffView from './components/DiffView';

const App: React.FC = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [diffContent, setDiffContent] = useState<{ old: string; new: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Charger la liste des fichiers
  useEffect(() => {
    const fetchFiles = async () => {
      const fileList = await invoke('list_files', { isInternal: false });
      setFiles(fileList as string[]);
    };
    fetchFiles();
  }, []);

  // Charger le contenu d'un fichier
  const loadFile = async (file: string) => {
    const content = await invoke('read_file', { path: file, isInternal: false });
    setCurrentFile(file);
    setFileContent(content as string);
  };

  // Soumettre une intention à l'IA
  const handleIntentSubmit = async (intent: string) => {
    setIsUpdating(true);
    const response = await invoke('send_to_mistral', { prompt: intent });
    
    // Simuler une réponse de l'IA avec un diff
    const aiResponse = JSON.parse(response as string);
    setDiffContent({
      old: fileContent,
      new: aiResponse.suggestedCode || "// Code suggéré par l'IA",
    });
    setIsUpdating(false);
  };

  // Appliquer les modifications
  const applyChanges = async () => {
    if (diffContent && currentFile) {
      await invoke('write_file', {
        path: currentFile,
        isInternal: false,
        content: diffContent.new,
      });
      setFileContent(diffContent.new);
      setDiffContent(null);
    }
  };

  if (isUpdating) {
    return <div>L'outil est en cours de reconstruction. Veuillez patienter...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Argentum Genesis</h1>
      <div style={{ display: 'flex', height: '80vh' }}>
        <div style={{ width: '30%', overflow: 'auto', borderRight: '1px solid #ccc' }}>
          <h3>Fichiers</h3>
          <ul>
            {files.map((file) => (
              <li key={file} onClick={() => loadFile(file)} style={{ cursor: 'pointer' }}>
                {file}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ width: '70%', marginLeft: 20 }}>
          {currentFile ? (
            <>
              <FluidEditor filePath={currentFile} onChange={setFileContent} />
              {diffContent && (
                <div style={{ marginTop: 20 }}>
                  <h3>Différences suggérées par l'IA</h3>
                  <DiffView oldContent={diffContent.old} newContent={diffContent.new} />
                  <button onClick={applyChanges} style={{ marginTop: 10, padding: 10 }}>Appliquer les modifications</button>
                </div>
              )}
            </>
          ) : (
            <p>Sélectionnez un fichier pour commencer.</p>
          )}
        </div>
      </div>
      <IntentBar onSubmit={handleIntentSubmit} />
    </div>
  );
};

export default App;