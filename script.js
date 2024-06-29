document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const auth = document.getElementById('auth');
    const registerForm = document.getElementById('register-form');
    const taskManager = document.getElementById('task-manager');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const showLoginLink = document.getElementById('show-login');
    const showRegisterLink = document.getElementById('show-register');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutBtnTop = document.getElementById('logout-btn-top');
    const addProjectBtn = document.getElementById('add-project-btn');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const projectList = document.getElementById('project-list');
    const taskProjectSelect = document.getElementById('task-project');
    const taskUserSelect = document.getElementById('task-user');

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

            const projectName = projects.find(project => project.id === task.projectId)?.name || 'No Project';
            const assignedUser = users.find(user => user.id === task.userId)?.username || 'Unassigned';

            taskItem.innerHTML = `
                <strong>${task.title}</strong> - ${task.description}<br>
                <small>Priority: ${task.priority} | Due: ${task.date} ${task.time} | Project: ${projectName} | Assigned to: ${assignedUser}</small><br>
                <select onchange="changeTaskStatus(${index}, this.value)">
                    <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>Do zrobienia</option>
                    <option value="inprogress" ${task.status === 'inprogress' ? 'selected' : ''}>W trakcie</option>
                    <option value="done" ${task.status === 'done' ? 'selected' : ''}>Zrobione</option>
                </select>
                <button data-index="${index}">Delete</button>
                <button class="edit-task-btn" data-index="${index}">Edit</button>
            `;

            taskItem.classList.add(task.priority);
            taskList.appendChild(taskItem);

            taskItem.querySelector('.edit-task-btn').addEventListener('click', (e) => {
                const taskIndex = e.target.dataset.index;
                editTask(taskIndex);
            });

            taskItem.querySelector('button[data-index]').addEventListener('click', (e) => {
                const taskIndex = e.target.dataset.index;
                tasks.splice(taskIndex, 1);
                saveTasks();
                renderTasks();
            });
        });
    };

    const renderProjects = () => {
        projectList.innerHTML = '';
        taskProjectSelect.innerHTML = '<option value="">Select Project</option>';
        projects.forEach((project, index) => {
            const projectItem = document.createElement('li');
            projectItem.innerHTML = `
                ${project.name}
                <button data-index="${index}">Delete</button>
            `;
            projectList.appendChild(projectItem);
            taskProjectSelect.innerHTML += `<option value="${project.id}">${project.name}</option>`;

            projectItem.querySelector('button').addEventListener('click', (e) => {
                const projectIndex = e.target.dataset.index;
                projects.splice(projectIndex, 1);
                saveProjects();
                renderProjects();
            });

            projectItem.addEventListener('click', () => {
                renderTasksForProject(project.id);
            });
        });
    };

    const renderUsers = () => {
        taskUserSelect.innerHTML = '<option value="">Select User</option>';
        users.forEach(user => {
            taskUserSelect.innerHTML += `<option value="${user.id}">${user.username}</option>`;
        });
    };

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const saveProjects = () => {
        localStorage.setItem('projects', JSON.stringify(projects));
    };

    const saveUsers = () => {
        localStorage.setItem('users', JSON.stringify(users));
    };

    const editTask = (index) => {
        const task = tasks[index];
        const { title, description, priority, date, time, projectId, userId } = task;

        document.getElementById('task-title').value = title;
        document.getElementById('task-desc').value = description;
        document.getElementById('task-priority').value = priority;
        document.getElementById('task-date').value = date;
        document.getElementById('task-time').value = time;
        document.getElementById('task-project').value = projectId;
        document.getElementById('task-user').value = userId;
        document.getElementById('add-task-btn').textContent = "Save"
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
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
                <select>
                    <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>Do zrobienia</option>
                    <option value="inprogress" ${task.status === 'inprogress' ? 'selected' : ''}>W trakcie</option>
                    <option value="done" ${task.status === 'done' ? 'selected' : ''}>Zrobione</option>
                </select>
            `;

            taskItem.classList.add(task.priority);
            taskList.appendChild(taskItem);
        });
    };

    const deleteTaskFromProject = (projectId, taskIndex) => {
        tasks = tasks.filter((task, index) => !(task.projectId === projectId && index === taskIndex));
        renderTasksForProject(projectId);
        saveData();
    };
    const changeTaskStatus = (index, newStatus) => {
        tasks[index].status = newStatus;
        renderTasks();
        saveTasks();
    };

    window.changeTaskStatus = changeTaskStatus;
    window.editTask = editTask;
    window.deleteTaskFromProject = deleteTaskFromProject;

    loginBtn.addEventListener('click', () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        currentUser = users.find(user => user.username === username && user.password === password);

        if (currentUser) {
            auth.classList.add('hidden');
            taskManager.classList.remove('hidden');
            renderTasks();
            renderProjects();
            renderUsers();
        } else {
            alert('Invalid login credentials');
        }
    });

    registerBtn.addEventListener('click', () => {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        if (username && password) {
            const newUser = { id: generateId(), username, password };
            users.push(newUser);
            saveUsers();
            alert('Registration successful');
            showLoginForm();
        } else {
            alert('Please enter both username and password');
        }
    });

    logoutBtn.addEventListener('click', () => {
        auth.classList.remove('hidden');
        taskManager.classList.add('hidden');
        currentUser = null;
    });

    logoutBtnTop.addEventListener('click', () => {
        auth.classList.remove('hidden');
        taskManager.classList.add('hidden');
        currentUser = null;
    });

   addProjectBtn.addEventListener('click', () => {
        const projectName = document.getElementById('project-name').value;
        if (projectName) {
            const newProject = { id: generateId(), name: projectName };
            projects.push(newProject);
            saveProjects();
            renderProjects();
            document.getElementById('project-name').value = '';
        } else {
            alert('Please enter a project name');
        }
    });

    addTaskBtn.addEventListener('click', () => {
        const taskTitle = document.getElementById('task-title').value;
        const taskDesc = document.getElementById('task-desc').value;
        const taskPriority = document.getElementById('task-priority').value;
        const taskDate = document.getElementById('task-date').value;
        const taskTime = document.getElementById('task-time').value;
        const taskProject = document.getElementById('task-project').value;
        const taskUser = document.getElementById('task-user').value;

        if (taskTitle && taskDesc && taskPriority && taskDate && taskTime) {
            const newTask = {
                id: generateId(),
                title: taskTitle,
                description: taskDesc,
                priority: taskPriority,
                date: taskDate,
                time: taskTime,
                projectId: taskProject,
                userId: taskUser,
            };
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            document.getElementById('task-title').value = '';
            document.getElementById('task-desc').value = '';
            document.getElementById('task-priority').value = 'low';
            document.getElementById('task-date').value = '';
            document.getElementById('task-time').value = '';
            document.getElementById('task-project').value = '';
            document.getElementById('task-user').value = '';
        } else {
            alert('Please fill in all fields');
        }
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });

    // Load tasks and projects from local storage on page load
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    projects = JSON.parse(localStorage.getItem('projects')) || [];

    if (users.length === 0) {
        // For demonstration purposes, create a default user
        const defaultUser = { id: generateId(), username: 'admin', password: 'admin' };
        users.push(defaultUser);
        saveUsers();
    }

    renderTasks();
    renderProjects();
    renderUsers();
});
