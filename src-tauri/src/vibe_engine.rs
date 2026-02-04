use std::path::PathBuf;
use std::fs;
use serde::{Serialize, Deserialize};
use tauri::api::path;

// Structure pour les résultats de recherche dans le WORKSPACE
#[derive(Serialize, Deserialize, Debug)]
pub struct SearchResult {
    pub file: String,
    pub line: usize,
    pub content: String,
}

// Fonction pour lister les fichiers dans un dossier
pub fn list_files(is_internal: bool) -> Result<Vec<String>, String> {
    let base_path = if is_internal { "INTERNAL" } else { "WORKSPACE" };
    let entries = fs::read_dir(base_path).map_err(|e| e.to_string())?;
    let mut files = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        files.push(entry.file_name().to_string_lossy().into_owned());
    }
    Ok(files)
}

// Fonction pour rechercher du texte dans le WORKSPACE (basique)
pub fn search_in_workspace(query: &str) -> Result<Vec<SearchResult>, String> {
    let mut results = Vec::new();
    let workspace_path = PathBuf::from("WORKSPACE");
    
    if !workspace_path.exists() {
        return Err("WORKSPACE directory does not exist.".to_string());
    }
    
    for entry in fs::read_dir(workspace_path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let file_path = entry.path();
        if file_path.is_file() {
            let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
            for (i, line) in content.lines().enumerate() {
                if line.contains(query) {
                    results.push(SearchResult {
                        file: file_path.to_string_lossy().into_owned(),
                        line: i + 1,
                        content: line.to_string(),
                    });
                }
            }
        }
    }
    
    Ok(results)
}

// Fonction pour envoyer une requête à l'API Mistral
#[tauri::command]
pub async fn send_to_mistral(prompt: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let response = client
        .post("https://api.mistral.ai/v1/")
        .header("Authorization", "Bearer YOUR_MISTRAL_API_KEY") // Remplace par ta clé API
        .json(&serde_json::json!({
            "model": "mistral-tiny",
            "messages": [{"role": "user", "content": prompt}],
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    let response_body = response.text().await.map_err(|e| e.to_string())?;
    Ok(response_body)
}