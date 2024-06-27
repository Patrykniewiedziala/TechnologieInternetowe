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

    let tasks = [];
    let projects = [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = null;

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
                <button onclick="editTask(${index})">Edytuj</button>
                <button onclick="deleteTask(${index})">Usuń</button>
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
            projectItem.style.cursor = 'pointer'; // Ustawienie kursora na wskaźnik (ręka) dla elementu klikalnego

            // Dodanie przycisku usuwania projektu
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Usuń';
            deleteButton.addEventListener('click', () => deleteProject(project.id));

            projectItem.appendChild(deleteButton);
            projectItem.addEventListener('click', () => renderTasksForProject(project.id)); // Dodanie nasłuchiwacza kliknięć
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
                <button onclick="editTask(${index})">Edytuj</button>
                <button onclick="deleteTaskFromProject(${projectId}, ${index})">Usuń z projektu</button>
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
        const userId = document.getElementById('task-user').value; // Upewnij się, że pobierasz prawidłową wartość userId
    
        if (title && description && dueDate && dueTime) {
            const newTask = { 
                title, 
                description, 
                priority, 
                dueDate, 
                dueTime, 
                projectId, 
                userId,  // Przypisanie użytkownika do zadania
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

    const saveEditedTask = (index) => {
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;
        const priority = document.getElementById('task-priority').value;
        const dueDate = document.getElementById('task-date').value;
        const dueTime = document.getElementById('task-time').value;
        const projectId = document.getElementById('task-project').value;
        const userId = document.getElementById('task-user').value;

        if (title && description && dueDate && dueTime) {
            tasks[index] = {
                title,
                description,
                priority,
                dueDate,
                dueTime,
                projectId,
                userId,
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

    window.editTask = editTask;
    window.deleteTask = deleteTask;


    const deleteTaskFromProject = (projectId, taskIndex) => {
        const project = projects.find(proj => proj.id === projectId);
        if (project) {
            project.tasks.splice(taskIndex, 1); // Usunięcie zadania z tablicy zadań projektu
            renderTasksForProject(projectId); // Ponowne renderowanie zadań dla danego projektu
            saveData(); // Zapisanie zmienionych danych
        } else {
            console.error('Project not found');
        }
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
            alert('Proszę podać nazwę projektu');
        }
    };

    const deleteProject = (projectId) => {
        projects = projects.filter(project => project.id !== projectId);
        tasks = tasks.filter(task => task.projectId !== projectId);
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

    const generateId = () => {
        return '_' + Math.random().toString(36).substr(2, 9);
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
    };

    const renderUsersSelect = () => {
        const taskUserSelect = document.getElementById('task-user');
        taskUserSelect.innerHTML = '<option value="">Przypisz użytkownika</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;
            taskUserSelect.appendChild(option);
        });
    };

    const login = () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
            currentUser = user;
            loginForm.classList.add('hidden');
            registerForm.classList.add('hidden');
            taskManager.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');
            loadData(); // Załaduj dane po zalogowaniu
        } else {
            alert('Nieprawidłowa nazwa użytkownika lub hasło');
        }
    };

    const logout = () => {
        currentUser = null;
        tasks = [];
        projects = [];
        taskList.innerHTML = '';
        projectList.innerHTML = '';
        taskProjectSelect.innerHTML = '<option value="">Wybierz projekt</option>';
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        taskManager.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    };

    const register = () => {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        if (username && password) {
            const newUser = { id: generateId(), username, password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            alert('Zarejestrowano pomyślnie. Możesz teraz się zalogować.');
            showLoginForm();
        } else {
            alert('Proszę podać nazwę użytkownika i hasło');
        }
    };

    const showRegisterForm = () => {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    };

    const showLoginForm = () => {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    };

    // Nasłuchiwacze zdarzeń
    addTaskBtn.addEventListener('click', addTask);
    addProjectBtn.addEventListener('click', addProject);
    loginBtn.addEventListener('click', login);
    registerBtn.addEventListener('click', register);
    showRegisterLink.addEventListener('click', showRegisterForm);
    showLoginLink.addEventListener('click', showLoginForm);
    logoutBtn.addEventListener('click', logout);

    // Załaduj dane po pierwszym otwarciu aplikacji
    loadData();
});
