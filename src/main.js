const { invoke } = window.__TAURI__.tauri;
const { dataDir } = window.__TAURI__.path;

const list_of_elements = `list-of-elements`
const content_of_note = `content-of-note`
const textarea_note_content = `note-content`
const return_button = `return-previous-group`
const current_group_input = `current_group`
let data_dir_location = ``

const read_note = async (location) => {
  const res = await invoke("read_note", { pathStr: location })
  document.getElementById(textarea_note_content).value = res.content
}

const change_group = async (location) => {
  const res = await invoke("change_group", { pathStr: location })
  document.getElementById(list_of_elements).innerHTML = ''
  fill_list_of_elements(res)
}

const initial_scan = async () => {
  const res = await invoke("initial_scan")
  document.getElementById(list_of_elements).innerHTML = ''
  fill_list_of_elements(res)
}

const fill_list_of_elements = (elements) => {
  const template = document.querySelector("#group-element-template")
  document.getElementById(current_group_input).value = elements.location
  elements.other_groups.forEach(element => {
    let clone = template.content.cloneNode(true)
    clone.querySelector("#name").textContent = element.name
    clone.querySelector(".element-icon").src = `./assets/group-icon.png`
    clone.querySelector(".group-element").id = `${element.name}-group`
    clone.querySelector(".group-element").onclick = () => {
      change_group(element.location)
    }
    document.getElementById(list_of_elements).appendChild(clone)
  });
  elements.notes.forEach(element => {
    let clone = template.content.cloneNode(true)
    clone.querySelector("#name").textContent = element.name.split(`.`)[0]
    clone.querySelector(".element-icon").src = `./assets/note-icon.png`
    clone.querySelector(".group-element").onclick = () => {
      read_note(element.location)
    }
    document.getElementById(list_of_elements).appendChild(clone)
  });
}

const previous_group = async () => {
  const current = document.getElementById(current_group_input).value;
  if (current === data_dir_location) {
    return;
  }
  const res = await invoke(`previous_group`, { pathStr: current })
  document.getElementById(list_of_elements).innerHTML = ''
  fill_list_of_elements(res)
}

window.onload = async (e) => {
  e.preventDefault();
  data_dir_location = `${await dataDir()}forgetask`
  initial_scan();
  document.getElementById(return_button).onclick = previous_group;
};


