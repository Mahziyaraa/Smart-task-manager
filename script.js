/* ========= انتخاب عناصر و بارگذاری داده‌ها ========= */
const addTaskBtn = document.getElementById("addTaskBtn");
const todoEl = document.getElementById("todo");
const doingEl = document.getElementById("doing");
const doneEl = document.getElementById("done");

// بارگذاری تسک‌ها از LocalStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* ========= Modal متغیرها ========= */
const modal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const modalStatus = document.getElementById("modalStatus");
const modalPriority = document.getElementById("modalPriority");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const closeModal = document.querySelector(".close");

let currentEditId = null;

/* ========= فیلتر ========= */
const filterColumn = document.getElementById("filterColumn");
const filterPriority = document.getElementById("filterPriority");

filterColumn.addEventListener("change", renderTasks);
filterPriority.addEventListener("change", renderTasks);

/* ========= تابع رسم تسک‌ها ========= */
function renderTasks() {
    // مرتب‌سازی بر اساس اولویت
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // پاک کردن ستون‌ها
    todoEl.innerHTML = "";
    doingEl.innerHTML = "";
    doneEl.innerHTML = "";

    const selectedColumn = filterColumn.value;
    const selectedPriority = filterPriority.value;

    tasks.forEach(task => {

        // چک کردن فیلتر
        if (selectedColumn !== "all" && task.status !== selectedColumn) return;
        if (selectedPriority !== "all" && task.priority !== selectedPriority) return;

        const div = document.createElement("div");
        div.className = "task";
        div.textContent = task.title;
        div.dataset.id = task.id;
        div.dataset.status = task.status;
        div.draggable = true;

        // رنگ‌بندی بر اساس اولویت
        if (task.priority === "high") div.style.backgroundColor = "#ff9999"; // قرمز
        if (task.priority === "medium") div.style.backgroundColor = "#ffe699"; // زرد
        if (task.priority === "low") div.style.backgroundColor = "#e3e8ff"; // آبی

        /* ===== باز کردن Modal برای ویرایش ===== */
        div.addEventListener("dblclick", () => {
            openModal(task);
        });

        /* ===== Drag شروع ===== */
        div.addEventListener("dragstart", () => {
            div.classList.add("dragging");
        });

        /* ===== Drag پایان ===== */
        div.addEventListener("dragend", () => {
            div.classList.remove("dragging");
        });

        // اضافه کردن به ستون صحیح
        if (task.status === "todo") todoEl.appendChild(div);
        if (task.status === "doing") doingEl.appendChild(div);
        if (task.status === "done") doneEl.appendChild(div);
    });
}

/* ========= اضافه کردن تسک جدید ========= */
addTaskBtn.addEventListener("click", () => {
    const title = prompt("اسم تسک رو بنویس:");
    if (!title) return;

    const task = {
        id: Date.now(),
        title,
        status: "todo",
        priority: "low"
    };

    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
});

/* ========= Drag & Drop واقعی ========= */
const columns = document.querySelectorAll(".task-list");

columns.forEach(column => {
    column.addEventListener("dragover", e => {
        e.preventDefault();
        const dragging = document.querySelector(".dragging");
        if (!dragging) return;
        column.appendChild(dragging);
    });

    column.addEventListener("drop", () => {
        const dragging = document.querySelector(".dragging");
        if (!dragging) return;

        const taskId = Number(dragging.dataset.id);
        const task = tasks.find(t => t.id === taskId);
        task.status = column.id;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
    });
});

/* ========= Modal functions ========= */
function openModal(task) {
    currentEditId = task.id;
    modal.style.display = "flex";
    modalTitle.value = task.title;
    modalStatus.value = task.status;
    modalPriority.value = task.priority || "low";
}

// بستن Modal
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    currentEditId = null;
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        currentEditId = null;
    }
});

// ذخیره تغییرات Modal
saveTaskBtn.addEventListener("click", () => {
    if (currentEditId === null) return;

    const task = tasks.find(t => t.id === currentEditId);
    task.title = modalTitle.value;
    task.status = modalStatus.value;
    task.priority = modalPriority.value;

    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    modal.style.display = "none";
    currentEditId = null;
});

/* ========= اجرای اولیه ========= */
renderTasks();