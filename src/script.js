import "./style.css";
import { createStore } from "redux";
const content = document.querySelector(".content");
const statisticsCounters = document.querySelectorAll(".statistics_item_count");
let initialized = false;
let editMode = false;
let newTaskIsReady = false;
const MONTHS_NAME = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

if (localStorage.getItem("todoList")) {
  // localStorage.setItem("todoList", ""); //clear storage
} else {
  // console.log("nothing to show");
}
const store = createStore(rootReducer, []);
store.subscribe(() => {
  localStorage.setItem("todoList", JSON.stringify(store.getState()));
});
store.subscribe(() => {
  if (initialized) {
    if (editMode && newTaskIsReady) {
      renderTask(store.getState()[0], newTaskIsReady);
      newTaskIsReady = false;
      return;
    } else {
      editMode = false;
      return;
    }
  }
  if (!initialized) {
    initialized = true;
    let reversedState = [...store.getState()];
    reversedState = reversedState.reverse();
    reversedState.forEach((task) => renderTask(task));
    return;
  }
});
store.subscribe(() => {
  const todoListLength = store.getState().length;
  if (!todoListLength) {
    statisticsCounters[0].textContent = 0;
    statisticsCounters[1].textContent = 0;
    statisticsCounters[2].textContent = 0;
    if (
      !document
        .querySelector(".have_no_item_container")
        .classList.contains("hidden")
    ) {
      return;
    }
    document
      .querySelector(".have_no_item_container")
      .classList.remove("hidden");
    return;
  }
  document.querySelector(".have_no_item_container").classList.add("hidden");
  statisticsCounters[0].textContent = todoListLength.toString();
  statisticsCounters[1].textContent =
    todoListLength - content.querySelectorAll(".done_checkbox:checked").length;
  statisticsCounters[2].textContent =
    todoListLength - statisticsCounters[1].textContent;
});

function rootReducer(state, action) {
  switch (action.type) {
    case "init": {
      if (localStorage.getItem("todoList")) {
        return [...state, ...JSON.parse(localStorage.getItem("todoList"))];
      }
      return state;
    }
    case "addListItem": {
      const taskDate = new Date();
      const newListItem = {
        description: "",
        day: taskDate.getDate(),
        month: taskDate.getMonth(),
        year: taskDate.getFullYear(),
        checked: false,
      };
      return [newListItem, ...state];
    }
    case "updateTaskDescription": {
      const newState = [...state];
      newState[action.payload.index].description = action.payload.value;
      return newState;
    }
    case "updateTaskChecked": {
      const newState = [...state];
      newState[action.payload.index].checked = action.payload.value;
      return newState;
    }
    case "deleteTask": {
      const newState = [...state];
      newState.splice(action.payload.index, 1);
      return newState;
    }

    default:
      return state;
  }
}

store.dispatch({ type: "init" });

document.querySelector(".plus_button").addEventListener("click", (e) => {
  if (editMode) {
    return;
  }
  editMode = true;
  newTaskIsReady = true;
  store.dispatch({ type: "addListItem" });
  e.target.classList.remove("active");
});
document.querySelector(".plus_button").addEventListener("mousedown", (e) => {
  if (editMode) {
    return;
  }
  e.target.classList.add("active");
});

document
  .querySelector(".create_new_task_btn")
  .addEventListener("click", (e) => {
    if (editMode) {
      return;
    }
    editMode = true;
    newTaskIsReady = true;
    store.dispatch({ type: "addListItem" });
    e.target.classList.remove("active");
  });

document
  .querySelector(".create_new_task_btn")
  .addEventListener("mousedown", (e) => {
    if (editMode) {
      return;
    }
    e.target.classList.add("active");
  });

