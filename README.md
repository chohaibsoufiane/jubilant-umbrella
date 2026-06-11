# Cinematic Printing Presentation (Offset & Flexography)

An interactive, cinematically-designed presentation on industrial printing processes, specifically focusing on **Offset** and **Flexography**. Built as an edge-to-edge desktop experience using Electron.

---

## Features

- **Electron Desktop Client**: Wrapped inside Electron for a native desktop application experience.
- **Frameless Window**: No standard OS borders or menus, presenting the content cleanly.
- **Custom Window Controls**: Integrated Minimize (`—`), Maximize/Restore (`❑`), and Close (`✕`) buttons built directly into the top-right corner of the UI.
- **Interactive Dragging**: Drag the window from any non-interactive part of the slides/background.
- **F11 Fullscreen Support**: Toggle standard fullscreen display by pressing the **F11** key.
- **Cinematic Transitions**: Seamless motion physics transitioning between complex layouts.
- **Halftone Motifs**: Brutalist layout aesthetics with micro-animations and background design elements.
- **Dual compatibility**: Can also be loaded in normal web browsers (automatically hides the Electron-specific controls).

---

## Technology Stack

- **Framework**: Electron (Main & Preload processes)
- **Frontend**: HTML5, Vanilla CSS3, Javascript (ES6)
- **Aesthetics**: Swiss-grid Brutalism with custom keyframe animations

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed.

### Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chohaibsoufiane/jubilant-umbrella.git
   cd jubilant-umbrella
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Run the application in development mode:
   ```bash
   npm run dev
   ```

---

## Presentation Controls

- **Next Slide**: `Arrow Right`, `Arrow Down`, `Spacebar`, or the bottom-left `Next` button.
- **Previous Slide**: `Arrow Left`, `Arrow Up`, or the bottom-left `Prev` button.
- **Fullscreen**: Press `F11` to toggle fullscreen mode.
- **Window Drag**: Click and drag from any neutral background area.

---

> [!NOTE]
> The final slide displays a concluding animation, which requires a local video file named `video_animation.mp4` to be placed inside the `media/` directory.
