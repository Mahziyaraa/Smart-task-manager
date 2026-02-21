/* ========= عناصر ========= */
const addTaskBtn = document.getElementById("addTaskBtn");
const todoEl = document.getElementById("todo");
const doingEl = document.getElementById("doing");
const doneEl = document.getElementById("done");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* ========= Modal تسک ========= */
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

/* ========= Hamburger Menu ========= */
const hamburgerMenu = document.querySelector(".hamburger-menu");
const hamburgerBtn = document.querySelector(".hamburger-btn");
const darkModeBtn = document.getElementById("darkModeBtn");

// بارگذاری حالت ذخیره شده از localStorage
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
}

// دکمه Dark Mode
darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }
});
hamburgerBtn.addEventListener("click", () => {
    hamburgerMenu.classList.toggle("active");
});
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeBtn.checked = true;
} else {
    darkModeBtn.checked = false;
}

/* ========= Accordion ========= */
const accordions = document.querySelectorAll(".accordion-btn");
accordions.forEach(btn => {
    btn.addEventListener("click", () => {
        const content = btn.nextElementSibling;
        content.style.maxHeight = content.style.maxHeight ?
            null :
            content.scrollHeight + "px";
    });
});

/* ========= Board و بک‌گراند ========= */
const bgFileInput = document.getElementById("bgFileInput");
const applyBgBtn = document.getElementById("applyBgBtn");

applyBgBtn.addEventListener("click", () => {
    const file = bgFileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.body.style.setProperty('--bg-image', `url(${e.target.result})`);
        localStorage.setItem("boardBg", e.target.result);
    }
    reader.readAsDataURL(file);
    bgFileInput.value = "";
});

// بارگذاری بک‌گراند ذخیره شده
const savedBg = localStorage.getItem("boardBg");
if (savedBg) {
    document.body.style.setProperty('--bg-image', `url(${savedBg})`);
}

/* ========= renderTasks ========= */
function renderTasks() {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    todoEl.innerHTML = "";
    doingEl.innerHTML = "";
    doneEl.innerHTML = "";

    const selectedColumn = filterColumn.value;
    const selectedPriority = filterPriority.value;

    tasks.forEach(task => {
        if (selectedColumn !== "all" && task.status !== selectedColumn) return;
        if (selectedPriority !== "all" && task.priority !== selectedPriority) return;

        const div = document.createElement("div");
        div.className = "task";
        div.dataset.id = task.id;
        div.dataset.status = task.status;
        div.draggable = true;

        /* متن */
        const span = document.createElement("span");
        span.textContent = task.title;

        /* دکمه حذف */
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.className = "delete-btn";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            tasks = tasks.filter(t => t.id !== task.id);
            localStorage.setItem("tasks", JSON.stringify(tasks));
            renderTasks();
        });

        div.appendChild(span);
        div.appendChild(deleteBtn);

        if (task.priority === "high") div.style.backgroundColor = "#ff9999";
        if (task.priority === "medium") div.style.backgroundColor = "#ffe699";
        if (task.priority === "low") div.style.backgroundColor = "#e3e8ff";

        /* باز کردن modal */
        div.addEventListener("dblclick", () => openModal(task));

        /* Drag & Drop */
        div.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", task.id);
            div.classList.add("dragging");
        });
        div.addEventListener("dragend", () => div.classList.remove("dragging"));

        if (task.status === "todo") todoEl.appendChild(div);
        if (task.status === "doing") doingEl.appendChild(div);
        if (task.status === "done") doneEl.appendChild(div);
    });
}

/* ========= Add Task ========= */
addTaskBtn.addEventListener("click", () => {
    const title = prompt("اسم تسک رو بنویس:");
    if (!title) return;
    const task = { id: Date.now(), title, status: "todo", priority: "low" };
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
});

/* ========= Drag & Drop ستون ها ========= */
const columns = document.querySelectorAll(".task-list");
columns.forEach(column => {
    column.addEventListener("dragover", (e) => e.preventDefault());
    column.addEventListener("drop", (e) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("text/plain");
        if (!taskId) return;
        const task = tasks.find(t => t.id === Number(taskId));
        if (task) {
            task.status = column.id;
            localStorage.setItem("tasks", JSON.stringify(tasks));
            renderTasks();
        }
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
const startTutorialBtn = document.getElementById("startTutorial");

startTutorialBtn.addEventListener("click", () => {
    // اینجا تابع شروع Tutorial رو صدا می‌زنیم
    startTutorial();
});
const tutorialBox = document.getElementById("tutorialBox");
const tutorialText = document.getElementById("tutorialText");
const nextStepBtn = document.getElementById("nextStep");
const endTutorialBtn = document.getElementById("endTutorial");

let currentStep = 0;

const tutorialSteps = [
    { text: "برای اضافه کردن تسک، این دکمه رو بزن", target: "#addTaskBtn" },
    { text: "با این فیلترها می‌توانی ستون و اولویت تسک‌ها را محدود کنی", target: ".filters" },
    { text: "تسک‌ها در این ستون نمایش داده می‌شوند", target: ".column[data-status='todo']" },
    { text: "می‌توان تسک‌ها را ویرایش یا حذف کرد", target: ".task-list" },
    { text: "با منوی همبرگر می‌توانید بک‌گراند را تغییر دهید", target: ".hamburger-btn" },
    { text: "این دکمه Tutorial هم برای راهنمایی تعاملی استفاده می‌شود", target: "#startTutorial" }
];

function showStep(stepIndex) {
    if (stepIndex >= tutorialSteps.length) {
        tutorialBox.style.display = "none";
        return;
    }

    const step = tutorialSteps[stepIndex];
    const targetEl = document.querySelector(step.target);

    if (!targetEl) return;

    const rect = targetEl.getBoundingClientRect();

    // موقعیت Tooltip نسبت به المان هدف
    tutorialBox.style.top = rect.bottom + window.scrollY + 10 + "px";
    tutorialBox.style.left = rect.left + window.scrollX + "px";

    tutorialText.textContent = step.text;
    tutorialBox.style.display = "block";
}
nextStepBtn.addEventListener("click", () => {
    currentStep++;
    showStep(currentStep);
});

endTutorialBtn.addEventListener("click", () => {
    tutorialBox.style.display = "none";
    currentStep = 0;
});

function startTutorial() {
    currentStep = 0;
    showStep(currentStep);
}
/* ========= اجرای اولیه ========= */
renderTasks();