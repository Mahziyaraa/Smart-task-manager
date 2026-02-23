// Selecting elements and loading data
const addTaskBtn = document.getElementById("addTaskBtn");
const todoEl = document.getElementById("todo");
const doingEl = document.getElementById("doing");
const doneEl = document.getElementById("done");

// Loading tasks from LocalStorage
// Variabled modal
const modal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const modalStatus = document.getElementById("modalStatus");
const modalPriority = document.getElementById("modalPriority");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const closeModal = document.querySelector(".close");
let currentEditId = null;

// Filters
const filterColumn = document.getElementById("filterColumn");
const filterPriority = document.getElementById("filterPriority");
filterColumn.addEventListener("change", renderTasks);
filterPriority.addEventListener("change", renderTasks);

// Task drawing function
function renderTasks() {
    // Sort by priority
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Clear columns
    todoEl.innerHTML = "";
    doingEl.innerHTML = "";
    doneEl.innerHTML = "";

    const selectedColumn = filterColumn.value;
    const selectedPriority = filterPriority.value;

    tasks.forEach(task => {

        // Filters Check
        if (selectedColumn !== "all" && task.status !== selectedColumn) return;
        if (selectedPriority !== "all" && task.priority !== selectedPriority) return;

        const div = document.createElement("div");
        div.className = "task";
        div.dataset.id = task.id;
        div.dataset.status = task.status;
        div.draggable = true;

        // Colorization based on priority
        if (task.priority === "high") div.style.backgroundColor = "#ff9999"; // red
        if (task.priority === "medium") div.style.backgroundColor = "#ffe699"; // yellow
        if (task.priority === "low") div.style.backgroundColor = "#e3e8ff"; // blue

        // Open Modal for editing
        div.addEventListener("dblclick", () => {
            openModal(task);
        });

        // Start drag
        div.addEventListener("dragstart", () => {
            div.classList.add("dragging");
        });

        // Finish Drag
        div.addEventListener("dragend", () => {
            div.classList.remove("dragging");
        });

        // Add to the correct columns
        if (task.status === "todo") todoEl.appendChild(div);
        if (task.status === "doing") doingEl.appendChild(div);
        if (task.status === "done") doneEl.appendChild(div);
    });

    updateStats();
}

// Add a new task
addTaskBtn.addEventListener("click", () => {
    const title = prompt(" چی کار داری :");
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

// Real drag and drop
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

// Close Modal
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

// Save modal changes
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

//initial execution
renderTasks();