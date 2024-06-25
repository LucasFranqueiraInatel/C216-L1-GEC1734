const apiUrl = 'http://localhost:5000/tasks';

async function fetchTasks() {
    const response = await fetch(apiUrl);
    const tasks = await response.json();

    const table = new Tabulator("#taskTable", {
        data: tasks,
        layout: "fitColumns",
        movableColumns: true,
        resizableRows: true,
        columns: [
            { title: "Title", field: "title", headerFilter: "input" },
            { title: "Start Time", field: "start_time", headerFilter: "input" },
            { title: "End Time", field: "end_time", headerFilter: "input" },
            { title: "Planning Time", field: "planning_time", headerFilter: "input" },
            { title: "Actions", field: "actions", formatter: (cell, formatterParams) => {
                const task = cell.getRow().getData();
                return `
                    <button class="bg-green-600 text-white p-2 rounded mr-2" onclick="editTask(${task.id}, '${task.title}', '${task.start_time}', '${task.end_time}', '${task.planning_time}')">Edit</button>
                    <button class="bg-red-600 text-white p-2 rounded" onclick="deleteTask(${task.id})">Delete</button>
                `;
            }, headerSort: false, align: "center", cellClick: (e, cell) => {} }
        ],
        rowFormatter: (row) => {
            const data = row.getData();
            row.getElement().style.backgroundColor = data.priority === "high" ? "#ffdddd" : "#ffffff";
        }
    });
}

async function addTask() {
    const taskInput = document.getElementById('taskInput');
    const startTimeInput = document.getElementById('startTimeInput');
    const endTimeInput = document.getElementById('endTimeInput');
    const planningTimeInput = document.getElementById('planningTimeInput');
    
    const task = {
        title: taskInput.value,
        start_time: startTimeInput.value,
        end_time: endTimeInput.value,
        planning_time: planningTimeInput.value
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
    
    const result = await response.json();
    alert(result.message);
    taskInput.value = '';
    startTimeInput.value = '';
    endTimeInput.value = '';
    planningTimeInput.value = '';
    fetchTasks();
}

async function deleteTask(id) {
    const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE'
    });
    const result = await response.json();
    alert(result.message);
    fetchTasks();
}

async function editTask(id, title, start_time, end_time, planning_time) {
    document.getElementById('editTaskModal').classList.remove('hidden');
    document.getElementById('editTaskModal').dataset.id = id;
    document.getElementById('editTaskInput').value = title;
    document.getElementById('editStartTimeInput').value = start_time;
    document.getElementById('editEndTimeInput').value = end_time;
    document.getElementById('editPlanningTimeInput').value = planning_time;
}

async function updateTask() {
    const id = document.getElementById('editTaskModal').dataset.id;
    const title = document.getElementById('editTaskInput').value;
    const start_time = document.getElementById('editStartTimeInput').value;
    const end_time = document.getElementById('editEndTimeInput').value;
    const planning_time = document.getElementById('editPlanningTimeInput').value;

    const task = { title, start_time, end_time, planning_time };

    const response = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });

    const result = await response.json();
    alert(result.message);
    closeModal();
    fetchTasks();
}

function closeModal() {
    document.getElementById('editTaskModal').classList.add('hidden');
}

async function clearDatabase() {
    const response = await fetch(`${apiUrl}/clear`, {
        method: 'DELETE'
    });
    const result = await response.json();
    alert(result.message);
    fetchTasks();
}

document.addEventListener('DOMContentLoaded', fetchTasks);
