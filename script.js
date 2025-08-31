document.addEventListener('DOMContentLoaded', function() {
    console.log('! working ..... DOMContentLoaded');
    initializeApp();
});

function initializeApp() {
    console.log('! working ..... initializeApp');
    loadTasks();
    loadThemePreference();
    updateTaskCount();
    
    // Event listeners
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    document.getElementById('toggleThemeBtn').addEventListener('click', toggleTheme);
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    document.getElementById('categoryFilter').addEventListener('change', filterTasks);
    document.getElementById('priorityFilter').addEventListener('change', filterTasks);
    document.getElementById('searchInput').addEventListener('input', filterTasks);
}

function addTask() {
    console.log('! working ..... addTask');
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    const priority = document.getElementById('prioritySelect').value;
    const category = document.getElementById('categorySelect').value;
    const dueDate = document.getElementById('dueDateInput').value;

    console.log("Adding task:", taskText, priority, category, dueDate); // Debugging line

    if (!taskText) {
        showError('Please enter a task!');
        taskInput.focus();
        return;
    }

    console.log("Task details are valid. Creating task element..."); // Debugging line
    const taskList = document.getElementById('taskList');
    const li = createTaskElement(taskText, priority, category, dueDate);
    console.log("Task element created:", li); // Debugging line
    taskList.appendChild(li);
    
    taskInput.value = '';
    taskInput.focus();
    saveTasks();
    updateTaskCount();
    hideError();
    updateProgress(); // Added to update progress after adding a task
}

function createTaskElement(taskText, priority, category, dueDate, isCompleted = false) {
    console.log('! working ..... createTaskElement');
    console.log("Creating task:", taskText, priority, category, dueDate); // Debugging line
    const li = document.createElement('li');
    li.className = `task-item priority-${priority}`;
    
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isCompleted;
    checkbox.className = 'task-checkbox';
    checkbox.addEventListener('change', function() {
        toggleTaskCompletion(li, checkbox.checked);
    });
    
    const taskSpan = document.createElement('span');
    taskSpan.className = 'task-text';
    taskSpan.textContent = taskText;
    if (isCompleted) {
        taskSpan.classList.add('completed');
    }
    
    const taskMeta = document.createElement('div');
    taskMeta.className = 'task-meta';
    
    const prioritySpan = document.createElement('span');
    prioritySpan.className = `task-priority ${priority}`;
    prioritySpan.textContent = priority.charAt(0).toUpperCase() + priority.slice(1) + ' Priority';
    
    const categorySpan = document.createElement('span');
    categorySpan.className = 'task-category';
    categorySpan.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    
    const dueSpan = document.createElement('span');
    dueSpan.className = 'task-due';
    dueSpan.textContent = dueDate ? `Due: ${new Date(dueDate).toLocaleDateString()}` : 'No Due Date';
    if (dueDate && new Date(dueDate) < new Date()) {
        dueSpan.classList.add('overdue');
    }
    
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.addEventListener('click', function() {
        editTask(li, taskSpan);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.addEventListener('click', function() {
        li.remove();
        saveTasks();
        updateTaskCount();
    });
    
    taskContent.appendChild(checkbox);
    taskContent.appendChild(taskSpan);
    taskMeta.appendChild(prioritySpan);
    taskMeta.appendChild(categorySpan);
    taskMeta.appendChild(dueSpan);
    taskContent.appendChild(taskMeta);
    taskActions.appendChild(editBtn);
    taskActions.appendChild(deleteBtn);
    li.appendChild(taskContent);
    li.appendChild(taskActions);
    
    return li;
}

function toggleTaskCompletion(li, isCompleted) {
    console.log('! working ..... toggleTaskCompletion');
    const taskSpan = li.querySelector('.task-text');
    if (isCompleted) {
        taskSpan.classList.add('completed');
    } else {
        taskSpan.classList.remove('completed');
    }
    saveTasks();
    updateTaskCount();
}

function editTask(li, taskSpan) {
    console.log('! working ..... editTask');
    const currentText = taskSpan.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'edit-input';
    
    const taskContent = li.querySelector('.task-content');
    taskContent.replaceChild(input, taskSpan);
    input.focus();
    input.select();
    
    const saveEditHandler = function() {
        saveEdit(li, input);
        input.removeEventListener('keypress', keypressHandler);
        input.removeEventListener('blur', blurHandler);
    };
    
    const keypressHandler = function(e) {
        if (e.key === 'Enter') {
            saveEditHandler();
        }
    };
    
    const blurHandler = function() {
        saveEditHandler();
    };
    
    input.addEventListener('keypress', keypressHandler);
    input.addEventListener('blur', blurHandler);
}

function saveEdit(li, input) {
    console.log('! working ..... saveEdit');
    const newText = input.value.trim();
    if (newText) {
        const taskSpan = document.createElement('span');
        taskSpan.className = 'task-text';
        taskSpan.textContent = newText;
        
        const checkbox = li.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            taskSpan.classList.add('completed');
        }
        
        const taskContent = li.querySelector('.task-content');
        taskContent.replaceChild(taskSpan, input);
        
        taskSpan.addEventListener('click', function() {
            editTask(li, taskSpan);
        });
        
        saveTasks();
    } else {
        li.remove();
        saveTasks();
    }
}

function saveTasks() {
    console.log('! working ..... saveTasks');
    const tasks = [];
    const taskItems = document.querySelectorAll('#taskList li');
    
    taskItems.forEach(li => {
        const taskText = li.querySelector('.task-text').textContent;
        const isCompleted = li.querySelector('input[type="checkbox"]').checked;
        const priority = li.classList.contains('priority-high') ? 'high' :
                         li.classList.contains('priority-medium') ? 'medium' : 'low';
        const category = li.querySelector('.task-category').textContent.toLowerCase();
        const dueDate = li.querySelector('.task-due').textContent.includes('Due:') ? 
                        li.querySelector('.task-due').textContent.replace('Due: ', '') : '';
        
        tasks.push({
            text: taskText,
            completed: isCompleted,
            priority: priority,
            category: category,
            dueDate: dueDate
        });
    });
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateProgress();
}

function loadTasks() {
    console.log('! working ..... loadTasks');
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        try {
            const tasks = JSON.parse(savedTasks);
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = '';
            
            tasks.forEach(task => {
                const li = createTaskElement(task.text, task.priority, task.category, task.dueDate, task.completed);
                taskList.appendChild(li);
            });
        } catch (error) {
            console.error('Error loading tasks:', error);
            showError('Error loading saved tasks');
        }
    }
    updateTaskCount();
}

