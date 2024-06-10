const apiUrl = 'http://localhost:5000/tasks';

async function fetchTasks() {
    const response = await fetch(apiUrl);
    const tasks = await response.json();
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = `${task.title} (Start: ${task.start_time}, End: ${task.end_time}, Planning: ${task.planning_time})`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteTask(task.id);
        li.appendChild(deleteButton);
        taskList.appendChild(li);
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

document.addEventListener('DOMContentLoaded', fetchTasks);
