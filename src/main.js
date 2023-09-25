const { invoke } = window.__TAURI__.tauri;
const { dataDir } = window.__TAURI__.path;

const listOfElements = `list-of-elements`;
const contentOfNote = `content-of-note`;
const textareaNoteContent = `note-content`;
const returnButton = `return-previous-group`;
const currentGroupInput = `current_group`;
const currentGroupNameDisplay = `group-name-display`;
const closeCurrentNoteButton = `close-current-note`;
const currentOpenedNoteNameDisplay = `note-name-display`;
const currentNoteInput = `current_note`;
const saveCurrentNoteButton = `save-current-note`;
const closedNoteMessage = `closed-note-message`;
const createNewButton = `add-new-item`;
let dataDirLocation = ``;

const readNote = async (location) => {
  const res = await invoke("read_note", { pathStr: location });
  document.getElementById(currentOpenedNoteNameDisplay).textContent = res.name.split(`.`)[0];
  document.getElementById(currentNoteInput).value = res.location;
  document.getElementById(textareaNoteContent).value = res.content;
  changeDisplayOfTextarea(true);
}

const changeGroup = async (location) => {
  const res = await invoke("change_group", { pathStr: location });
  document.getElementById(listOfElements).innerHTML = '';
  fillListOfElements(res);
}

const initialScan = async () => {
  const res = await invoke("initial_scan");
  document.getElementById(listOfElements).innerHTML = '';
  fillListOfElements(res);
}

const fillListOfElements = (elements) => {
  const template = document.querySelector("#group-element-template");
  document.getElementById(currentGroupInput).value = elements.location;
  document.getElementById(currentGroupNameDisplay).textContent = elements.name;
  elements.other_groups.forEach(element => {
    let clone = template.content.cloneNode(true);
    clone.querySelector("#name").textContent = element.name;
    clone.querySelector(".element-icon").src = `./assets/group-icon.png`;
    clone.querySelector(".group-element").id = `${element.name}-group`;
    clone.querySelector(".group-element").onclick = () => {
      changeGroup(element.location);
    }
    document.getElementById(listOfElements).appendChild(clone);
  });
  elements.notes.forEach(element => {
    let clone = template.content.cloneNode(true);
    clone.querySelector("#name").textContent = element.name.split(`.`)[0];
    clone.querySelector(".element-icon").src = `./assets/note-icon.png`;
    clone.querySelector(".group-element").onclick = () => {
      readNote(element.location);
    }
    document.getElementById(listOfElements).appendChild(clone);
  });
}

const previousGroup = async () => {
  const current = document.getElementById(currentGroupInput).value;
  if (current === dataDirLocation) {
    return;
  }
  const res = await invoke(`previous_group`, { pathStr: current });
  document.getElementById(listOfElements).innerHTML = '';
  fillListOfElements(res);
}

const closeNote = () => {
  if (document.getElementById(currentNoteInput).value === '') {
    return;
  }
  document.getElementById(textareaNoteContent).value = '';
  document.getElementById(currentOpenedNoteNameDisplay).textContent = '';
  document.getElementById(currentNoteInput).value = '';
  changeDisplayOfTextarea(false);
}

const saveNote = async () => {
  const current = document.getElementById(currentNoteInput).value;
  if (current === '') {
    return;
  }
  const new_content = document.getElementById(textareaNoteContent).value;
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

const createItem = async () => {
  const itemType = await Swal.fire({
    title: 'Selection',
    text: 'What kind of item do you want to create?',
    icon: 'question',
    input: 'radio',
    inputOptions: {
      'group': 'Group',
      'note': 'Note',
    },
    inputValidator: (value) => {
      if (!value) {
        return 'Choosing a type of item is mandatory to create it.'
      }
    },
    showCancelButton: true,
  });
  if (!itemType.isConfirmed) {
    return;
  }
  if (itemType.value === 'note') {
    createNote();
    return;
  }
  createGroup();
}

const createNote = async () => {
  const noteName = await Swal.fire({
    title: 'Please write the new note name',
    input: 'text',
    showCancelButton: true,
    confirmButtonText: 'Create',
    inputValidator: (value) => {
      if (!value) {
        return 'Please write the note name.'
      }
    }
  });
  if (!noteName.isConfirmed) {
    return;
  }
  const current = document.getElementById(currentGroupInput).value;
  const res = await invoke('create_note', { pathStr: `${current}\\${noteName.value}.txt`, content: '' });
  if (res) {
    Swal.fire({
      title: 'Note created',
      icon: 'success',
    });
    changeGroup(current);
  }
}

const createGroup = async () => {
  const groupName = await Swal.fire({
    title: 'Please write the new group name',
    input: 'text',
    showCancelButton: true,
    confirmButtonText: 'Create',
    inputValidator: (value) => {
      if (!value) {
        return 'Please write the group name.'
      }
    }
  });
  if (!groupName.isConfirmed) {
    return;
  }
  const current = document.getElementById(currentGroupInput).value;
  const res = await invoke('create_group', { pathStr: `${current}\\${groupName.value}` });
  if (res) {
    Swal.fire({
      title: 'Group created',
      icon: 'success',
    });
    changeGroup(current);
  }
}

const changeDisplayOfTextarea = (visibility) => {
  if (visibility) {
    document.getElementById(textareaNoteContent).style.display = 'inline-block';
    document.getElementById(closeCurrentNoteButton).style.display = 'inline-block';
    document.getElementById(saveCurrentNoteButton).style.display = 'inline-block';
    document.getElementById(closedNoteMessage).style.display = 'none';
    return;
  }
  document.getElementById(textareaNoteContent).style.display = 'none';
  document.getElementById(closeCurrentNoteButton).style.display = 'none';
  document.getElementById(saveCurrentNoteButton).style.display = 'none';
  document.getElementById(closedNoteMessage).style.display = 'inline-block';
}

window.onload = async (e) => {
  e.preventDefault();
  dataDirLocation = `${await dataDir()}forgetask`;
  initialScan();
  document.getElementById(returnButton).onclick = previousGroup;
  document.getElementById(closeCurrentNoteButton).onclick = closeNote;
  document.getElementById(saveCurrentNoteButton).onclick = saveNote;
  document.getElementById(createNewButton).onclick = createItem;
};