function updateTaskCount() {
    console.log('! working ..... updateTaskCount');
    const taskItems = document.querySelectorAll('#taskList li');
    const tasksCount = document.getElementById('tasksCount');
    const emptyState = document.getElementById('emptyState');
    tasksCount.textContent = `${taskItems.length} tasks`;

    // Toggle empty state
    if (taskItems.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
    }
}

function updateProgress() {
    console.log('! working ..... updateProgress');
    const taskItems = document.querySelectorAll('#taskList li');
    const completedTasks = Array.from(taskItems).filter(li => li.querySelector('input[type="checkbox"]').checked).length;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    const progressPercentage = taskItems.length > 0 ? (completedTasks / taskItems.length) * 100 : 0;
    progressFill.style.width = `${progressPercentage}%`;
    progressText.textContent = `${Math.round(progressPercentage)}% Complete`;
}

function toggleTheme() {
    console.log('! working ..... toggleTheme');
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);

    const themeBtn = document.getElementById('toggleThemeBtn');
    themeBtn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode';
    themeBtn.setAttribute('aria-pressed', isDarkMode);
}

function loadThemePreference() {
    console.log('! working ..... loadThemePreference');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('toggleThemeBtn').innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        document.getElementById('toggleThemeBtn').setAttribute('aria-pressed', 'true');
    } else {
        document.getElementById('toggleThemeBtn').setAttribute('aria-pressed', 'false');
    }
}

function clearFilters() {
    console.log('! working ..... clearFilters');
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('priorityFilter').value = 'all';
    document.getElementById('searchInput').value = '';
    loadTasks();
}

function filterTasks() {
    console.log('! working ..... filterTasks');
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    
    const taskItems = document.querySelectorAll('#taskList li');
    
    taskItems.forEach(li => {
        const taskText = li.querySelector('.task-text').textContent.toLowerCase();
        const taskCategory = li.querySelector('.task-category').textContent.toLowerCase();
        const taskPriority = li.classList.contains('priority-high') ? 'high' :
                             li.classList.contains('priority-medium') ? 'medium' : 'low';
        
        const matchesCategory = categoryFilter === 'all' || taskCategory === categoryFilter;
        const matchesPriority = priorityFilter === 'all' || taskPriority === priorityFilter;
        const matchesSearch = taskText.includes(searchInput);
        
        if (matchesCategory && matchesPriority && matchesSearch) {
            li.style.display = '';
        } else {
            li.style.display = 'none';
        }
    });
    
    // Update task count after filtering
    updateTaskCount();
}

function showError(message) {
    console.log('! working ..... showError');
    hideError();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.container');
    const inputGroup = document.querySelector('.input-group');
    container.insertBefore(errorDiv, inputGroup.nextSibling);
    
    setTimeout(hideError, 3000);
}

function hideError() {
    console.log('! working ..... hideError');
    const errorDiv = document.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}
