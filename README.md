# Study Session Webapp

A clean, minimal web application for focused study sessions with an adjustable timer and editable lists for goals, questions, and future items.

## Features

- **Adjustable Countdown Timer**: Set custom study session durations with start, pause, and reset controls
- **Three Editable Lists**:
  - Study Session Goals
  - Questions
  - Future
- **State Persistence**: All data (timer state and list items) is saved to browser localStorage and persists across sessions
- **Inline Editing**: Click any list item to edit it directly
- **Clean, Minimal Design**: Modern UI with a gradient background

## Local Development

Simply open `index.html` in your web browser. No build process or server required!

## Deployment to GitHub Pages

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Study Session webapp"
   git branch -M main
   git remote add origin https://github.com/dmoney123/Kate_Xmas.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub: https://github.com/dmoney123/Kate_Xmas
   - Click on **Settings** (in the repository navigation)
   - Scroll down to **Pages** in the left sidebar
   - Under **Source**, select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder
   - Click **Save**

3. **Access your site**:
   - Your site will be available at: `https://dmoney123.github.io/Kate_Xmas/`
   - It may take a few minutes for the site to be available after enabling Pages

## How to Use

1. **Timer**:
   - Set your desired study duration in minutes
   - Click "Start" to begin the countdown
   - Use "Pause" to temporarily stop the timer
   - Use "Reset" to stop and reset the timer

2. **Lists**:
   - Click "+ Add" buttons to create new items
   - Click on any list item to edit it inline
   - Press Enter or click outside to save changes
   - Click the ✕ button to delete an item

## Browser Compatibility

Works in all modern browsers that support:
- localStorage API
- CSS Grid and Flexbox
- ES6 JavaScript

## Notes

- All data is stored locally in your browser using localStorage
- Data persists even after closing the browser
- Each browser/device maintains its own separate data
- Timer notifications require browser notification permissions

