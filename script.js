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
            
            // Play sound notification
            playTimerSound();
            
            // Browser notification
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

// Play sound notification (Pomodoro style)
function playTimerSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Create a pleasant beep sound (800Hz tone)
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        // Fade in/out for smoother sound
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        // Play a second beep after a short delay for Pomodoro-style notification
        setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            
            oscillator2.frequency.value = 800;
            oscillator2.type = 'sine';
            
            gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
            
            oscillator2.start(audioContext.currentTime);
            oscillator2.stop(audioContext.currentTime + 0.5);
        }, 600);
    } catch (error) {
        console.log('Audio playback not supported or blocked:', error);
    }
}

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
    const isPlaceholder = !text || text.trim() === '';
    content.textContent = isPlaceholder ? 'Click to edit' : text;
    content.contentEditable = false;
    content.setAttribute('data-placeholder', isPlaceholder);
    
    // Make content editable on click
    content.addEventListener('click', function(e) {
        e.stopPropagation();
        if (content.contentEditable === 'false' || !content.contentEditable) {
            content.contentEditable = 'true';
            li.classList.add('editing');
            
            // Clear placeholder text if it's the default
            if (content.getAttribute('data-placeholder') === 'true' || content.textContent.trim() === 'Click to edit') {
                content.textContent = '';
                content.setAttribute('data-placeholder', 'false');
            }
            
            // Focus and select all
            setTimeout(() => {
                content.focus();
                const range = document.createRange();
                range.selectNodeContents(content);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }, 0);
        }
    });
    
    // Save on blur
    content.addEventListener('blur', function() {
        content.contentEditable = 'false';
        li.classList.remove('editing');
        const trimmedText = content.textContent.trim();
        if (trimmedText === '') {
            content.textContent = 'Click to edit';
            content.setAttribute('data-placeholder', 'true');
        } else {
            content.setAttribute('data-placeholder', 'false');
        }
        saveList(listId);
    });
    
    // Save on Enter key
    content.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            content.blur();
        }
        // Prevent event bubbling
        e.stopPropagation();
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

