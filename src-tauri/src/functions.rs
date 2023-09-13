
use std::fs;
use std::path::Path;

use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Note {
    name: String,
    location: String,
    content: String
}

#[derive(Debug, Serialize)]
pub struct Group {
    name: String,
    location: String,
    other_groups: Vec<Group>,
    notes: Vec<Note>
}

pub fn scan_folder_from(location: &Path) -> Group {
    let mut groups: Vec<Group> = Vec::new();
    let mut other_notes: Vec<Note> = Vec::new();
    if !location.exists() {
        fs::create_dir_all(location).unwrap();
    }
    if location.is_dir() {
        for entry in fs::read_dir(location).unwrap() {
            let entry = entry.unwrap();
            if entry.file_type().unwrap().is_dir() {
                groups.push(Group { 
                    name: entry.file_name().into_string().unwrap(), 
                    location: entry.path().into_os_string().into_string().unwrap(),
                    other_groups: Vec::new(),
                    notes: Vec::new(),
                })
            } else {
                other_notes.push(Note {
                    name: entry.file_name().into_string().unwrap(),
                    location: entry.path().into_os_string().into_string().unwrap(),
                    content: fs::read_to_string(entry.path().to_path_buf()).unwrap()
                })
            }
        }
    }
    return Group {
        name: String::from(location.file_name().unwrap().to_os_string().to_str().unwrap()),
        location: String::from(location.to_str().unwrap()),
        other_groups: groups,
        notes: other_notes
    }
}
