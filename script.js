class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.filter = 'all';
        this.taskForm = document.querySelector('.task-form');
        this.taskInput = document.getElementById('taskInput');
        this.dueDateInput = document.getElementById('dueDate');
        this.priorityInput = document.getElementById('priority');
        this.taskList = document.getElementById('taskList');
        this.allFilter = document.getElementById('allFilter');
        this.activeFilter = document.getElementById('activeFilter');
        this.completedFilter = document.getElementById('completedFilter');
        this.totalTasksElement = document.getElementById('totalTasks');
        this.completedTasksElement = document.getElementById('completedTasks');
        this.modeToggle = document.getElementById('modeToggle');

        this.bindEvents();
        this.render();
        this.updateTaskStats();
        this.loadColorMode();
    }

    bindEvents() {
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        this.allFilter.addEventListener('click', () => this.setFilter('all'));
        this.activeFilter.addEventListener('click', () => this.setFilter('active'));
        this.completedFilter.addEventListener('click', () => this.setFilter('completed'));
        this.modeToggle.addEventListener('click', () => this.toggleColorMode());
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        const dueDate = this.dueDateInput.value;
        const priority = this.priorityInput.value;
        if (taskText) {
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false,
                dueDate: dueDate,
                priority: priority
            };
            this.tasks.push(newTask);
            this.taskInput.value = '';
            this.dueDateInput.value = '';
            this.priorityInput.value = 'low';
            this.saveToLocalStorage();
            this.render();
            this.updateTaskStats();
        }
    }

    toggleTask(id) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
            if (this.tasks[taskIndex].completed) {
                this.showPartyPopper(id);
            }
        }
        this.saveToLocalStorage();
        this.render();
        this.updateTaskStats();
    }

    showPartyPopper(id) {
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        if (taskElement) {
            const popper = document.createElement('div');
            popper.className = 'party-popper';
            popper.innerHTML = '🎉';
            taskElement.appendChild(popper);
            setTimeout(() => popper.remove(), 2000);
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveToLocalStorage();
        this.render();
        this.updateTaskStats();
    }

    editTask(id) {
        const task = this.tasks.find(task => task.id === id);
        const newText = prompt('Edit task:', task.text);
        if (newText !== null) {
            this.tasks = this.tasks.map(task =>
                task.id === id ? { ...task, text: newText } : task
            );
            this.saveToLocalStorage();
            this.render();
        }
    }

    setFilter(filter) {
        this.filter = filter;
        this.render();
        this.updateFilterButtons();
    }

    updateFilterButtons() {
        [this.allFilter, this.activeFilter, this.completedFilter].forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${this.filter}Filter`).classList.add('active');
    }

    getFilteredTasks() {
        switch (this.filter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        this.taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''} fade-in" data-task-id="${task.id}">
                <div class="task-content">
                    <span class="priority-indicator priority-${task.priority}"></span>
                    <span class="task-text">${task.text}</span>
                    ${task.dueDate ? `<span class="due-date">Due: ${task.dueDate}</span>` : ''}
                </div>
                <div class="actions">
                    <button class="complete-btn" onclick="taskManager.toggleTask(${task.id})">
                        ${task.completed ? '<i class="fas fa-undo"></i>' : '<i class="fas fa-check"></i>'}
                    </button>
                    <button class="edit-btn" onclick="taskManager.editTask(${task.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="taskManager.deleteTask(${task.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');

        this.updatePendingTasksBubbles();
    }

    updateTaskStats() {
        this.totalTasksElement.textContent = this.tasks.length;
        this.completedTasksElement.textContent = this.tasks.filter(task => task.completed).length;
    }

    updatePendingTasksBubbles() {
        const pendingTasks = this.tasks.filter(task => !task.completed);
        const bubbleContainer = document.getElementById('pendingTasksBubbles');
        bubbleContainer.innerHTML = '';

        pendingTasks.forEach((task, index) => {
            const bubble = document.createElement('div');
            bubble.className = 'task-bubble';
            bubble.style.setProperty('--i', index + 1);
            bubble.textContent = task.text.substring(0, 2).toUpperCase();
            bubble.title = task.text;
            bubbleContainer.appendChild(bubble);
        });
    }

    saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    toggleColorMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        this.updateModeToggleButton(isDarkMode);
    }

    loadColorMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        this.updateModeToggleButton(isDarkMode);
    }

    updateModeToggleButton(isDarkMode) {
        this.modeToggle.innerHTML = isDarkMode
            ? '<i class="fas fa-sun"></i> Light Mode'
            : '<i class="fas fa-moon"></i> Dark Mode';
    }
}

const taskManager = new TaskManager();