const { invoke } = window.__TAURI__.tauri;
const { dataDir } = window.__TAURI__.path;

const list_of_elements = `list-of-elements`;
const content_of_note = `content-of-note`;
const textarea_note_content = `note-content`;
const return_button = `return-previous-group`;
const current_group_input = `current_group`;
const current_group_name_display = `group-name-display`;
const close_current_note_button = `close-current-note`;
const current_opened_note_name_display = `note-name-display`;
const current_note_input = `current_note`;
const save_current_note_button = `save-current-note`;
const closed_note_message = `closed-note-message`;
let data_dir_location = ``;

const read_note = async (location) => {
  const res = await invoke("read_note", { pathStr: location });
  document.getElementById(current_opened_note_name_display).textContent = res.name.split(`.`)[0];
  document.getElementById(current_note_input).value = res.location;
  document.getElementById(textarea_note_content).value = res.content;
  change_display_of_textarea(true);
}

const change_group = async (location) => {
  const res = await invoke("change_group", { pathStr: location });
  document.getElementById(list_of_elements).innerHTML = '';
  fill_list_of_elements(res);
}

const initial_scan = async () => {
  const res = await invoke("initial_scan");
  document.getElementById(list_of_elements).innerHTML = '';
  fill_list_of_elements(res);
}

const fill_list_of_elements = (elements) => {
  const template = document.querySelector("#group-element-template");
  document.getElementById(current_group_input).value = elements.location;
  document.getElementById(current_group_name_display).textContent = elements.name;
  elements.other_groups.forEach(element => {
    let clone = template.content.cloneNode(true);
    clone.querySelector("#name").textContent = element.name;
    clone.querySelector(".element-icon").src = `./assets/group-icon.png`;
    clone.querySelector(".group-element").id = `${element.name}-group`;
    clone.querySelector(".group-element").onclick = () => {
      change_group(element.location);
    }
    document.getElementById(list_of_elements).appendChild(clone);
  });
  elements.notes.forEach(element => {
    let clone = template.content.cloneNode(true);
    clone.querySelector("#name").textContent = element.name.split(`.`)[0];
    clone.querySelector(".element-icon").src = `./assets/note-icon.png`;
    clone.querySelector(".group-element").onclick = () => {
      read_note(element.location);
    }
    document.getElementById(list_of_elements).appendChild(clone);
  });
}

const previous_group = async () => {
  const current = document.getElementById(current_group_input).value;
  if (current === data_dir_location) {
    return;
  }
  const res = await invoke(`previous_group`, { pathStr: current });
  document.getElementById(list_of_elements).innerHTML = '';
  fill_list_of_elements(res);
}

const close_note = () => {
  if (document.getElementById(current_note_input).value === '') {
    return;
  }
  document.getElementById(textarea_note_content).value = '';
  document.getElementById(current_opened_note_name_display).textContent = '';
  document.getElementById(current_note_input).value = '';
  change_display_of_textarea(false);
}

const save_note = async () => {
  const current = document.getElementById(current_note_input).value;
  if (current === '') {
    return;
  }
  const new_content = document.getElementById(textarea_note_content).value;
  const res = await invoke("save_note", { pathStr: current, newContent: new_content });
  if (!res) {
    Swal.fire({
      title: 'There was a problem when saving the note.',
      icon: 'error',
    });
    return;
  }
  Swal.fire({
    title: 'Note saved successfully.',
    icon: 'success',
  });
}

const change_display_of_textarea = (visibility) => {
  if (visibility) {
    document.getElementById(textarea_note_content).style.display = 'inline-block';
    document.getElementById(close_current_note_button).style.display = 'inline-block';
    document.getElementById(save_current_note_button).style.display = 'inline-block';
    document.getElementById(closed_note_message).style.display = 'none';
    return;
  }
  document.getElementById(textarea_note_content).style.display = 'none';
  document.getElementById(close_current_note_button).style.display = 'none';
  document.getElementById(save_current_note_button).style.display = 'none';
  document.getElementById(closed_note_message).style.display = 'inline-block';
}

window.onload = async (e) => {
  e.preventDefault();
  data_dir_location = `${await dataDir()}forgetask`;
  initial_scan();
  document.getElementById(return_button).onclick = previous_group;
  document.getElementById(close_current_note_button).onclick = close_note;
  document.getElementById(save_current_note_button).onclick = save_note;
};
