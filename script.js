/* ========= انتخاب عناصر و بارگذاری داده‌ها ========= */
const addTaskBtn = document.getElementById("addTaskBtn");
const todoEl = document.getElementById("todo");
const doingEl = document.getElementById("doing");
const doneEl = document.getElementById("done");

// بارگذاری تسک‌ها از LocalStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* ========= تابع رسم تسک‌ها ========= */
function renderTasks() {
  // پاک کردن محتوای ستون‌ها
  todoEl.innerHTML = "";
  doingEl.innerHTML = "";
  doneEl.innerHTML = "";

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task";
    div.textContent = task.title;
    div.dataset.id = task.id;
    div.dataset.status = task.status;
    div.draggable = true;

    /* ===== حذف تسک با دابل کلیک ===== */
    div.addEventListener("dblclick", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
    });

    /* ===== شروع Drag ===== */
    div.addEventListener("dragstart", () => {
      div.classList.add("dragging");
    });

    /* ===== پایان Drag ===== */
    div.addEventListener("dragend", () => {
      div.classList.remove("dragging");
    });

    /* ===== اضافه کردن تسک به ستون صحیح ===== */
    if(task.status === "todo") todoEl.appendChild(div);
    if(task.status === "doing") doingEl.appendChild(div);
    if(task.status === "done") doneEl.appendChild(div);
  });
}

/* ========= اضافه کردن تسک جدید ========= */
addTaskBtn.addEventListener("click", () => {
  const title = prompt("اسم تسک رو بنویس:");
  if(!title) return;

  const task = {
    id: Date.now(), // شناسه یکتا
    title,
    status: "todo" // تسک جدید همیشه تو Todo میره
  };

  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
});

/* ========= Drag & Drop واقعی با آپدیت ستون‌ها ========= */
const columns = document.querySelectorAll(".task-list");

columns.forEach(column => {
  // اجازه درگ کردن روی ستون
  column.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    if(!dragging) return;
    column.appendChild(dragging);
  });

  // وقتی تسک رها شد، ستونش رو آپدیت کن
  column.addEventListener("drop", () => {
    const dragging = document.querySelector(".dragging");
    if(!dragging) return;

    const taskId = Number(dragging.dataset.id);
    const task = tasks.find(t => t.id === taskId);
    task.status = column.id; // آپدیت ستون
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
  });
});

/* ========= اجرای اولیه renderTasks ========= */
renderTasks();