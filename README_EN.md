# Magic Photo Frame User Guide

[中文版本](README.md)

**Magic Photo Frame** is a Web-based frontend application designed to connect with a local ComfyUI service. It transforms static photos into vivid dynamic videos and presents them immersively in an "Electronic Photo Frame" mode.

---

## 🚀 Quick Start

### 1. Preparation
*   **Start ComfyUI**: Ensure your ComfyUI is running locally.
    *   **Important**: You must allow Cross-Origin Resource Sharing (CORS) when starting. Please use the following command:
        ```bash
        python main.py --listen --port 8188 --enable-cors-header
        ```
*   **Model & Node Requirements** (for the built-in default workflow):
    *   **Required Models**:
        1.  Checkpoint: `wan2.2-i2v-rapid-aio-v10-nsfw.safetensors`
        2.  CLIP Vision: `clip_vision_h.safetensors`
    *   **Required Custom Nodes**:
        *   ComfyUI-VideoHelperSuite (VHS)
        *   ComfyUI-LayerStyle (LayerUtility)
        *   WanVideo Related Nodes (WanImageToVideo)
*   **Open Application**: Open `index.html` in your browser (it is recommended to run it using a local server, e.g., `python -m http.server`).

### 2. Connect Service
1.  Enter your address in the **"ComfyUI Service URL"** input box at the top of the page (default is `http://127.0.0.1:8188`).
2.  Click **"Check Connection"**. If the status turns green and shows "Connected", the connection is successful.

### 3. Configure Workflow
1.  **Import/Export Features**:
    *   **Import**: Click **"Import Workflow"** (Ctrl+I) to support `.json` or `.yaml` files (file size limit ≤10MB). The system will automatically identify and parse the content.
    *   **Export**: Click **"Export Workflow"** (Ctrl+E) to save the current content of the editor as a standard JSON file, with a timestamp and version number in the filename.
    *   **Manual Paste**: You can also directly paste a ComfyUI API format workflow (JSON) into the text box.
2.  **Placeholder Support**: The application automatically replaces the following content, no need to manually modify the JSON:
    *   `{{IMAGE_FILENAME}}`: The filename of the uploaded image.
    *   `{{PROMPT}}`: The prompt text.
    *   `{{VIDEO_SCALE}}`: Video resolution (longest side).
    *   `seed`: Random seed (automatically randomized).
3.  Click **"Set as Default"** to save the current workflow, which will automatically load the next time you refresh the page.

### 4. Add Images
1.  Click the **"Add Files"** button to select local images (multiple selection supported).
2.  Images will automatically undergo a crop check (3:4 ratio recommended), and you can adjust them in the pop-up cropper.
3.  **Custom Prompts**: Click the **"✎"** button on the image thumbnail to set a specific prompt for each image (e.g., "make the fire move"). If not set, the global default prompt will be used.
4.  **Save/Load List**: You can save the current image list (including prompt configurations) to a local JSON file for easy loading next time.

### 5. Generation & Result Management
*   **Manual Generation**: Click the **"Generate Magic Video"** button, and the application will process the images in the list sequentially.
*   **Result Preview**:
    *   **Card Grid**: Click on any image, and the right side (or bottom) will display all generated video results associated with that image in a 3:4 vertical grid.
    *   **Video Info**: Each card displays the resolution and duration at the bottom.
    *   **Delete Function**: Click the **"✕"** button in the top right corner of the card to delete the video.
        *   **Smart Anti-Resurrection**: Deleted videos are added to a local blocklist, so even if you click "Sync History", deleted videos will not reappear.
*   **Sync History (🔄)**:
    *   Click the **"Sync History"** button, and the system will fetch history records from the ComfyUI backend.
    *   **Auto Deduplication**: The current list is cleared before syncing to prevent duplicate data accumulation.

---

## 🖼️ Photo Frame Mode

This is the core feature of the application, turning your screen into a dynamic electronic photo frame.

### Enter Mode
Click the **"Start Photo Frame"** button to enter full-screen display.

### Core Features
1.  **Mixed Display**: The frame rotates through static photos. If a photo has a generated video, it will play the video clip with a seamless transition.
2.  **Background Auto-Generation**:
    *   While you enjoy the photos, the background silently generates new videos for images that don't have them (or haven't reached the video limit).
    *   Newly generated videos will **play immediately**, letting you see the magic effect as soon as possible.
3.  **Multi-Version Rotation**:
    *   The system supports a "One-to-Many" mode. One image can correspond to multiple different video variations.
    *   Each time the image is shown, one of the versions is randomly played to keep things fresh.

### Settings Options
In the **"Photo Frame Settings"** panel at the bottom of the page, you can adjust:
*   **Photo Duration**: The time a static image stays on screen.
*   **Video Trigger Probability**: The probability of playing a corresponding video when rotating to an image (recommended to set a lower value for surprises, or 100% for full dynamic).
*   **Max Videos Per Image**: Limit the maximum number of video variations generated per image (default is 5) to prevent unlimited storage usage.
*   **Auto Background Gen**: Toggle background generation. If off, only existing videos will play.
*   **Background Music**: Enter an audio URL to automatically loop play in photo frame mode.
*   **Default Prompts**: Configure the global default prompt library (one per line). When an image does not have a specific prompt set, the system randomly selects one from here.
    *   **Recommended Examples**:
        ```text
        make the picture move, vivid scene
        video of a vivid scene, high quality
        cinematic lighting, 4k, slow motion
        ```
*   **Show Clock**: Display the current date and time in the bottom right corner.

### Controls
*   **Exit**: Click the **"×"** button in the top right corner, or press the **`Esc`** key.
*   **Manual Switch**: Click anywhere on the screen, or press **`Space` / `→`** to switch to the next image immediately.
*   **Reset State**: Click the **"Reset Video State"** button in the settings area to clear all associated video records and force a fresh start on generation.

---

## 🛠️ FAQ

**Q: Why is there no response when clicking "Generate"?**
A: Please check: 1. Is ComfyUI connected? 2. Is the workflow JSON valid? 3. Have you added at least one image?

**Q: Why is it always a static image in Photo Frame Mode, with no video?**
A: Video generation takes time. Please wait patiently, or check the console logs to confirm if background generation is running. Once the first video is generated, it will play automatically.

**Q: I can't see previous videos after clicking an image?**
A: Please click the **"🔄 Sync History"** button, and the system will retrieve all generated video records from the backend.

**Q: What happens if I delete videos in the output directory?**
A: Playback will fail, and the program will automatically skip and clear that record. It is recommended to use the delete button within the app for management.
