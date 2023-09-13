const { invoke } = window.__TAURI__.tauri;

const list_of_elements = `list-of-elements`
const content_of_node = `content-of-note`

const initial_scan = async () => {
  const res = await invoke("initial_scan")
  const template = document.querySelector("#group-element-template")
  res.other_groups.forEach(element => {
    let clone = template.content.cloneNode(true)
    clone.querySelector("#name").textContent = element.name
    document.getElementById(list_of_elements).appendChild(clone)
  });
  res.notes.forEach(element => {
    let clone = template.content.cloneNode(true)
    clone.querySelector("#name").textContent = element.name
    document.getElementById(list_of_elements).appendChild(clone)
  });
}

window.onload = async (e) => {
  e.preventDefault();
  initial_scan()
};