function renderTask(task, isNewTask = false) {
  if (task) {
    const todoItem = document.createElement("div");
    todoItem.classList.add("todo_item");

    const interfaceLine = document.createElement("div");
    interfaceLine.classList.add("interface_line");

    const leftSideWrapper = document.createElement("div");
    leftSideWrapper.classList.add("left_side");

    const checkBoxInput = document.createElement("input");
    checkBoxInput.classList.add("done_checkbox");
    checkBoxInput.type = "checkbox";
    checkBoxInput.checked = task.checked;
    checkBoxInput.addEventListener("change", (e) => {
      if (editMode) {
        e.target.checked = !e.target.checked;
        return;
      }
      const nodeCounter = getNodeIndex(e.target, ".done_checkbox");
      content.children[nodeCounter]
        .querySelector(".todo_input")
        .classList.toggle("task_done");
      store.dispatch({
        type: "updateTaskChecked",
        payload: {
          index: nodeCounter,
          value: e.target.checked,
        },
      });
    });

    const dateParagraph = document.createElement("p");
    dateParagraph.classList.add("item_date");

    const taskDay = document.createElement("span");
    taskDay.innerText = task.day;
    const taskMonth = document.createElement("span");
    taskMonth.innerText = MONTHS_NAME[task.month];
    const taskYear = document.createElement("span");
    taskYear.innerText = task.year;
    const rightSideWrapper = document.createElement("div");
    rightSideWrapper.classList.add("right_side");

    const editIcon = document.createElement("i");
    const deleteIcon = document.createElement("i");
    editIcon.classList.add("far");
    editIcon.classList.add("fa-edit");
    editIcon.classList.add("user_icon");
    deleteIcon.classList.add("far");
    deleteIcon.classList.add("fa-trash-alt");
    deleteIcon.classList.add("user_icon");

    editIcon.addEventListener("click", (e) => {
      if (editMode === e.target) {
        e.target.classList.remove("fas");
        e.target.classList.add("far");
        e.target.classList.remove("fa-check");
        e.target.classList.add("fa-edit");

        const sameTmpInput = e.target.parentElement.parentElement.parentElement.querySelector(
          ".todo_input"
        );
        const nodeCounter = getNodeIndex(e.target, ".fa-edit");
        store.dispatch({
          type: "updateTaskDescription",
          payload: {
            index: nodeCounter,
            value: sameTmpInput.value,
          },
        });
        const updatedDescriptionEl = document.createElement("div");
        updatedDescriptionEl.classList.add("todo_input");
        updatedDescriptionEl.textContent = sameTmpInput.value;
        sameTmpInput.replaceWith(updatedDescriptionEl);
        return;
      }
      if (editMode) {
        return;
      }
      editMode = e.target;
      e.target.classList.remove("far");
      e.target.classList.add("fas");
      e.target.classList.remove("fa-edit");
      e.target.classList.add("fa-check");
      const descriptionNode = e.target.parentElement.parentElement.parentElement.querySelector(
        ".todo_input"
      );
      const temporaryInput = document.createElement("input");
      temporaryInput.classList.add("todo_input");
      temporaryInput.placeholder = "Please enter your task description";
      temporaryInput.value = descriptionNode.textContent;

      descriptionNode.replaceWith(temporaryInput);
    });

    deleteIcon.addEventListener("click", (e) => {
      if (editMode) {
        return;
      }
      editMode = true;
      const nodeCounter = getNodeIndex(e.target, ".fa-trash-alt");
      store.dispatch({
        type: "deleteTask",
        payload: {
          index: nodeCounter,
        },
      });

      deleteIcon.remove();
      editIcon.remove();
      taskYear.remove();
      taskMonth.remove();
      taskDay.remove();
      rightSideWrapper.remove();
      dateParagraph.remove();
      checkBoxInput.remove();
      leftSideWrapper.remove();
      interfaceLine.remove();
      descriptionArea.remove();
      todoItem.remove();
    });

    const descriptionArea = isNewTask
      ? document.createElement("input")
      : document.createElement("div");
    descriptionArea.classList.add("todo_input");
    if (isNewTask) {
      editMode = editIcon;
      descriptionArea.placeholder = "Please enter your task description";
      descriptionArea.type = "text";
      editIcon.classList.remove("far");
      editIcon.classList.add("fas");
      editIcon.classList.remove("fa-edit");
      editIcon.classList.add("fa-check");
    } else {
      descriptionArea.textContent = task.description;
    }

    todoItem.append(interfaceLine, descriptionArea);
    interfaceLine.append(leftSideWrapper, rightSideWrapper);
    leftSideWrapper.append(checkBoxInput, dateParagraph);
    dateParagraph.append(taskDay, taskMonth, taskYear);
    rightSideWrapper.append(editIcon, deleteIcon);
    content.prepend(todoItem);
    if (isNewTask) {
      descriptionArea.focus();
    }
  }
}

function getNodeIndex(node, queryString) {
  let nodeCounter = 0;
  for (let child of Array.from(content.children)) {
    if (child.querySelector(queryString) === node) {
      return nodeCounter;
    }
    nodeCounter++;
  }
}
