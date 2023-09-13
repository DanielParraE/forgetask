// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod functions;

use tauri::api::path;

#[tauri::command]
fn initial_scan() -> functions::Group {
    return functions::scan_folder_from(path::data_dir().unwrap().as_path().join("forgetask").as_path());
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![initial_scan])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
