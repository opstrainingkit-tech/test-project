// ==================== 定数定義 ====================
const STORAGE_KEY = 'progressTodoTasks';

// ==================== DOMエレメント ====================
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const progressBar = document.getElementById('progressBar');
const progressPercentage = document.getElementById('progressPercentage');
const completedCount = document.getElementById('completedCount');
const totalCount = document.getElementById('totalCount');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// ==================== データ管理 ====================
class TodoManager {
    constructor() {
        this.tasks = this.loadFromStorage();
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load tasks from storage:', error);
            return [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Failed to save tasks to storage:', error);
        }
    }

    addTask(text) {
        if (!text.trim()) return false;

        const task = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveToStorage();
        return task;
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveToStorage();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage();
        }
    }

    clearCompleted() {
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveToStorage();
    }

    clearAll() {
        if (confirm('本当にすべてのタスクを削除しますか？')) {
            this.tasks = [];
            this.saveToStorage();
        }
    }

    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        return { total, completed, percentage };
    }
}

// ==================== UIマネージャー ====================
class UIManager {
    static renderTasks(tasks) {
        tasksList.innerHTML = '';

        tasks.forEach(task => {
            const taskElement = UIManager.createTaskElement(task);
            tasksList.appendChild(taskElement);
        });

        UIManager.updateProgress();
        UIManager.updateEmptyState();
    }

    static createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.dataset.taskId = task.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute('aria-label', `タスク完了: ${task.text}`);
        checkbox.addEventListener('change', () => {
            todoManager.toggleTask(task.id);
            UIManager.renderTasks(todoManager.tasks);
        });

        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete';
        deleteBtn.innerHTML = '✕';
        deleteBtn.setAttribute('aria-label', `タスク削除: ${task.text}`);
        deleteBtn.addEventListener('click', () => {
            todoManager.deleteTask(task.id);
            UIManager.renderTasks(todoManager.tasks);
        });

        div.appendChild(checkbox);
        div.appendChild(textSpan);
        div.appendChild(deleteBtn);

        return div;
    }

    static updateProgress() {
        const { total, completed, percentage } = todoManager.getStats();

        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
        completedCount.textContent = completed;
        totalCount.textContent = total;

        // アニメーション効果
        progressBar.style.transition = 'width 0.5s ease';
    }

    static updateEmptyState() {
        const isEmpty = todoManager.tasks.length === 0;
        emptyState.style.display = isEmpty ? 'block' : 'none';
    }

    static clearInput() {
        todoInput.value = '';
        todoInput.focus();
    }
}

// ==================== イベントリスナー ====================
const todoManager = new TodoManager();

addBtn.addEventListener('click', () => {
    const task = todoManager.addTask(todoInput.value);
    if (task) {
        UIManager.renderTasks(todoManager.tasks);
        UIManager.clearInput();
    }
});

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addBtn.click();
    }
});

todoInput.addEventListener('input', (e) => {
    // リアルタイム入力検証
    if (e.target.value.trim()) {
        addBtn.style.opacity = '1';
    } else {
        addBtn.style.opacity = '0.6';
    }
});

clearCompletedBtn.addEventListener('click', () => {
    if (todoManager.tasks.some(task => task.completed)) {
        todoManager.clearCompleted();
        UIManager.renderTasks(todoManager.tasks);
    }
});

clearAllBtn.addEventListener('click', () => {
    todoManager.clearAll();
    UIManager.renderTasks(todoManager.tasks);
});

// ==================== 初期化 ====================
window.addEventListener('DOMContentLoaded', () => {
    UIManager.renderTasks(todoManager.tasks);
    todoInput.focus();
});
