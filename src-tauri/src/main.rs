// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod functions;

use std::path::Path;
use tauri::api::path;

#[tauri::command]
fn initial_scan() -> functions::Group {
    return functions::scan_folder_from(path::data_dir().unwrap().as_path().join("forgetask").as_path());
}

#[tauri::command]
fn change_group(path_str: &str) -> functions::Group {
    return functions::scan_folder_from(Path::new(path_str));
}

#[tauri::command]
fn read_note(path_str: &str) -> functions::Note {
    return functions::read_contents_of(Path::new(path_str)).unwrap();
}

#[tauri::command]
fn previous_group(path_str: &str) -> functions::Group {
    return functions::scan_folder_from(Path::new(path_str).parent().unwrap());
}

#[tauri::command]
fn save_note(path_str: &str, new_content: &str) -> bool {
    return functions::save_file(Path::new(path_str), new_content);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![initial_scan, change_group, read_note, previous_group, save_note])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
