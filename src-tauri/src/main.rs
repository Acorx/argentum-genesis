mod vibe_engine;

use tauri::Manager;
use serde::{Serialize, Deserialize};
use std::path::PathBuf;
use std::fs;

// Structure pour les requêtes de fichiers
#[derive(Serialize, Deserialize)]
struct FileRequest {
    path: String,
    is_internal: bool,
    content: Option<String>,
}

// Commande pour lire un fichier
#[tauri::command]
fn read_file(path: String, is_internal: bool) -> Result<String, String> {
    let base_path = if is_internal { "INTERNAL" } else { "WORKSPACE" };
    let full_path = PathBuf::from(base_path).join(path);
    fs::read_to_string(full_path).map_err(|e| e.to_string())
}

// Commande pour écrire un fichier
#[tauri::command]
fn write_file(path: String, is_internal: bool, content: String) -> Result<(), String> {
    let base_path = if is_internal { "INTERNAL" } else { "WORKSPACE" };
    let full_path = PathBuf::from(base_path).join(path);
    fs::write(full_path, content).map_err(|e| e.to_string())
}

// Commande pour lister les fichiers
#[tauri::command]
fn list_files(is_internal: bool) -> Result<Vec<String>, String> {
    vibe_engine::list_files(is_internal)
}

// Commande pour rechercher dans le WORKSPACE
#[tauri::command]
fn search_in_workspace(query: String) -> Result<Vec<vibe_engine::SearchResult>, String> {
    vibe_engine::search_in_workspace(&query)
}

// Commande pour analyser un fichier avec Tree-sitter
#[tauri::command]
fn parse_with_tree_sitter(file_path: String, language: String) -> Result<(), String> {
    vibe_engine::parse_with_tree_sitter(&file_path, &language)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            list_files,
            search_in_workspace,
            parse_with_tree_sitter,
            vibe_engine::send_to_mistral
        ])
        .run(tauri::generate_context!())
        .expect("Erreur lors du démarrage de l'application");
}