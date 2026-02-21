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
    renderTasks();
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

/* ========= Toast Notification ========= */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 14px;
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ========= آمار و پیشرفت ========= */
function updateStats() {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const percent = total ? Math.round((done / total) * 100) : 0;

    // اگر المان آمار وجود داره، آپدیت کن
    const totalEl = document.getElementById('totalTasks');
    const doneEl = document.getElementById('doneTasks');
    const progressEl = document.getElementById('progressPercent');

    if (totalEl) totalEl.textContent = total;
    if (doneEl) doneEl.textContent = done;
    if (progressEl) progressEl.textContent = percent + '%';
}

/* ========= جستجوی زنده ========= */
const searchInput = document.getElementById('searchTasks');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.task').forEach(task => {
            const text = task.querySelector('span').textContent.toLowerCase();
            task.style.display = text.includes(term) ? 'flex' : 'none';
        });
    });
}

/* ========= ددلاین ========= */
function getDeadlineBadge(deadline) {
    if (!deadline) return '';
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    let color = '#4CAF50';
    let text = `${days} روز`;

    if (days < 0) {
        color = '#f44336';
        text = 'منقضی';
    } else if (days <= 2) {
        color = '#ff9800';
        text = `⏳ ${days} روز`;
    }

    return `<span style="
        background: ${color};
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        margin-right: 5px;
    ">${text}</span>`;
}

/* ========= تابع کمکی برای نام ستون ========= */
function getColumnName(status) {
    const names = { todo: "Todo", doing: "Doing", done: "Done" };
    return names[status] || status;
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

        /* متن و ددلاین */
        const span = document.createElement("span");
        span.innerHTML = getDeadlineBadge(task.deadline) + task.title;

        /* دکمه حذف */
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.className = "delete-btn";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            tasks = tasks.filter(t => t.id !== task.id);
            localStorage.setItem("tasks", JSON.stringify(tasks));
            renderTasks();
            showToast('تسک حذف شد 🗑️');
            updateStats();
        });

        div.appendChild(span);
        div.appendChild(deleteBtn);

        /* رنگ‌بندی اولویت */
        if (document.body.classList.contains("dark-mode")) {
            if (task.priority === "high") div.style.backgroundColor = "#cc6666";
            if (task.priority === "medium") div.style.backgroundColor = "#ccbb66";
            if (task.priority === "low") div.style.backgroundColor = "#6666cc";
        } else {
            if (task.priority === "high") div.style.backgroundColor = "#ff9999";
            if (task.priority === "medium") div.style.backgroundColor = "#ffe699";
            if (task.priority === "low") div.style.backgroundColor = "#e3e8ff";
        }

        /* باز کردن modal */
        div.addEventListener("dblclick", () => openModal(task));

        /* Drag & Drop */
        div.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", task.id);
            e.dataTransfer.effectAllowed = "move";
            div.classList.add("dragging");
        });

        div.addEventListener("dragend", () => {
            div.classList.remove("dragging");
        });

        if (task.status === "todo") todoEl.appendChild(div);
        if (task.status === "doing") doingEl.appendChild(div);
        if (task.status === "done") doneEl.appendChild(div);
    });

    updateStats();
}

/* ========= Add Task بهبود یافته ========= */
addTaskBtn.addEventListener("click", () => {
    // استفاده از modal به جای prompt
    const title = prompt("اسم تسک رو بنویس:");
    if (!title) return;

    const deadline = prompt("ددلاین (اختیاری، مثال: 2024-12-31):");

    const task = {
        id: Date.now(),
        title,
        status: "todo",
        priority: "low",
        deadline: deadline || null
    };

    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    showToast('تسک جدید اضافه شد ✅');
});

/* ========= Drag & Drop ستون‌ها ========= */
const columns = document.querySelectorAll(".task-list");

columns.forEach(column => {
    column.addEventListener("dragover", (e) => {
        e.preventDefault();
        column.classList.add("drag-over");
    });

    column.addEventListener("dragleave", () => {
        column.classList.remove("drag-over");
    });

    column.addEventListener("drop", (e) => {
        e.preventDefault();
        column.classList.remove("drag-over");

        const taskId = e.dataTransfer.getData("text/plain");
        if (!taskId) return;

        const task = tasks.find(t => t.id === Number(taskId));
        if (task && task.status !== column.id) {
            task.status = column.id;
            localStorage.setItem("tasks", JSON.stringify(tasks));
            renderTasks();
            showToast(`تسک به "${getColumnName(column.id)}" منتقل شد ✅`);
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
    showToast('تسک ذخیره شد 💾');
});

/* ========= Tutorial ========= */
const startTutorialBtn = document.getElementById("startTutorial");
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

startTutorialBtn.addEventListener("click", startTutorial);

/* ========= میانبرهای کیبورد ========= */
document.addEventListener('keydown', (e) => {
    // Ctrl+N برای تسک جدید
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        addTaskBtn.click();
    }
    // Esc برای بستن مودال
    if (e.key === 'Escape') {
        modal.style.display = 'none';
        currentEditId = null;
    }
});

/* ========= اجرای اولیه ========= */
renderTasks();