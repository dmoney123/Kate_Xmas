// Timer functionality
let timerInterval = null;
let timeRemaining = 0; // in seconds
let isRunning = false;
let isPaused = false;

const timerInput = document.getElementById('timer-input');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const timerTime = document.getElementById('timer-time');
const timerDisplay = document.querySelector('.timer-display');

// Initialize timer from localStorage
function initTimer() {
    const savedTime = localStorage.getItem('timerRemaining');
    const savedRunning = localStorage.getItem('timerRunning');
    const savedPaused = localStorage.getItem('timerPaused');
    
    if (savedTime) {
        timeRemaining = parseInt(savedTime);
        updateTimerDisplay();
    } else {
        timeRemaining = parseInt(timerInput.value) * 60;
        updateTimerDisplay();
    }
    
    if (savedRunning === 'true' && savedPaused !== 'true') {
        startTimer();
    } else if (savedPaused === 'true') {
        isPaused = true;
        pauseBtn.disabled = false;
        startBtn.disabled = false;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Visual feedback
    timerDisplay.classList.remove('warning', 'finished');
    if (timeRemaining <= 60 && timeRemaining > 0) {
        timerDisplay.classList.add('warning');
    } else if (timeRemaining === 0) {
        timerDisplay.classList.add('finished');
    }
}

function startTimer() {
    if (!isRunning && !isPaused) {
        timeRemaining = parseInt(timerInput.value) * 60;
    }
    
    isRunning = true;
    isPaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    timerInput.disabled = true;
    
    timerInterval = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
            localStorage.setItem('timerRemaining', timeRemaining.toString());
        } else {
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            timerInput.disabled = false;
            localStorage.removeItem('timerRemaining');
            localStorage.removeItem('timerRunning');
            localStorage.removeItem('timerPaused');
            
            // Notification
            if (Notification.permission === 'granted') {
                new Notification('Timer Finished!', {
                    body: 'Your study session timer has completed.',
                    icon: '🔔'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }
    }, 1000);
    
    localStorage.setItem('timerRunning', 'true');
    localStorage.setItem('timerPaused', 'false');
}

function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    isPaused = true;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    localStorage.setItem('timerRunning', 'false');
    localStorage.setItem('timerPaused', 'true');
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    isPaused = false;
    timeRemaining = parseInt(timerInput.value) * 60;
    updateTimerDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    timerInput.disabled = false;
    localStorage.removeItem('timerRemaining');
    localStorage.removeItem('timerRunning');
    localStorage.removeItem('timerPaused');
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

timerInput.addEventListener('change', () => {
    if (!isRunning && !isPaused) {
        timeRemaining = parseInt(timerInput.value) * 60;
        updateTimerDisplay();
    }
});

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Initialize timer
initTimer();

// List functionality with localStorage persistence
const listIds = ['goals-list', 'questions-list', 'future-list'];

// Load lists from localStorage
function loadLists() {
    listIds.forEach(listId => {
        const savedItems = localStorage.getItem(listId);
        const list = document.getElementById(listId);
        
        if (savedItems) {
            const items = JSON.parse(savedItems);
            items.forEach((item, index) => {
                addListItem(listId, item, index);
            });
        }
    });
}

// Save list to localStorage
function saveList(listId) {
    const list = document.getElementById(listId);
    const items = Array.from(list.children).map(li => {
        const content = li.querySelector('.item-content');
        return content ? content.textContent.trim() : '';
    }).filter(text => text.length > 0);
    
    localStorage.setItem(listId, JSON.stringify(items));
}

// Add new list item
function addItem(listId) {
    addListItem(listId, '', -1);
    saveList(listId);
    
    // Focus on the new item for editing
    const list = document.getElementById(listId);
    const lastItem = list.lastElementChild;
    if (lastItem) {
        const content = lastItem.querySelector('.item-content');
        if (content) {
            content.click();
        }
    }
}

// Create a list item element
function addListItem(listId, text, index) {
    const list = document.getElementById(listId);
    const li = document.createElement('li');
    
    const content = document.createElement('span');
    content.className = 'item-content';
    content.textContent = text || 'Click to edit';
    content.contentEditable = false;
    
    // Make content editable on click
    content.addEventListener('click', function() {
        if (!content.contentEditable) {
            content.contentEditable = true;
            content.focus();
            li.classList.add('editing');
            
            // Select all text
            const range = document.createRange();
            range.selectNodeContents(content);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });
    
    // Save on blur
    content.addEventListener('blur', function() {
        content.contentEditable = false;
        li.classList.remove('editing');
        const trimmedText = content.textContent.trim();
        if (trimmedText === '') {
            content.textContent = 'Click to edit';
        }
        saveList(listId);
    });
    
    // Save on Enter key
    content.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            content.blur();
        }
    });
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-icon delete';
    deleteBtn.textContent = '✕';
    deleteBtn.setAttribute('aria-label', 'Delete item');
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        li.remove();
        saveList(listId);
    });
    
    const actions = document.createElement('div');
    actions.className = 'item-actions';
    actions.appendChild(deleteBtn);
    
    li.appendChild(content);
    li.appendChild(actions);
    
    if (index >= 0 && index < list.children.length) {
        list.insertBefore(li, list.children[index]);
    } else {
        list.appendChild(li);
    }
}

// Initialize lists
loadLists();

