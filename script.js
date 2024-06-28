document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.querySelector('.task-form');
    const projectForm = document.querySelector('.project-form');
    const taskList = document.getElementById('task-list');
    const projectList = document.getElementById('project-list');
    const addTaskBtn = document.getElementById('add-task-btn');
    const addProjectBtn = document.getElementById('add-project-btn');
    const taskProjectSelect = document.getElementById('task-project');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const taskManager = document.getElementById('task-manager');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const showLoginLink = document.getElementById('show-login');
    const showRegisterLink = document.getElementById('show-register');
    const logoutBtn = document.getElementById('logout-btn');
    const taskStatusSelect = document.getElementById('task-status');

    let tasks = [];
    let projects = [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = null;

    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    const showLoginForm = () => {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    };

    const showRegisterForm = () => {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.classList.add('task-item');

            const projectName = projects.find(project => project.id === task.projectId)?.name || 'Brak projektu';
            const assignedUser = users.find(user => user.id === task.userId)?.username || 'Nieprzypisany';

            taskItem.innerHTML = `
                <strong>Nazwa: ${task.title}</strong>
                <p>Opis: ${task.description}</p>
                <span>Deadline: ${task.dueDate}</span>
                <span>Przypisany użytkownik: ${assignedUser}</span>
                <span>Status: ${task.status}</span>
                <button onclick="editTask(${index})">Edytuj</button>
                <button onclick="deleteTask(${index})">Usuń</button>
                <select onchange="changeTaskStatus(${index}, this.value)">
                    <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>Do zrobienia</option>
                    <option value="inprogress" ${task.status === 'inprogress' ? 'selected' : ''}>W trakcie</option>
                    <option value="done" ${task.status === 'done' ? 'selected' : ''}>Zrobione</option>
                </select>
            `;

            taskItem.classList.add(task.priority);

            taskList.appendChild(taskItem);
        });
    };

    const renderProjects = () => {
        projectList.innerHTML = '';
        taskProjectSelect.innerHTML = '<option value="">Wybierz projekt</option>';
        projects.forEach(project => {
            const projectItem = document.createElement('li');
            projectItem.textContent = project.name;
            projectItem.style.cursor = 'pointer';

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Usuń';
            deleteButton.addEventListener('click', () => deleteProject(project.id));

            projectItem.appendChild(deleteButton);
            projectItem.addEventListener('click', () => renderTasksForProject(project.id));
            projectList.appendChild(projectItem);

            const projectOption = document.createElement('option');
            projectOption.value = project.id;
            projectOption.textContent = project.name;
            taskProjectSelect.appendChild(projectOption);
        });
    };

    const renderTasksForProject = (projectId) => {
        const filteredTasks = tasks.filter(task => task.projectId === projectId);
        taskList.innerHTML = '';
        filteredTasks.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.classList.add('task-item');

            const projectName = projects.find(project => project.id === task.projectId)?.name || 'Brak projektu';
            const assignedUser = users.find(user => user.id === task.userId)?.username || 'Nieprzypisany';

            taskItem.innerHTML = `
                <strong>${task.title}</strong>
                <p>${task.description}</p>
                <span>${task.dueDate}</span>
                <span>${projectName}</span>
                <span>Przypisany użytkownik: ${assignedUser}</span>
                <span>Status: ${task.status}</span>
                <button onclick="editTask(${index})">Edytuj</button>
                <button onclick="deleteTaskFromProject(${projectId}, ${index})">Usuń z projektu</button>
                <select onchange="changeTaskStatus(${index}, this.value)">
                    <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>Do zrobienia</option>
                    <option value="inprogress" ${task.status === 'inprogress' ? 'selected' : ''}>W trakcie</option>
                    <option value="done" ${task.status === 'done' ? 'selected' : ''}>Zrobione</option>
                </select>
            `;

            taskItem.classList.add(task.priority);

            taskList.appendChild(taskItem);
        });
    };

    const addTask = () => {
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;
        const priority = document.getElementById('task-priority').value;
        const dueDate = document.getElementById('task-date').value;
        const dueTime = document.getElementById('task-time').value;
        const projectId = document.getElementById('task-project').value;
        const userId = document.getElementById('task-user').value;
        const status = 'todo';
    
        if (title && description && dueDate && dueTime) {
            const newTask = { 
                title, 
                description, 
                priority, 
                dueDate, 
                dueTime, 
                projectId, 
                userId,  
                status,
                reminded: false 
            };
            tasks.push(newTask);
            renderTasks();
            saveData();
            clearForm();
        } else {
            alert('Proszę wypełnić wszystkie pola');
        }
    };

    const editTask = (index) => {
        const task = tasks[index];
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-desc').value = task.description;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-date').value = task.dueDate;
        document.getElementById('task-time').value = task.dueTime;
        document.getElementById('task-project').value = task.projectId;
        document.getElementById('task-user').value = task.userId;
        document.getElementById('task-status').textContent = 'Edytuj zadanie';

        addTaskBtn.textContent = 'Zapisz zmiany';
        addTaskBtn.removeEventListener('click', addTask);
        addTaskBtn.addEventListener('click', () => saveEditedTask(index));
    };
    window.editTask = editTask;

    const saveEditedTask = (index) => {
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;
        const priority = document.getElementById('task-priority').value;
        const dueDate = document.getElementById('task-date').value;
        const dueTime = document.getElementById('task-time').value;
        const projectId = document.getElementById('task-project').value;
        const userId = document.getElementById('task-user').value;
        const status = tasks[index].status;

        if (title && description && dueDate && dueTime) {
            tasks[index] = {
                title,
                description,
                priority,
                dueDate,
                dueTime,
                projectId,
                userId,
                status,
                reminded: false
            };
            renderTasks();
            saveData();
            clearForm();
            addTaskBtn.textContent = 'Dodaj zadanie';
            addTaskBtn.removeEventListener('click', saveEditedTask);
            addTaskBtn.addEventListener('click', addTask);
            document.getElementById('task-status').textContent = 'Dodaj zadanie';
        } else {
            alert('Proszę wypełnić wszystkie pola');
        }
    };

    const deleteTask = (index) => {
        tasks.splice(index, 1);
        renderTasks();
        saveData();
    };

    const deleteTaskFromProject = (projectId, taskIndex) => {
        tasks = tasks.filter((task, index) => !(task.projectId === projectId && index === taskIndex));
        renderTasksForProject(projectId);
        saveData();
    };

    const addProject = () => {
        const projectName = document.getElementById('project-name').value;
        if (projectName) {
            const newProject = { id: generateId(), name: projectName };
            projects.push(newProject);
            renderProjects();
            saveData();
            document.getElementById('project-name').value = '';
        } else {
            alert('Proszę wpisać nazwę projektu');
        }
    };

    const deleteProject = (projectId) => {
        projects = projects.filter(project => project.id !== projectId);
        tasks = tasks.map(task => {
            if (task.projectId === projectId) {
                return { ...task, projectId: null };
            }
            return task;
        });
        renderProjects();
        renderTasks();
        saveData();
    };

    const clearForm = () => {
        document.getElementById('task-title').value = '';
        document.getElementById('task-desc').value = '';
        document.getElementById('task-priority').value = 'low';
        document.getElementById('task-date').value = '';
        document.getElementById('task-time').value = '';
        document.getElementById('task-project').value = '';
        document.getElementById('task-user').value = '';
    };

    const saveData = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('projects', JSON.stringify(projects));
        localStorage.setItem('users', JSON.stringify(users));
    };

    const loadData = () => {
        const storedTasks = JSON.parse(localStorage.getItem('tasks'));
        if (storedTasks) {
            tasks = storedTasks;
            renderTasks();
        }

        const storedProjects = JSON.parse(localStorage.getItem('projects'));
        if (storedProjects) {
            projects = storedProjects;
            renderProjects();
        }

        const storedUsers = JSON.parse(localStorage.getItem('users'));
        if (storedUsers) {
            users = storedUsers;
            renderUsersSelect(); // Aktualizacja listy użytkowników w formularzu zadania
        }
        window.deleteTaskFromProject = deleteTaskFromProject;
        window.deleteTask = deleteTask;
    };

    const changeTaskStatus = (index, newStatus) => {
        tasks[index].status = newStatus;
        renderTasks();
        saveData();
    };

    window.changeTaskStatus = changeTaskStatus;

    addTaskBtn.addEventListener('click', addTask);
    addProjectBtn.addEventListener('click', addProject);

    const login = (username, password) => {
        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
            currentUser = user;
            taskManager.classList.remove('hidden');
            loginForm.classList.add('hidden');
            registerForm.classList.add('hidden');
            renderTasks();
            renderProjects();
            document.querySelector('.task-form select#task-user').value = currentUser.id;
        } else {
            alert('Nieprawidłowe dane logowania');
        }
    };

    const register = (username, password) => {
        if (users.find(user => user.username === username)) {
            alert('Nazwa użytkownika już istnieje');
            return;
        }

        const newUser = { id: generateId(), username, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Rejestracja zakończona sukcesem. Możesz się teraz zalogować.');
        showLoginForm();
    };

    loginBtn.addEventListener('click', () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        login(username, password);
    });

    registerBtn.addEventListener('click', () => {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        register(username, password);
    });

    showLoginLink.addEventListener('click', showLoginForm);
    showRegisterLink.addEventListener('click', showRegisterForm);

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        taskManager.classList.add('hidden');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    });

    const renderUsersSelect = () => {
        const userSelect = document.getElementById('task-user');
        userSelect.innerHTML = '<option value="">Przypisz użytkownika</option>';
        users.forEach(user => {
            const userOption = document.createElement('option');
            userOption.value = user.id;
            userOption.textContent = user.username;
            userSelect.appendChild(userOption);
        });
    };

    loadData();
});
