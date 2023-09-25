
use std::fs;
use std::io::Write;
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
                    content: String::from("")
                })
            }
        }
    }
    return Group {
        name: String::from(location.file_name().unwrap().to_str().unwrap()),
        location: String::from(location.to_str().unwrap()),
        other_groups: groups,
        notes: other_notes
    }
}

pub fn read_contents_of(file_path: &Path) -> Result<Note, &str> {
    if !file_path.exists() {
        return Err("File doesn't exists.");
    }
    return Ok(Note {
        name: String::from(file_path.file_name().unwrap().to_str().unwrap()),
        location: String::from(file_path.to_str().unwrap()),
        content: fs::read_to_string(file_path).unwrap()
    })
}

pub fn save_file(file_path: &Path, new_content: &str) -> bool {
    if !file_path.exists() {
        return false;
    }
    fs::write(file_path, new_content.as_bytes()).unwrap();
    return true;
}

pub fn create_file(file_path: &Path, content: &str) -> bool {
    if file_path.exists() {
        return false;
    }
    let mut f = fs::File::create(file_path).unwrap();
    f.write_all(content.as_bytes()).unwrap();
    return true;
}

pub fn create_folder(folder_path: &Path) -> bool {
    if folder_path.exists() {
        return false;
    }
    fs::create_dir(folder_path).unwrap();
    return true;
}

