# Chrome Extension Development Plan: Targeted Web Interaction Tool

## Overview

This document outlines the development plan for a Chrome extension that allows users to select elements on web pages, annotate them, and generate JavaScript code for automated interaction. The extension will feature a side panel UI, persistent state, and leverage AI for script suggestions. It will be built upon the foundation of the `browser-use` library for DOM handling and browser control.

## Architectural Components

1.  **Content Script:**

    - Injected into web pages.
    - Handles element selection and highlighting.
    - Captures DOM (full page and selected element).
    - Communicates with the background script.

2.  **Background Script:**

    - Central controller of the extension.
    - Manages extension state (toggle, selected elements, notes).
    - Simulates a Web API to serve DOM data to the side panel.
    - Handles communication with content script and side panel.
    - Manages persistent storage (using `chrome.storage.local`).
    - Handles cookie storage and retrieval (for captcha avoidance).

3.  **Side Panel UI:**

    - User-facing interface.
    - Extension on/off toggle.
    - Summary table of pages and selected elements.
    - Note-taking for selected elements.
    - Text input for user requirements.
    - Basic AI chat box for script suggestions.

4.  **Communication Channels:**
    - Content Script <-> Background Script: Chrome Extension Message Passing API.
    - Side Panel <-> Background Script: Chrome Extension Message Passing API.
    - Background Script <-> Web API (Simulated): Function calls within the background script.

## Implementation Plan - Step-by-Step

1.  **Project Setup & Core Functionality:**

    - Create `manifest.json` (define extension structure and permissions).
    - Content Script: Implement element selection and highlighting (adapt from `browser-use`).
    - Content Script: Implement DOM capture (adapt from `browser-use`).
    - Background Script: Set up basic message passing with content script.
    - Background Script: Implement initial in-memory data storage.
    - Side Panel: Create basic UI with toggle and element info display.

2.  **Web API Simulation & Data Persistence:**

    - **Background Script (Simulated Web API):**
      - Store collected data (selected elements, DOM) in background script memory and `chrome.storage.local` for persistence.
      - Implement message listeners in background script to handle API requests for data, such as:
        - `getAction: 'getSelectedElements'`: Returns JSON of selected elements.
        - `getAction: 'getFullPageDOM'`: Returns JSON of full page DOM.
        - `getAction: 'getSelectedElementDOM'`: Returns JSON of selected element DOM.
      - Format API responses as JSON strings.
      - Simulate API endpoints using Chrome Extension message passing.
    - **Side Panel:**
      - Update UI to display summary table of pages and selected elements.
      - Implement JavaScript in side panel to fetch data from the background script's simulated "Web API" using message passing.

3.  **Side Panel Enhancements & AI Integration:**

    - Side Panel: Add note-taking functionality.
    - Side Panel: Add user requirement text input.
    - Side Panel: Implement basic AI chat box (client-side or API integration).
    - Content Script: Explore robust selector generation strategies.

4.  **Cookie Management & Authentication (Optional):**
    - Background Script: Implement cookie saving and loading using `chrome.cookies` and `chrome.storage.local`.
    - Test and verify automatic authentication handling via existing browser sessions.

## Technology Stack

- **Frontend (Side Panel & Content Script):** HTML, CSS, JavaScript
- **Chrome Extension APIs:** `chrome.runtime`, `chrome.storage`, `chrome.cookies`, `chrome.scripting`
- **DOM Manipulation & Traversal:** JavaScript (and potentially reusing parts of `browser-use`'s JavaScript DOM logic)
- **AI Chat (Optional, for later):** JavaScript (basic) or external AI API (advanced)

## Cookie and Authentication Considerations

- Chrome extensions can leverage existing browser authentication and cookies.
- Saving cookies can potentially help reduce captchas.
- Chrome Extension APIs provide access to cookies and storage for persistent state.

## Next Steps

Start with **Step 1: Project Setup & Core Functionality**, beginning with creating the `manifest.json` and basic content script for element selection.
