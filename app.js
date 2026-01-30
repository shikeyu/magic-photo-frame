(() => {
  const els = {
    serverUrl: document.getElementById('serverUrl'),
    checkServerBtn: document.getElementById('checkServerBtn'),
    serverStatus: document.getElementById('serverStatus'),
    workflowJson: document.getElementById('workflowJson'),
    imageInput: document.getElementById('imageInput'),
    imagePreview: document.getElementById('imagePreview'),
    generateBtn: document.getElementById('generateBtn'),
    stopGenerateBtn: document.getElementById('stopGenerateBtn'),
    progress: document.getElementById('progress'),
    videoResultContainer: document.getElementById('videoResultContainer'),
    importWorkflowBtn: document.getElementById('importWorkflowBtn'),
    exportWorkflowBtn: document.getElementById('exportWorkflowBtn'),
    importWorkflowInput: document.getElementById('importWorkflowInput'),
    syncHistoryBtn: document.getElementById('syncHistoryBtn'),
    diagnoseBtn: document.getElementById('diagnoseBtn'),
    diagnostics: document.getElementById('diagnostics'),
    // Save/Load List
    saveListBtn: document.getElementById('saveListBtn'),
    loadListBtn: document.getElementById('loadListBtn'),
    loadListInput: document.getElementById('loadListInput'),
    // Workflow Actions
    setDefaultWorkflowBtn: document.getElementById('setDefaultWorkflowBtn'),
    // Photo Frame Config
    pfPhotoDuration: document.getElementById('pfPhotoDuration'),
    pfVideoProb: document.getElementById('pfVideoProb'),
    pfVideoScale: document.getElementById('pfVideoScale'),
    pfLoopCount: document.getElementById('pfLoopCount'),
    pfTransDuration: document.getElementById('pfTransDuration'),
    pfBgMusic: document.getElementById('pfBgMusic'),
    pfDefaultPrompts: document.getElementById('pfDefaultPrompts'),
    pfShowClock: document.getElementById('pfShowClock'),
    pfAutoGenerate: document.getElementById('pfAutoGenerate'),
    pfMaxVideos: document.getElementById('pfMaxVideos'),
    pfStartBtn: document.getElementById('pfStartBtn'),
    pfClearVideosBtn: document.getElementById('pfClearVideosBtn'),
    // Cropper
    cropperModal: document.getElementById('cropperModal'),
    cropperCanvas: document.getElementById('cropperCanvas'),
    cropCancelBtn: document.getElementById('cropCancelBtn'),
    cropConfirmBtn: document.getElementById('cropConfirmBtn'),
    // Prompt Editor
    promptModal: document.getElementById('promptModal'),
    promptList: document.getElementById('promptList'),
    addPromptBtn: document.getElementById('addPromptBtn'),
    promptCancelBtn: document.getElementById('promptCancelBtn'),
    promptConfirmBtn: document.getElementById('promptConfirmBtn'),
    // Photo Frame
    photoFrameContainer: document.getElementById('photoFrameContainer'),
    pfClock: document.getElementById('pfClock'),
    pfExitBtn: document.getElementById('pfExitBtn'),
    // Language
    langToggleBtn: document.getElementById('langToggleBtn'),
    triggerFileBtn: document.getElementById('triggerFileBtn'),
  };

  // 默认工作流（用户提供），用于首次加载或编辑区为空时回填
  const defaultWorkflowStr = `{
    "1": {"inputs": {"text": "", "clip": ["6", 1]}, "class_type": "CLIPTextEncode", "_meta": {"title": "CLIP文本编码器"}},
    "2": {"inputs": {"clip_name": "clip_vision_h.safetensors"}, "class_type": "CLIPVisionLoader", "_meta": {"title": "CLIP视觉加载器"}},
    "3": {"inputs": {"crop": "none", "clip_vision": ["2", 0], "image": ["15", 0]}, "class_type": "CLIPVisionEncode", "_meta": {"title": "CLIP视觉编码"}},
    "4": {"inputs": {"image": "{{IMAGE_FILENAME}}"}, "class_type": "LoadImage", "_meta": {"title": "加载图像"}},
    "5": {"inputs": {"samples": ["12", 0], "vae": ["6", 2]}, "class_type": "VAEDecode", "_meta": {"title": "VAE解码"}},
    "6": {"inputs": {"ckpt_name": "wan2.2-i2v-rapid-aio-v10-nsfw.safetensors"}, "class_type": "CheckpointLoaderSimple", "_meta": {"title": "Checkpoint加载器(简易)"}},
    "7": {"inputs": {"images": ["15", 0]}, "class_type": "PreviewImage", "_meta": {"title": "预览图像"}},
    "8": {"inputs": {"text": "{{PROMPT}}", "clip": ["6", 1]}, "class_type": "CLIPTextEncode", "_meta": {"title": "CLIP文本编码器"}},
    "9": {"inputs": {"shift": 8.000000000000002, "model": ["6", 0]}, "class_type": "ModelSamplingSD3", "_meta": {"title": "模型采样算法SD3"}},
    "10": {"inputs": {"width": ["15", 3], "height": ["15", 4], "length": 81, "batch_size": 1, "positive": ["8", 0], "negative": ["1", 0], "vae": ["6", 2], "clip_vision_output": ["3", 0], "start_image": ["15", 0]}, "class_type": "WanImageToVideo", "_meta": {"title": "图像到视频（Wan）"}},
    "11": {"inputs": {"purge_cache": true, "purge_models": true, "anything": ["12", 0]}, "class_type": "LayerUtility: PurgeVRAM", "_meta": {"title": "图层工具：清除VRAM"}},
    "12": {"inputs": {"seed": 192054346835137, "steps": 4, "cfg": 1, "sampler_name": "euler_ancestral", "scheduler": "beta", "denoise": 1, "model": ["9", 0], "positive": ["10", 0], "negative": ["10", 1], "latent_image": ["10", 2]}, "class_type": "KSampler", "_meta": {"title": "K采样器"}},
    "13": {"inputs": {"frame_rate": 18, "loop_count": 0, "filename_prefix": "AllInOne01", "format": "video/h264-mp4", "pix_fmt": "yuv420p", "crf": 19, "save_metadata": false, "trim_to_audio": false, "pingpong": false, "save_output": true, "images": ["5", 0]}, "class_type": "VHS_VideoCombine", "_meta": {"title": "合并为视频"}},
    "72": {"inputs": {"aspect_ratio": "original", "proportional_width": 1, "proportional_height": 1, "fit": "letterbox", "method": "lanczos", "round_to_multiple": "8", "scale_to_side": "shortest", "scale_to_length": "{{VIDEO_SCALE}}", "background_color": "#000000", "image": ["4", 0]}, "class_type": "LayerUtility: ImageScaleByAspectRatio V2", "_meta": {"title": "按宽高比缩放_V2"}}
  }`;

  const state = {
    baseUrl: '',
    clientId: Math.random().toString(36).slice(2),
    lastUploaded: null, // { filename, subfolder, type }
    images: [], // [{ id, file, name, url }]
    isGenerating: false, // Flag for manual generation
    lastPromptId: null,
    lastShownSig: null,
    currentExpectedPrefix: null,
    pendingOutputName: null,
    pendingOutputSubfolder: '',
    outputPollTimer: null,
    outputCheckIntervalMs: 1500,
    outputCheckTimeoutMs: 180000,
    currentExpectedOutput: null, // { filename, subfolder, type }
    ws: null,
    wsBase: '',
    wsConnected: false,
    // Photo Frame state
    photoFrame: {
      active: false,
      timer: null,
      bgTimer: null,
      bgMusicAudio: null, // Audio object
      currentIndex: -1,
      layerIndex: 1, // 1 or 2
      mode: 'photo', // 'photo' | 'video'
      config: {
        photoDuration: 5000,
        baseVideoProbability: 0.1, // Initial prob
        videoProbability: 0.1,     // Current prob
        probabilityStep: 0.05,     // Increment step
        videoScaleLength: 240,     // Video scale width (longest side)
        videoLoopCount: 2,
        transitionDuration: 1000,
        bgMusicUrl: '',
        defaultPrompts: [], // Array of strings
        showClock: true,
        autoGenerate: true,
        maxVideosPerImage: 5
      },
      currentVideoLoop: 0,
      clockInterval: null
    },
    // Cropper state
    crop: {
      active: false,
      file: null,
      resolve: null,
      reject: null,
      img: null,
      scale: 1,
      offX: 0,
      offY: 0,
      box: { x: 0, y: 0, w: 0, h: 0 },
      dragMode: null,
      lastMouse: { x: 0, y: 0 },
    },
  };

  // Init
  (function init() {
    if (typeof applyTranslations === 'function') applyTranslations();

    const savedUrl = localStorage.getItem('comfyui_base_url');
    if (savedUrl) {
      els.serverUrl.value = savedUrl;
      state.baseUrl = savedUrl;
      ensureWebSocket(savedUrl);
    } else {
      // Default to current hostname + 8188 if not saved
      // This helps when accessing via LAN IP (e.g. 192.168.x.x)
      const defaultUrl = `http://${location.hostname}:8188`;
      els.serverUrl.value = defaultUrl;
      // Don't auto-connect, let user confirm or it might be annoying if wrong
    }
    // 如果未设置默认工作流，则写入用户提供的默认；编辑区为空时回填
    try {
      const def = localStorage.getItem('default_workflow');
      if (!def) localStorage.setItem('default_workflow', defaultWorkflowStr);
      const useDef = localStorage.getItem('default_workflow');
      if (useDef && !els.workflowJson.value.trim()) {
        els.workflowJson.value = useDef;
      }
    } catch {}
    loadPhotoFrameConfig(); // Load config
    bindEvents();
    renderPreviewPlaceholder();
    updateDefaultButtonState();
  })();

  function bindEvents() {
    if (els.checkServerBtn) els.checkServerBtn.addEventListener('click', checkServer);
    if (els.serverUrl) els.serverUrl.addEventListener('input', onServerUrlChange);
    if (els.imageInput) els.imageInput.addEventListener('change', onImageSelected);
    if (els.triggerFileBtn) els.triggerFileBtn.addEventListener('click', () => els.imageInput && els.imageInput.click());
    if (els.generateBtn) els.generateBtn.addEventListener('click', onGenerate);
    
    if (els.workflowJson) {
      els.workflowJson.addEventListener('input', enableGenerateIfReady);
      els.workflowJson.addEventListener('input', updateDefaultButtonState);
    }
    
    if (els.imagePreview) els.imagePreview.addEventListener('click', onPreviewClick);
    
    // Import/Export
    if (els.importWorkflowBtn) els.importWorkflowBtn.addEventListener('click', () => els.importWorkflowInput && els.importWorkflowInput.click());
    if (els.importWorkflowInput) els.importWorkflowInput.addEventListener('change', onImportWorkflowFile);
    if (els.exportWorkflowBtn) els.exportWorkflowBtn.addEventListener('click', onExportWorkflow);
    
    // Shortcuts for Import/Export
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
            e.preventDefault();
            els.importWorkflowInput && els.importWorkflowInput.click();
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
            e.preventDefault();
            onExportWorkflow();
        }
    });

    if (els.diagnoseBtn) els.diagnoseBtn.addEventListener('click', diagnoseServer);
    
    if (els.syncHistoryBtn) {
        els.syncHistoryBtn.addEventListener('click', async () => {
             const btn = els.syncHistoryBtn;
             const originalContent = btn.innerHTML; // Store original content (icon + text)
             btn.disabled = true;
             btn.textContent = t('btn_syncing');
             try {
                 // Pass true to clear existing data before syncing
                 const count = await syncVideosFromHistory(true);
                 showToast(t('msg_sync_success', {n: count}), 'success');
                 
                 // Refresh current view if an image is selected
                 const selected = document.querySelector('.thumb.selected');
                 if (selected) {
                     const id = selected.querySelector('.action-btn')?.dataset.id;
                     const img = state.images.find(x => x.id === id);
                     if (img) renderVideoList(img);
                 }
             } catch (e) {
                 console.error(e);
                 showToast(t('msg_sync_failed'), 'error');
             } finally {
                 btn.disabled = false;
                 btn.innerHTML = originalContent;
             }
         });
    }
    
    // Save/Load List
    if (els.saveListBtn) els.saveListBtn.addEventListener('click', onSaveList);
    if (els.loadListBtn) els.loadListBtn.addEventListener('click', () => els.loadListInput && els.loadListInput.click());
    if (els.loadListInput) els.loadListInput.addEventListener('change', onLoadListFile);
    if (els.setDefaultWorkflowBtn) els.setDefaultWorkflowBtn.addEventListener('click', onSetDefaultWorkflow);

    if (els.pfExitBtn) els.pfExitBtn.addEventListener('click', stopPhotoFrame);

    // Photo Frame Config
    const configInputs = [els.pfPhotoDuration, els.pfVideoProb, els.pfVideoScale, els.pfLoopCount, els.pfTransDuration, els.pfBgMusic, els.pfDefaultPrompts];
    configInputs.forEach(input => {
        if (input) input.addEventListener('change', savePhotoFrameConfig);
    });
    if (els.pfStartBtn) els.pfStartBtn.addEventListener('click', startPhotoFrame);
    if (els.pfAutoGenerate) els.pfAutoGenerate.addEventListener('change', savePhotoFrameConfig);
    if (els.pfMaxVideos) els.pfMaxVideos.addEventListener('change', savePhotoFrameConfig);
    if (els.pfClearVideosBtn) els.pfClearVideosBtn.addEventListener('click', clearAllVideosState);

    // Cropper
    if (els.cropCancelBtn) els.cropCancelBtn.addEventListener('click', onCropCancel);
    if (els.cropConfirmBtn) els.cropConfirmBtn.addEventListener('click', onCropConfirm);
    initCropperEvents();

    // Prompt Editor
    if (els.addPromptBtn) els.addPromptBtn.addEventListener('click', () => addPromptInput(''));
    if (els.promptCancelBtn) els.promptCancelBtn.addEventListener('click', closePromptModal);
    if (els.promptConfirmBtn) els.promptConfirmBtn.addEventListener('click', savePromptModal);

    // Language Toggle
    if (els.langToggleBtn) {
        els.langToggleBtn.addEventListener('click', () => {
            setLanguage(currentLang === 'zh' ? 'en' : 'zh');
        });
    }

    // Listen for ESC to exit photo frame
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.photoFrame.active) stopPhotoFrame();
        // Also close modals if open
        if (!els.promptModal.classList.contains('hidden')) closePromptModal();
      }
    });
  }

  // --- Prompt Editor Logic ---
  let editingImageId = null;

  function openPromptModal(imgId) {
    const img = state.images.find(x => x.id === imgId);
    if (!img) return;
    editingImageId = imgId;
    
    // Populate list
    els.promptList.innerHTML = '';
    const prompts = img.prompts || [];
    if (prompts.length === 0) {
        // Maybe add one empty? No, keep empty to show it's using default
    } else {
        prompts.forEach(p => addPromptInput(p));
    }
    
    els.promptModal.classList.remove('hidden');
  }

  function addPromptInput(value = '') {
    const row = document.createElement('div');
    row.className = 'prompt-row';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = t('ph_prompt_input');
    
    // Up button
    const upBtn = document.createElement('button');
    upBtn.textContent = '↑';
    upBtn.onclick = () => {
        const prev = row.previousElementSibling;
        if (prev) els.promptList.insertBefore(row, prev);
    };

    // Down button
    const downBtn = document.createElement('button');
    downBtn.textContent = '↓';
    downBtn.onclick = () => {
        const next = row.nextElementSibling;
        if (next) els.promptList.insertBefore(next, row);
    };

    // Del button
    const delBtn = document.createElement('button');
    delBtn.className = 'del';
    delBtn.textContent = '×';
    delBtn.onclick = () => row.remove();

    row.appendChild(input);
    row.appendChild(upBtn);
    row.appendChild(downBtn);
    row.appendChild(delBtn);
    
    els.promptList.appendChild(row);
    input.focus();
  }

  function closePromptModal() {
    els.promptModal.classList.add('hidden');
    editingImageId = null;
  }

  function savePromptModal() {
    if (!editingImageId) return;
    const img = state.images.find(x => x.id === editingImageId);
    if (img) {
        const inputs = els.promptList.querySelectorAll('input');
        const newPrompts = [];
        inputs.forEach(inp => {
            const val = inp.value.trim();
            if (val) newPrompts.push(val);
        });
        img.prompts = newPrompts;
        console.log('Saved prompts for', img.name, newPrompts);
    }
    closePromptModal();
  }

  function onStopGenerate() {
    if (!state.isGenerating) return;
    state.isGenerating = false;
    if (els.stopGenerateBtn) {
        els.stopGenerateBtn.textContent = t('btn_stopping');
        els.stopGenerateBtn.disabled = true;
    }
  }

  // --- Photo Frame Mode ---

  // Interaction: Click or ArrowRight to skip to next
  function initPhotoFrameInteraction() {
      // Click on container to next
      els.photoFrameContainer.addEventListener('click', (e) => {
          if (e.target === els.pfExitBtn) return; // Ignore exit button
          if (!state.photoFrame.active) return;
          console.log('[PhotoFrame] Manual skip (click)');
          pickNextPhoto();
      });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
          if (!state.photoFrame.active) return;
          if (e.key === 'ArrowRight' || e.key === ' ') { // Right or Space to next
              console.log('[PhotoFrame] Manual skip (key)');
              pickNextPhoto();
          }
      });
  }
  initPhotoFrameInteraction();

  function loadPhotoFrameConfig() {
      try {
          const raw = localStorage.getItem('pf_config');
          if (raw) {
              const cfg = JSON.parse(raw);
              Object.assign(state.photoFrame.config, cfg);
          }
          // Update UI from state (whether loaded or default)
          if (els.pfPhotoDuration) els.pfPhotoDuration.value = state.photoFrame.config.photoDuration / 1000;
          if (els.pfVideoProb) els.pfVideoProb.value = (state.photoFrame.config.baseVideoProbability * 100).toFixed(0);
          if (els.pfVideoScale) els.pfVideoScale.value = state.photoFrame.config.videoScaleLength || 240;
          if (els.pfLoopCount) els.pfLoopCount.value = state.photoFrame.config.videoLoopCount;
          if (els.pfTransDuration) els.pfTransDuration.value = state.photoFrame.config.transitionDuration;
          if (els.pfBgMusic) els.pfBgMusic.value = state.photoFrame.config.bgMusicUrl || '';
          if (els.pfDefaultPrompts) els.pfDefaultPrompts.value = (state.photoFrame.config.defaultPrompts || []).join('\n');
          if (els.pfShowClock) els.pfShowClock.checked = state.photoFrame.config.showClock !== false; // Default true
          if (els.pfAutoGenerate) els.pfAutoGenerate.checked = state.photoFrame.config.autoGenerate !== false; // Default true
          if (els.pfMaxVideos) els.pfMaxVideos.value = state.photoFrame.config.maxVideosPerImage ?? 5;
      } catch (e) { console.warn('Load PF config failed', e); }
  }

  function savePhotoFrameConfig() {
      const photoDurSec = parseInt(els.pfPhotoDuration.value, 10) || 5;
      const vidProbPct = parseInt(els.pfVideoProb.value, 10) || 10;
      let vidScale = parseInt(els.pfVideoScale.value, 10) || 240;
      if (vidScale < 240) vidScale = 240;
      if (vidScale > 1024) vidScale = 1024;
      const loopCount = parseInt(els.pfLoopCount.value, 10) || 2;
      const transDur = parseInt(els.pfTransDuration.value, 10) || 1000;
      const bgMusic = els.pfBgMusic.value.trim();
      const defPrompts = els.pfDefaultPrompts.value.trim().split('\n').map(s => s.trim()).filter(Boolean);
      const showClock = els.pfShowClock.checked;
      const autoGen = els.pfAutoGenerate ? els.pfAutoGenerate.checked : true;
      const maxVideos = parseInt(els.pfMaxVideos.value, 10); // can be 0 or NaN (fallback)

      state.photoFrame.config.photoDuration = photoDurSec * 1000;
      state.photoFrame.config.baseVideoProbability = vidProbPct / 100;
      // Reset current probability to base when config changes
      state.photoFrame.config.videoProbability = vidProbPct / 100; 
      state.photoFrame.config.videoScaleLength = vidScale;
      state.photoFrame.config.videoLoopCount = loopCount;
      state.photoFrame.config.transitionDuration = transDur;
      state.photoFrame.config.bgMusicUrl = bgMusic;
      state.photoFrame.config.defaultPrompts = defPrompts;
      state.photoFrame.config.showClock = showClock;
      state.photoFrame.config.autoGenerate = autoGen;
      state.photoFrame.config.maxVideosPerImage = isNaN(maxVideos) ? 5 : maxVideos;

      try {
          localStorage.setItem('pf_config', JSON.stringify(state.photoFrame.config));
      } catch (e) { console.warn('Save PF config failed', e); }
      
      if (state.photoFrame.active) {
          updateBgMusic();
          updateClockVisibility();
          // 如果正在运行且开启了自动生成，确保生成循环启动；如果关闭，生成循环会在下一次 check 时停止
          if (autoGen) startBackgroundGeneration();
      }
  }

  function clearAllVideosState() {
      if (!confirm(t('msg_confirm_clear_videos'))) return;
      
      const blocklist = getDeletedBlocklist();
      let count = 0;
      let blockedCount = 0;

      for (const img of state.images) {
          const videos = img.videoUrls || [];
          if (img.videoUrl && !videos.includes(img.videoUrl)) videos.push(img.videoUrl);
          
          if (videos.length > 0) {
              for (const url of videos) {
                  try {
                      const u = new URL(url, location.href);
                      const filename = u.searchParams.get('filename');
                      if (filename && !blocklist.includes(filename)) {
                          blocklist.push(filename);
                          blockedCount++;
                      }
                  } catch (e) { console.warn('Parse video url failed', url); }
              }

              img.videoUrl = null;
              img.videoUrls = [];
              count++;
          }
      }
      
      // Save updated blocklist (Keep max 2000 items to prevent overflow)
      if (blockedCount > 0) {
          while (blocklist.length > 2000) blocklist.shift();
          localStorage.setItem('pf_deleted_videos', JSON.stringify(blocklist));
      }
      
      // Also clear cache
      try {
          localStorage.removeItem('pf_video_map');
      } catch {}

      alert(t('msg_reset_success', {n: count}));
  }

  function updateBgMusic() {
      const url = state.photoFrame.config.bgMusicUrl;
      if (!url) {
          if (state.photoFrame.bgMusicAudio) {
              state.photoFrame.bgMusicAudio.pause();
              state.photoFrame.bgMusicAudio = null;
          }
          return;
      }

      if (!state.photoFrame.bgMusicAudio) {
          state.photoFrame.bgMusicAudio = new Audio(url);
          state.photoFrame.bgMusicAudio.loop = true;
          state.photoFrame.bgMusicAudio.play().catch(e => console.warn('BgMusic play fail', e));
      } else {
          if (state.photoFrame.bgMusicAudio.src !== url && state.photoFrame.bgMusicAudio.src !== new URL(url, location.href).href) {
              state.photoFrame.bgMusicAudio.src = url;
              state.photoFrame.bgMusicAudio.play().catch(e => console.warn('BgMusic play fail', e));
          } else {
              // Ensure playing
              if (state.photoFrame.bgMusicAudio.paused) {
                  state.photoFrame.bgMusicAudio.play().catch(e => console.warn('BgMusic play fail', e));
              }
          }
      }
  }

  function togglePhotoFrame() {
    if (state.photoFrame.active) {
      stopPhotoFrame();
    } else {
      startPhotoFrame();
    }
  }

  function startPhotoFrame() {
    if (state.images.length === 0) {
      alert(t('msg_alert_add_image'));
      return;
    }

    state.photoFrame.active = true;
    state.photoFrame.currentIndex = -1;
    els.photoFrameContainer.classList.remove('hidden');
    document.body.classList.add('no-scroll');

    // Enter fullscreen
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }

    // Start slideshow
    state.photoFrame.mode = 'photo';
    runPhotoFrameLoop();

    // Sync history to find existing videos
    syncVideosFromHistory();

    // Start background generation
    startBackgroundGeneration();
    
    // Start Music
    updateBgMusic();
    
    // Clock
    updateClockVisibility();
    startClock();
  }

  function syncVideosFromHistory(clearFirst = false) {
    return new Promise((resolve, reject) => {
        const base = getBase();
        if (!base) {
            resolve(0);
            return;
        }

        console.log('[PhotoFrame] Syncing videos from history...', { clearFirst });
        fetch(base + '/history')
        .then(r => r.ok ? r.json() : Promise.reject('HTTP ' + r.status))
        .then(hist => {
            // If requested, clear existing video data first
            if (clearFirst) {
                console.log('[PhotoFrame] Clearing existing video data before sync');
                for (const img of state.images) {
                    img.videoUrls = [];
                    img.videoUrl = null;
                }
                // Also clear cache if we are doing a full reset sync? 
                // Maybe not cache, as cache is useful for reloads. 
                // But in-memory state is cleared.
            }

            const videos = collectVideosFromHistory(hist);
            if (!videos.length) {
                resolve(0);
                return;
            }

            // Filter out deleted videos
            const blocklist = getDeletedBlocklist();
            const validVideos = videos.filter(v => !blocklist.includes(v.filename));
            
            if (!validVideos.length) {
                resolve(0);
                return;
            }

            let matchedCount = 0;
            // Iterate all images and try to find matching videos
            for (const img of state.images) {
                // Initialize videoUrls array if not exists
                if (!Array.isArray(img.videoUrls)) img.videoUrls = [];
                
                // If migrating from old single url, push it (Only if not cleared)
                if (!clearFirst && img.videoUrl && !img.videoUrls.includes(img.videoUrl)) {
                    img.videoUrls.push(img.videoUrl);
                }

                const prefix = derivePrefixFromImageName(img.name);
                // Search for ALL videos with this prefix
                
                const matches = validVideos.filter(v => 
                    v.filename && (v.filename.startsWith('magicpf/' + prefix) || v.filename.startsWith(prefix))
                );

                if (matches.length > 0) {
                    let newFound = 0;
                    matches.forEach(m => {
                        const url = buildViewUrl(base, m);
                        if (!img.videoUrls.some(u => u.includes(m.filename))) {
                            img.videoUrls.push(url);
                            newFound++;
                        }
                    });
                    
                    if (newFound > 0) {
                        matchedCount += newFound;
                        // Update legacy field for compatibility (use latest)
                        img.videoUrl = img.videoUrls[img.videoUrls.length - 1];
                        console.log(`[PhotoFrame] Synced ${newFound} videos for ${img.name}`);
                    }
                }
            }
            console.log(`[PhotoFrame] Sync complete. Found ${matchedCount} new video instances.`);
            resolve(matchedCount);
        })
        .catch(e => {
            console.warn('[PhotoFrame] Sync history failed', e);
            reject(e);
        });
    });
  }

  function stopPhotoFrame() {
    state.photoFrame.active = false;
    els.photoFrameContainer.classList.add('hidden');
    document.body.classList.remove('no-scroll');
    
    // Clear timers
    if (state.photoFrame.timer) clearTimeout(state.photoFrame.timer);
    if (state.photoFrame.bgTimer) clearTimeout(state.photoFrame.bgTimer);
    if (state.photoFrame.clockInterval) clearInterval(state.photoFrame.clockInterval);
    
    // Stop Music
    if (state.photoFrame.bgMusicAudio) {
        state.photoFrame.bgMusicAudio.pause();
        state.photoFrame.bgMusicAudio = null;
    }

    // Stop videos
    const layer1 = document.getElementById('pfLayer1');
    const layer2 = document.getElementById('pfLayer2');
    layer1.innerHTML = '';
    layer2.innerHTML = '';

    // Exit fullscreen
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  function updateClockVisibility() {
      if (state.photoFrame.config.showClock) {
          els.pfClock.classList.remove('hidden');
          updateClock();
      } else {
          els.pfClock.classList.add('hidden');
      }
  }

  function startClock() {
      if (state.photoFrame.clockInterval) clearInterval(state.photoFrame.clockInterval);
      updateClock();
      state.photoFrame.clockInterval = setInterval(updateClock, 1000);
  }

  function updateClock() {
      if (!els.pfClock || els.pfClock.classList.contains('hidden')) return;
      const now = new Date();
      const timeEl = els.pfClock.querySelector('.time');
      const dateEl = els.pfClock.querySelector('.date');
      
      const pad = n => n < 10 ? '0' + n : n;
      timeEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      
      const days = [t('day_0'), t('day_1'), t('day_2'), t('day_3'), t('day_4'), t('day_5'), t('day_6')];
      dateEl.textContent = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${days[now.getDay()]}`;
  }

  function runPhotoFrameLoop() {
    if (!state.photoFrame.active) return;

    if (state.photoFrame.mode === 'photo') {
        pickNextPhoto();
    }
    // 'video' mode is driven by video events, so we don't call this loop manually
  }

  function pickNextPhoto() {
    // Ensure no pending timer from previous steps or race conditions
    if (state.photoFrame.timer) clearTimeout(state.photoFrame.timer);

    const total = state.images.length;
    if (total === 0) return;

    let nextIndex = -1;

    // 1. 优先检查是否有刚生成好视频需要强制播放的图片
    const forceIdx = state.images.findIndex(img => img.forcePlayVideo);
    let isForced = false;
    if (forceIdx !== -1) {
        nextIndex = forceIdx;
        isForced = true;
        // Immediately clear the flag to prevent it from sticking if timer is cancelled (e.g. manual skip)
        state.images[forceIdx].forcePlayVideo = false;
        console.log('[PhotoFrame] Picking newly generated video item:', nextIndex);
    } 
    // 2. 否则，尝试提高“有视频图片”的选中概率 (70% 概率优先从有视频的集合中选)
    else {
        const withVideoIndices = state.images.map((img, i) => ((img.videoUrls && img.videoUrls.length > 0) || img.videoUrl) ? i : -1).filter(i => i !== -1);
        
        // 只有当存在有视频的图片，且随机数命中 70% 概率，且不仅仅只有当前这一张（避免死循环重复）时
        if (withVideoIndices.length > 0 && Math.random() < 0.7) {
             // 尝试选一个非当前的
             const candidates = withVideoIndices.filter(i => i !== state.photoFrame.currentIndex);
             if (candidates.length > 0) {
                 nextIndex = candidates[Math.floor(Math.random() * candidates.length)];
             } else if (withVideoIndices.length > 0) {
                 // 只有一张有视频，且就是当前这张，那就还是选它吧（如果允许重复），或者回退到随机
                 // 这里选择：如果只有一张且是当前张，为了体验视频，允许重复选中
                 nextIndex = withVideoIndices[0];
             }
        }
    }

    // 3. 兜底：如果上面都没选中，或者没命中概率，则完全随机
    if (nextIndex === -1) {
        if (total === 1) {
            nextIndex = 0;
        } else {
            // Try to pick different from current
            let attempts = 0;
            do {
                nextIndex = Math.floor(Math.random() * total);
                attempts++;
            } while (nextIndex === state.photoFrame.currentIndex && attempts < 5);
        }
    }

    state.photoFrame.currentIndex = nextIndex;
    const item = state.images[nextIndex];

    transitionToContent(item, 'photo');
    
    // Increase probability for next time (still useful for the random fallback path)
    state.photoFrame.config.videoProbability = Math.min(1.0, state.photoFrame.config.videoProbability + state.photoFrame.config.probabilityStep);
    // console.log('[PhotoFrame] Video Probability:', state.photoFrame.config.videoProbability.toFixed(2));

    // Schedule next step
    state.photoFrame.timer = setTimeout(() => {
        if (!state.photoFrame.active) return;
        
        if (isForced) {
            console.log('[PhotoFrame] Force playing video for:', item.name);
        }

        // Check if has video (support array or single)
        const hasVideo = (item.videoUrls && item.videoUrls.length > 0) || item.videoUrl;

        // Decide if we should switch to video
        // Condition: item has video AND (force is true OR random < probability)
        if (hasVideo && (isForced || Math.random() < state.photoFrame.config.videoProbability)) {
            // Reset probability
            state.photoFrame.config.videoProbability = state.photoFrame.config.baseVideoProbability;
            
            state.photoFrame.mode = 'video';
            state.photoFrame.currentVideoLoop = 0;
            transitionToContent(item, 'video');
        } else {
            // Stay in photo mode, pick next
            state.photoFrame.mode = 'photo';
            runPhotoFrameLoop();
        }
    }, state.photoFrame.config.photoDuration);
  }

  function transitionToContent(item, type) {
    if (!state.photoFrame.active) return;

    // Determine target layer
    const nextLayerIndex = state.photoFrame.layerIndex === 1 ? 2 : 1;
    const currentLayer = document.getElementById('pfLayer' + state.photoFrame.layerIndex);
    const nextLayer = document.getElementById('pfLayer' + nextLayerIndex);

    state.photoFrame.layerIndex = nextLayerIndex; // Update for next time

    // Prepare content
    let contentEl;
    // Check if item has any videos (using new videoUrls array or fallback to legacy)
    const hasVideo = (item.videoUrls && item.videoUrls.length > 0) || item.videoUrl;

    if (type === 'video' && hasVideo) {
        contentEl = document.createElement('video');
        
        // Pick a video: random from list
        let src = item.videoUrl;
        if (item.videoUrls && item.videoUrls.length > 0) {
            src = item.videoUrls[Math.floor(Math.random() * item.videoUrls.length)];
            console.log(`[PhotoFrame] Playing 1 of ${item.videoUrls.length} videos for ${item.name}:`, src);
        }

        contentEl.src = src;
        contentEl.autoplay = true; // We play manually below but attribute helps
        contentEl.muted = false; 
        contentEl.loop = false; // Manual looping
        contentEl.playsInline = true;
        
        let errorHandled = false;
        const handleError = (source, e) => {
            if (errorHandled) return;
            errorHandled = true;
            console.warn(`[PhotoFrame] Video ${source} fail, skipping:`, e);
            
            // If video fails (e.g. 404 deleted), clear it so it can be regenerated
            if (item.videoUrl) {
                console.log('[PhotoFrame] Clearing invalid videoUrl for', item.name);
                item.videoUrl = null;
                // Also remove from cache
                try {
                    const key = 'pf_video_map';
                    const raw = localStorage.getItem(key) || '{}';
                    const map = JSON.parse(raw);
                    if (map[item.name]) {
                        delete map[item.name];
                        localStorage.setItem(key, JSON.stringify(map));
                    }
                } catch {}
            }

            // Fallback to photo mode immediately
            state.photoFrame.mode = 'photo';
            runPhotoFrameLoop();
        };

        // Listen for end to handle loops or exit
        contentEl.addEventListener('ended', onVideoEnded);
        contentEl.addEventListener('error', (e) => handleError('event', e));
        
        // Ensure it plays
        contentEl.play().catch(e => handleError('play', e));
    } else {
        // Photo
        contentEl = document.createElement('img');
        contentEl.onload = () => {
             // Optional: ensure transition starts only after load? 
             // Currently we append immediately so browser handles it.
        };
        contentEl.onerror = () => {
            console.warn('[PhotoFrame] Image load fail, skipping');
            // If image fails, maybe try next one immediately?
            // But we already started transition. 
            // Let's just let it be blank or schedule next faster?
            if (state.photoFrame.timer) clearTimeout(state.photoFrame.timer);
            state.photoFrame.timer = setTimeout(() => {
                runPhotoFrameLoop();
            }, 1000); // Retry faster
        };
        contentEl.src = item.url;
    }

    nextLayer.innerHTML = '';
    nextLayer.appendChild(contentEl);

    // Apply Transition
    // Use 'fade' (simple) for video, random for photos
    if (type === 'video') {
        applyRandomTransition(currentLayer, nextLayer, 'fade');
    } else {
        applyRandomTransition(currentLayer, nextLayer);
    }
  }

  function applyRandomTransition(curr, next, forcedEffect = null) {
    // Reset any previous transition classes
    curr.className = 'pf-layer';
    next.className = 'pf-layer';
    curr.style.opacity = ''; next.style.opacity = '';
    curr.style.transform = ''; next.style.transform = '';
    curr.style.zIndex = ''; next.style.zIndex = ''; // Reset z-index

    // List of effects
    const effects = [
        'fade', 
        'zoom', 
        'slide-left', 'slide-right', 'slide-up', 'slide-down',
        'flip',
        'blinds' // Simluated via mask if possible, or fallback
    ];
    const effect = forcedEffect || effects[Math.floor(Math.random() * effects.length)];
    // const effect = 'flip'; // Debug

    console.log('[PhotoFrame] Transition:', effect);

    if (effect === 'fade') {
        // Default crossfade
        next.style.opacity = '0';
        curr.style.opacity = '1';
        void next.offsetWidth;
        next.style.opacity = '1';
        curr.style.opacity = '0';
    } 
    else if (effect === 'zoom') {
        // Zoom In next, Zoom Out current
        next.classList.add('fx-zoom-start');
        void next.offsetWidth;
        next.classList.remove('fx-zoom-start');
        next.classList.add('fx-zoom-in');
        curr.classList.add('fx-zoom-out');
    }
    else if (effect === 'slide-left') {
        // New slides in from right, old slides out to left
        next.classList.add('fx-slide-start-right');
        void next.offsetWidth;
        next.classList.remove('fx-slide-start-right');
        next.classList.add('fx-slide-in-right');
        curr.classList.add('fx-slide-out-left');
    }
    else if (effect === 'slide-right') {
        // New slides in from left, old slides out to right
        next.classList.add('fx-slide-start-left');
        void next.offsetWidth;
        next.classList.remove('fx-slide-start-left');
        next.classList.add('fx-slide-in-left');
        curr.classList.add('fx-slide-out-right');
    }
    else if (effect === 'slide-up') {
        // New slides in from bottom, old slides out to top
        next.classList.add('fx-slide-start-down');
        void next.offsetWidth;
        next.classList.remove('fx-slide-start-down');
        next.classList.add('fx-slide-in-down');
        curr.classList.add('fx-slide-out-up');
    }
    else if (effect === 'slide-down') {
        // New slides in from top, old slides out to bottom
        next.classList.add('fx-slide-start-up');
        void next.offsetWidth;
        next.classList.remove('fx-slide-start-up');
        next.classList.add('fx-slide-in-up');
        curr.classList.add('fx-slide-out-down');
    }
    else if (effect === 'flip') {
        // 3D Flip
        next.classList.add('fx-flip-start');
        void next.offsetWidth;
        next.classList.remove('fx-flip-start');
        next.classList.add('fx-flip-in');
        curr.classList.add('fx-flip-out');
    }
    else if (effect === 'blinds') {
        // Simulated blinds (actually wipe stripes)
        next.classList.add('fx-blinds-start');
        void next.offsetWidth;
        next.classList.remove('fx-blinds-start');
        next.classList.add('fx-blinds-in');
        // Current layer stays behind until covered? 
        // Or we fade it out?
        // Since mask makes next layer transparent initially, we see current layer behind.
        // But current layer is absolute positioned under? 
        // Check z-index or DOM order. nextLayer is appended later? No, we swap layer1/2.
        // We need to ensure nextLayer is on top.
        next.style.zIndex = 10;
        curr.style.zIndex = 1;
        // After transition we should reset zIndex or hide current
        setTimeout(() => {
             curr.style.opacity = 0; // Hide after
        }, 1000);
    }
  }

  function onVideoEnded(e) {
      if (!state.photoFrame.active) return;
      state.photoFrame.currentVideoLoop++;
      
      if (state.photoFrame.currentVideoLoop < state.photoFrame.config.videoLoopCount) {
          // Replay
          e.target.play().catch(() => {});
      } else {
          // Finished loops, back to photo mode
          state.photoFrame.mode = 'photo';
          runPhotoFrameLoop();
      }
  }

  function startBackgroundGeneration() {
    if (!state.photoFrame.active) return;
    
    // Check config flag
    if (state.photoFrame.config.autoGenerate === false) {
        console.log('[PhotoFrame] Background generation disabled by config');
        return;
    }

    // Prevent double scheduling
    if (state.photoFrame.bgTimer) {
        // Already running/scheduled
        return;
    }

    console.log('[PhotoFrame] Starting background generation loop...');
    
    // Simple scheduler loop
    const scheduleNext = () => {
      if (!state.photoFrame.active) return;
      // Clear ref before setting new one to avoid leak logic (though not strict)
      state.photoFrame.bgTimer = setTimeout(bgGenStep, 3000);
    };

    const bgGenStep = async () => {
      if (!state.photoFrame.active) return;
      state.photoFrame.bgTimer = null; // Reset timer ref since it fired

      // Check config again
      if (state.photoFrame.config.autoGenerate === false) {
          return; // Stop loop
      }

      // If main thread is busy generating (e.g. user clicked generate), skip
      if (els.generateBtn.disabled) {
        console.log('[PhotoFrame] BG Gen: Main thread busy, skipping');
        scheduleNext();
        return;
      }

      const base = getBase();
      if (!base) { scheduleNext(); return; }

      const workflowText = els.workflowJson.value.trim();
      if (!workflowText) { 
          console.log('[PhotoFrame] BG Gen: No workflow, skipping');
          scheduleNext(); return; 
      }

      // Find candidate
      // Default: find one that hasn't reached max video limit
      
      let candidates = [];
      const maxV = state.photoFrame.config.maxVideosPerImage || 0;

      // Always behave like ForceRegenerate is ON, but respect max limit
      if (maxV > 0) {
          candidates = state.images.filter(img => {
              const count = (img.videoUrls ? img.videoUrls.length : 0) + (img.videoUrl && (!img.videoUrls || !img.videoUrls.includes(img.videoUrl)) ? 1 : 0);
              return count < maxV;
          });
          console.log(`[PhotoFrame] BG Gen: Checking limits (Max ${maxV}). Candidates ${candidates.length} / ${state.images.length}`);
      } else {
          // If max is 0 (unlimited), all images are candidates
          candidates = state.images;
          console.log(`[PhotoFrame] BG Gen: Unlimited mode. All ${candidates.length} images are candidates.`);
      }

      if (candidates.length === 0) {
        // Nothing to do
        scheduleNext();
        return; 
      }
      
      const item = candidates[Math.floor(Math.random() * candidates.length)];
      
      try {
        // Step 1: Check cache (Skip check, always generate if candidate selected)
        // Step 2: Check history (Skip check, always generate if candidate selected)
        
        console.log('[PhotoFrame] Background generating for:', item.name);
        
        // Mark main thread as busy to prevent user interaction conflict?
        // Ideally we should independent, but sharing 'state.isGenerating' might conflict.
        // runSingleGenerationSilent handles its own logic.
        
        await runSingleGenerationSilent(base, workflowText, item);
        
      } catch (err) {
        console.error('[PhotoFrame] Background Gen Error:', err);
      }
      
      scheduleNext();
    };

    // Kick off
    scheduleNext();
  }

  async function runSingleGenerationSilent(base, workflowText, item) {
    // Similar to onGenerate loop but for one item
    // 1. Upload
    const uploadInfo = await uploadImage(base, item.file);
    
    // 2. Prepare
    // We need a unique filename to avoid conflict with manual generation if possible, 
    // or just use same pattern. Let's use timestamp to be safe.
    const outName = 'PF_' + Date.now() + '_' + Math.floor(Math.random()*1000);
    
    // prepareWorkflow modifies the object. 
    // We need to NOT modify global state.pendingOutput* if possible, 
    // but prepareWorkflow uses state.pendingOutputSubfolder.
    // Let's set it temporarily.
    const prevSub = state.pendingOutputSubfolder;
    const prevName = state.pendingOutputName;
    
    state.pendingOutputSubfolder = 'magicpf/auto';
    state.pendingOutputName = outName;
    
    const promptObj = prepareWorkflow(workflowText, uploadInfo, item);
    
    // Restore state (though async race condition might exist if user clicks generate now. 
    // But we checked !els.generateBtn.disabled before starting).
    state.pendingOutputSubfolder = prevSub;
    state.pendingOutputName = prevName;

    // 3. Submit
    const promptId = await submitPrompt(base, promptObj, state.clientId);
    
    // 4. Poll
    // We can't use the main pollHistoryForVideo because it updates global UI progress?
    // pollHistoryForVideo uses setProgress? No, onGenerate uses setProgress. 
    // pollHistoryForVideo calls console.log.
    // However, pollHistoryForVideo calls fetch with `?t=`.
    // We can reuse it.
    
    const result = await pollHistoryForVideo(base, promptId, { silent: true });
    
    if (result) {
       const videoUrl = buildViewUrl(base, result);
       // Save to item
       if (!Array.isArray(item.videoUrls)) item.videoUrls = [];
       if (!item.videoUrls.includes(videoUrl)) item.videoUrls.push(videoUrl);
       item.videoUrl = videoUrl; // Update legacy field to latest
       
       item.forcePlayVideo = true; // 标记为优先播放
       saveVideoInfoToCache(item.name, result);
       console.log('[PhotoFrame] Video generated for', item.name, videoUrl);
    }
  }
  
  function saveVideoInfoToCache(imageName, videoInfo) {
    try {
      const key = 'pf_video_map';
      const raw = localStorage.getItem(key) || '{}';
      const map = JSON.parse(raw);
      map[imageName] = { 
        filename: videoInfo.filename, 
        subfolder: videoInfo.subfolder, 
        type: videoInfo.type, 
        ts: Date.now() 
      };
      localStorage.setItem(key, JSON.stringify(map));
    } catch (e) { console.warn('Save video cache failed', e); }
  }

  function loadVideoInfoFromCache(imageName) {
    try {
      const key = 'pf_video_map';
      const raw = localStorage.getItem(key) || '{}';
      const map = JSON.parse(raw);
      return map[imageName] || null;
    } catch { return null; }
  }

  function onServerUrlChange(e) {
    const v = e.target.value.trim();
    state.baseUrl = v;
    localStorage.setItem('comfyui_base_url', v);
    els.serverStatus.textContent = t('status_unchecked');
    enableGenerateIfReady();
    ensureWebSocket(v);
  }

  // --- Import / Export Workflow ---

  function onImportWorkflowFile(e) {
      const file = e.target.files[0];
      if (!file) return;

      // Clear value so same file can be selected again
      e.target.value = '';

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert(t('msg_import_size_limit'));
          return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
          const content = ev.target.result;
          try {
              let obj;
              if (file.name.toLowerCase().endsWith('.yaml') || file.name.toLowerCase().endsWith('.yml')) {
                  // Try parsing YAML
                  if (typeof jsyaml !== 'undefined') {
                      obj = jsyaml.load(content);
                  } else {
                      throw new Error(t('msg_import_yaml_error'));
                  }
              } else {
                  // Assume JSON
                  obj = JSON.parse(content);
              }

              // Validate: check if it looks like a workflow (keys are node IDs or similar structure)
              // ComfyUI workflow usually is Object where keys are node IDs (integers as strings)
              // OR it might be the "API format" (object with numbered keys)
              // OR the "Saved format" (has "nodes", "links", etc.)
              // We support API format primarily as that's what we use in textarea.
              
              // Simple check: is object?
              if (!obj || typeof obj !== 'object') throw new Error(t('msg_import_invalid'));

              // If it's the "Saved format" (UI format), we might need to warn user or convert?
              // The textarea expects API format (prompt format).
              // If user imports UI format (with "nodes", "links"), it won't work directly with our backend logic 
              // which expects prompt format. 
              // However, user might just want to save/load what they pasted.
              // Let's just load it into the textarea and let the user decide.
              // But maybe give a hint if it looks like UI format.
              
              const isUIFormat = obj.nodes && Array.isArray(obj.nodes);
              if (isUIFormat) {
                  console.warn('Imported workflow seems to be in ComfyUI Graph format, not API Prompt format.');
                  // alert(t('msg_import_graph_warn'));
              }

              // Dump back to formatted JSON for textarea
              els.workflowJson.value = JSON.stringify(obj, null, 2);
              enableGenerateIfReady();
              updateDefaultButtonState();
              alert(`${t('msg_import_success')}: ${file.name}`);

          } catch (err) {
              console.error(err);
              alert(`${t('msg_import_failed')}: ${err.message}`);
          }
      };
      reader.readAsText(file);
  }

  function onExportWorkflow() {
      const content = els.workflowJson.value.trim();
      if (!content) {
          alert(t('msg_export_empty'));
          return;
      }

      try {
          // Validate JSON first
          const obj = JSON.parse(content);
          
          // Generate filename with timestamp
          const d = new Date();
          const pad = n => (n < 10 ? '0' + n : '' + n);
          const ts = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
          const filename = `workflow_v1_${ts}.json`;

          // Create blob
          const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          
          URL.revokeObjectURL(url);
          
          // Performance check (simple log)
          // console.log('Export completed');
      } catch (err) {
          alert(t('msg_export_invalid'));
      }
  }

  function updateDefaultButtonState() {
      if (!els.setDefaultWorkflowBtn) return;
      const current = els.workflowJson.value.trim();
      const def = localStorage.getItem('default_workflow') || '';
      
      if (!current || current === def) {
          els.setDefaultWorkflowBtn.textContent = t('btn_set_default_active');
          els.setDefaultWorkflowBtn.classList.add('active');
          // els.setDefaultWorkflowBtn.disabled = true; // Optional: disable if same
      } else {
          els.setDefaultWorkflowBtn.textContent = t('btn_set_default');
          els.setDefaultWorkflowBtn.classList.remove('active');
          // els.setDefaultWorkflowBtn.disabled = false;
      }
  }

  function onSetDefaultWorkflow() {
      const current = els.workflowJson.value.trim();
      if (!current) {
          alert(t('msg_workflow_empty'));
          return;
      }
      try {
          JSON.parse(current); // Validate JSON
          localStorage.setItem('default_workflow', current);
          updateDefaultButtonState();
          // Visual feedback
          const btn = els.setDefaultWorkflowBtn;
          const originalText = btn.textContent;
          btn.textContent = t('msg_set_default_success');
          setTimeout(() => {
              updateDefaultButtonState();
          }, 1500);
      } catch (e) {
          alert(t('msg_workflow_invalid'));
      }
  }

  async function checkServer() {
    const base = getBase();
    if (!base) return;
    setStatus(t('msg_checking'), 'muted');
    try {
      // system_stats is a lightweight endpoint
      const r = await fetch(base + '/system_stats');
      if (!r.ok) {
        setStatus(`${t('msg_service_unavailable')} (HTTP ${r.status})`, 'err');
        const text = await safeReadText(r);
        showDiagnostics({ ok:false, status:r.status, text });
        return;
      }
      const data = await r.json();
      setStatus(t('msg_connected') + ': ' + (data?.system?.platform || 'ComfyUI'), 'ok');
      showDiagnostics({ ok:true, status:200, data });
      enableGenerateIfReady();
    } catch (err) {
      console.error(err);
      const msg = (err?.message || '').toLowerCase();
      const maybeCors = msg.includes('failed to fetch') || msg.includes('cors');
      const hint = maybeCors ? ' (CORS?)' : '';
      setStatus(`${t('msg_connect_failed')}: ` + (err?.message || 'Unknown') + hint, 'err');
      showDiagnostics({ ok:false, error: err?.message || String(err), cors: maybeCors });
    }
  }

  async function diagnoseServer() {
    const base = getBase();
    if (!base) return;
    setStatus(t('msg_diagnosing'), 'muted');
    els.diagnostics && (els.diagnostics.textContent = '');
    try {
      const t0 = performance.now();
      const r = await fetch(base + '/system_stats');
      const latency = Math.round(performance.now() - t0);
      if (!r.ok) {
        const text = await safeReadText(r);
        setStatus(`${t('msg_service_unavailable')} (HTTP ${r.status})`, 'err');
        showDiagnostics({ ok:false, status:r.status, text, latency });
        return;
      }
      const data = await r.json();
      setStatus(t('msg_diagnose_success'), 'ok');
      showDiagnostics({ ok:true, status:200, data, latency });
    } catch (err) {
      const msg = (err?.message || '').toLowerCase();
      const maybeCors = msg.includes('failed to fetch') || msg.includes('cors');
      setStatus(`${t('msg_diagnose_failed')}: ` + (err?.message || 'Unknown') + (maybeCors ? ' (CORS?)' : ''), 'err');
      showDiagnostics({ ok:false, error: err?.message || String(err), cors: maybeCors });
    }
  }

  async function safeReadText(r) {
    try { return await r.text(); } catch { return ''; }
  }

  function showDiagnostics(info) {
    if (!els.diagnostics) return;
    const parts = [];
    parts.push((info.ok ? t('diag_ok') : t('diag_fail')));
    if (info.status) parts.push(`HTTP ${info.status}`);
    if (typeof info.latency === 'number') parts.push(`${info.latency}ms`);
    if (info.cors) parts.push('CORS?');
    if (info.error) parts.push(t('diag_error') + ': ' + info.error);
    if (info.text) parts.push(t('diag_response') + ': ' + truncate(info.text, 200));
    if (info.data) {
      const plat = info.data?.system?.platform;
      const gpu = info.data?.system?.cuda || info.data?.system?.gpu;
      parts.push(t('diag_platform') + ': ' + (plat || '?'));
      if (gpu) parts.push(t('diag_gpu') + ': ' + gpu);
    }
    els.diagnostics.textContent = parts.join(' | ');
  }

  function truncate(s, n) { if (!s) return ''; return s.length > n ? (s.slice(0, n) + '…') : s; }

  function getBase() {
    const base = state.baseUrl || els.serverUrl.value.trim();
    if (!base) {
      setStatus(t('msg_fill_server_url'), 'warn');
      return '';
    }
    return base.replace(/\/$/, '');
  }

  function setStatus(text, kind = 'muted') {
    els.serverStatus.textContent = text;
    // Remove data-i18n to prevent auto-reset to default "Unchecked" on language switch
    els.serverStatus.removeAttribute('data-i18n');
    els.serverStatus.style.color = kind === 'ok' ? 'var(--ok)' : kind === 'err' ? 'var(--err)' : kind === 'warn' ? 'var(--warn)' : 'var(--muted)';
  }

  function renderPreviewPlaceholder() {
    // 使用 data-i18n 确保自动翻译
    els.imagePreview.innerHTML = '<div class="placeholder"><span data-i18n="section_add_file">' + t('section_add_file') + '</span></div>';
    // 绑定点击事件，点击占位符也触发选择
    const ph = els.imagePreview.querySelector('.placeholder');
    if (ph) {
        ph.style.cursor = 'pointer';
        ph.addEventListener('click', () => els.imageInput && els.imageInput.click());
    }
  }

  async function onImageSelected(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) { renderPreviewPlaceholder(); return; }
    for (const f of files) { await addImage(f); }
    // 清空选择器，以便再次选择相同文件也能触发 change
    els.imageInput.value = '';
    enableGenerateIfReady();
  }

  function addImage(file) {
    return new Promise(async resolve => {
      // Check ratio and crop if needed
      let finalFile = file;
      try {
        finalFile = await checkAndCropImage(file);
      } catch (e) {
        // User cancelled or error
        console.log('Image add cancelled or failed', e);
        resolve();
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        state.images.push({ id: Math.random().toString(36).slice(2), file: finalFile, name: finalFile.name, url: reader.result });
        renderThumbs();
        resolve();
      };
      reader.readAsDataURL(finalFile);
    });
  }

  // --- Save / Load List ---

  async function onSaveList() {
    if (!state.images.length) {
      alert(t('msg_list_empty'));
      return;
    }

    const originalBtnText = els.saveListBtn.textContent;
    els.saveListBtn.disabled = true;
    els.saveListBtn.textContent = t('msg_compressing');

    try {
      const list = [];
      const total = state.images.length;

      for (let i = 0; i < total; i++) {
        const img = state.images[i];
        els.saveListBtn.textContent = `${t('msg_compressing')} (${i + 1}/${total})`;
        
        // Compress image: Resize to max 1920px, JPEG 0.8
        const compressedUrl = await compressImage(img.url, 1920, 0.8);
        
        // Change extension to .jpg if it was something else, to match the mime type
        let newName = img.name;
        if (!newName.toLowerCase().endsWith('.jpg') && !newName.toLowerCase().endsWith('.jpeg')) {
            newName = newName.replace(/\.[^.]+$/, '') + '.jpg';
        }

        list.push({
          name: newName,
          url: compressedUrl,
          prompts: img.prompts || [] // Save prompts
        });
      }

      const blob = new Blob([JSON.stringify(list)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'magic_photo_frame_list.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Save list failed', err);
      alert(`${t('msg_save_failed')}: ${err.message}`);
    } finally {
      els.saveListBtn.textContent = originalBtnText;
      els.saveListBtn.disabled = false;
    }
  }

  function compressImage(dataUrl, maxSide = 1920, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        
        // Scale down if needed
        if (w > maxSide || h > maxSide) {
          const ratio = w / h;
          if (ratio > 1) {
            w = maxSide;
            h = maxSide / ratio;
          } else {
            h = maxSide;
            w = maxSide * ratio;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        
        // Fill white background for transparency handling (since we convert to JPEG)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        
        ctx.drawImage(img, 0, 0, w, h);
        
        // Export as JPEG
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Image load error during compression'));
      img.src = dataUrl;
    });
  }

  function onLoadListFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const list = JSON.parse(ev.target.result);
        if (!Array.isArray(list)) {
             // Check if it looks like a workflow to give a better hint
             if (list.nodes || list['1'] || list.last_node_id) {
                 throw new Error(t('msg_format_error') + ': ' + t('hint_not_workflow'));
             }
             throw new Error(t('msg_format_error'));
        }
        
        // Clear current list before loading new one
        state.images = [];
        
        for (const item of list) {
          if (item.name && item.url) {
            const blob = dataURLtoBlob(item.url);
            if (!blob) {
                console.warn('Skipping invalid image in list:', item.name);
                continue;
            }
            const f = new File([blob], item.name, { type: blob.type });
            state.images.push({
              id: Math.random().toString(36).slice(2),
              file: f,
              name: item.name,
              url: item.url,
              prompts: item.prompts || [], // Load prompts
              videoUrl: item.videoUrl || null // Load videoUrl
            });
          }
        }
        renderThumbs();
        enableGenerateIfReady();
        els.loadListInput.value = ''; // reset
      } catch (err) {
        alert(`${t('msg_file_format_error')}: ${err.message}`);
        console.error(err);
      }
    };
    reader.readAsText(file);
  }

  function dataURLtoBlob(dataurl) {
    if (!dataurl || typeof dataurl !== 'string') return null;
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    try {
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    } catch (e) {
        console.warn('Base64 decode failed', e);
        return null;
    }
  }

  // --- Cropper Logic ---

  function checkAndCropImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const ratio = img.width / img.height;
        // Target 3:4 = 0.75. Tolerance +/- 0.02 (0.73 - 0.77)
        if (ratio >= 0.73 && ratio <= 0.77) {
          URL.revokeObjectURL(url);
          resolve(file); // OK
        } else {
          // Need crop
          openCropper(img, file, resolve, reject);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(t('msg_image_load_fail')));
      };
      img.src = url;
    });
  }

  function openCropper(img, file, resolve, reject) {
    state.crop.active = true;
    state.crop.file = file;
    state.crop.resolve = resolve;
    state.crop.reject = reject;
    state.crop.img = img;
    els.cropperModal.classList.remove('hidden');
    
    // Init canvas
    const cvs = els.cropperCanvas;
    const container = cvs.parentElement;
    cvs.width = container.clientWidth;
    cvs.height = container.clientHeight; // Fill container

    // Calc initial fit
    const cw = cvs.width;
    const ch = cvs.height;
    const iw = img.width;
    const ih = img.height;
    
    // Scale image to fit canvas with some padding
    const scale = Math.min((cw - 40) / iw, (ch - 40) / ih);
    state.crop.scale = scale;
    // Center image
    state.crop.offX = (cw - iw * scale) / 2;
    state.crop.offY = (ch - ih * scale) / 2;
    
    // Init Crop Box (3:4)
    // Max size that fits in image
    let bw = iw * scale;
    let bh = bw / 0.75;
    if (bh > ih * scale) {
      bh = ih * scale;
      bw = bh * 0.75;
    }
    // Center box on image
    state.crop.box = {
      x: state.crop.offX + (iw * scale - bw) / 2,
      y: state.crop.offY + (ih * scale - bh) / 2,
      w: bw,
      h: bh
    };

    requestAnimationFrame(drawCropper);
  }

  function drawCropper() {
    if (!state.crop.active) return;
    const ctx = els.cropperCanvas.getContext('2d');
    const cvs = els.cropperCanvas;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    
    // Draw Image
    const { img, offX, offY, scale, box } = state.crop;
    ctx.drawImage(img, offX, offY, img.width * scale, img.height * scale);
    
    // Draw Overlay (darken outside box)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    // Top
    ctx.fillRect(0, 0, cvs.width, box.y);
    // Bottom
    ctx.fillRect(0, box.y + box.h, cvs.width, cvs.height - (box.y + box.h));
    // Left
    ctx.fillRect(0, box.y, box.x, box.h);
    // Right
    ctx.fillRect(box.x + box.w, box.y, cvs.width - (box.x + box.w), box.h);
    
    // Draw Box Border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    
    // Draw 3x3 Grid
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    // Verticals
    ctx.moveTo(box.x + box.w / 3, box.y); ctx.lineTo(box.x + box.w / 3, box.y + box.h);
    ctx.moveTo(box.x + 2 * box.w / 3, box.y); ctx.lineTo(box.x + 2 * box.w / 3, box.y + box.h);
    // Horizontals
    ctx.moveTo(box.x, box.y + box.h / 3); ctx.lineTo(box.x + box.w, box.y + box.h / 3);
    ctx.moveTo(box.x, box.y + 2 * box.h / 3); ctx.lineTo(box.x + box.w, box.y + 2 * box.h / 3);
    ctx.stroke();
  }

  function initCropperEvents() {
    const cvs = els.cropperCanvas;
    
    cvs.addEventListener('mousedown', e => {
      const rect = cvs.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { box } = state.crop;
      
      // Check if inside box
      if (mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) {
        state.crop.dragMode = 'move';
        state.crop.lastMouse = { x: mx, y: my };
      } else {
        // Maybe click outside to center? nah
      }
    });

    window.addEventListener('mousemove', e => {
      if (!state.crop.active || !state.crop.dragMode) return;
      const rect = cvs.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const dx = mx - state.crop.lastMouse.x;
      const dy = my - state.crop.lastMouse.y;
      
      if (state.crop.dragMode === 'move') {
        const { box, offX, offY, scale, img } = state.crop;
        // Limit box inside image area
        const imgX = offX;
        const imgY = offY;
        const imgW = img.width * scale;
        const imgH = img.height * scale;
        
        let newX = box.x + dx;
        let newY = box.y + dy;
        
        // Clamp
        if (newX < imgX) newX = imgX;
        if (newY < imgY) newY = imgY;
        if (newX + box.w > imgX + imgW) newX = imgX + imgW - box.w;
        if (newY + box.h > imgY + imgH) newY = imgY + imgH - box.h;
        
        state.crop.box.x = newX;
        state.crop.box.y = newY;
      }
      
      state.crop.lastMouse = { x: mx, y: my };
      requestAnimationFrame(drawCropper);
    });

    window.addEventListener('mouseup', () => {
      state.crop.dragMode = null;
    });

    // Wheel to resize box
    cvs.addEventListener('wheel', e => {
      e.preventDefault();
      const { box, offX, offY, scale, img } = state.crop;
      const zoom = e.deltaY > 0 ? 0.95 : 1.05;
      
      let newW = box.w * zoom;
      let newH = newW / 0.75;
      
      const imgW = img.width * scale;
      const imgH = img.height * scale;
      
      // Check max size (image size)
      if (newW > imgW) { newW = imgW; newH = newW / 0.75; }
      if (newH > imgH) { newH = imgH; newW = newH * 0.75; }
      
      // Check min size (e.g. 50px)
      if (newW < 50) { newW = 50; newH = newW / 0.75; }
      
      // Center zoom
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      
      let newX = cx - newW / 2;
      let newY = cy - newH / 2;
      
      // Clamp position
      const imgX = offX;
      const imgY = offY;
      if (newX < imgX) newX = imgX;
      if (newY < imgY) newY = imgY;
      if (newX + newW > imgX + imgW) newX = imgX + imgW - newW;
      if (newY + newH > imgY + imgH) newY = imgY + imgH - newH;
      
      state.crop.box = { x: newX, y: newY, w: newW, h: newH };
      requestAnimationFrame(drawCropper);
    });
  }

  function onCropConfirm() {
    if (!state.crop.active) return;
    const { img, box, offX, offY, scale } = state.crop;
    
    // Calculate source coordinates
    // box.x is relative to canvas 0,0
    // img is drawn at offX, offY
    // so box relative to image is box.x - offX
    // divide by scale to get actual pixel coords
    const sx = (box.x - offX) / scale;
    const sy = (box.y - offY) / scale;
    const sw = box.w / scale;
    const sh = box.h / scale;
    
    // Create new canvas for result
    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    
    canvas.toBlob(blob => {
      // Create a new File object
      const newFile = new File([blob], state.crop.file.name, { type: state.crop.file.type, lastModified: Date.now() });
      closeCropper();
      state.crop.resolve(newFile);
    }, state.crop.file.type);
  }

  function onCropCancel() {
    if (!state.crop.active) return;
    state.crop.reject(new Error(t('msg_cancelled')));
    closeCropper();
  }

  function closeCropper() {
    state.crop.active = false;
    els.cropperModal.classList.add('hidden');
    state.crop.img = null; // release ref
  }

  function renderThumbs() {
    if (!state.images.length) { renderPreviewPlaceholder(); return; }
    const wrap = document.createElement('div');
    wrap.className = 'thumbs';
    for (const it of state.images) {
      const thumbEl = document.createElement('div'); thumbEl.className = 'thumb';
      const img = document.createElement('img'); img.src = it.url; img.alt = it.name;
      const name = document.createElement('div'); name.className = 'name'; name.textContent = it.name;
      
      const actions = document.createElement('div');
      actions.className = 'actions-bar';
      
      const editBtn = document.createElement('button');
      editBtn.className = 'action-btn edit';
      editBtn.textContent = '✎';
      editBtn.dataset.id = it.id;
      editBtn.title = t('modal_prompt_title');

      const rmBtn = document.createElement('button');
      rmBtn.className = 'action-btn remove';
      rmBtn.textContent = '×';
      rmBtn.dataset.id = it.id;
      rmBtn.title = 'Remove';

      actions.appendChild(editBtn);
      actions.appendChild(rmBtn);
      
      thumbEl.appendChild(img); thumbEl.appendChild(name); thumbEl.appendChild(actions);
      wrap.appendChild(thumbEl);
    }
    els.imagePreview.innerHTML = '';
    els.imagePreview.appendChild(wrap);
  }

  function onPreviewClick(e) {
    // Handle click on image preview to show videos
    const thumb = e.target.closest('.thumb');
    if (thumb) {
        // If clicked on action buttons, let them handle it (already bound?) 
        // Wait, onPreviewClick handles .action-btn.
        // We should check if we clicked the thumb body (not buttons)
        if (!e.target.closest('.action-btn')) {
            // Show videos for this image
            const imgId = thumb.querySelector('.action-btn').dataset.id; // Hacky but works if btn is there
            const img = state.images.find(x => x.id === imgId);
            if (img) {
                renderVideoList(img);
                // Highlight selected thumb
                document.querySelectorAll('.thumb').forEach(t => t.classList.remove('selected'));
                thumb.classList.add('selected');
            }
        }
    }

    const target = e.target;
    if (!target) return;
    
    // Check if clicked a button or icon inside button
    const btn = target.closest('.action-btn');
    if (!btn) return;

    const id = btn.dataset.id;
    if (btn.classList.contains('remove')) {
      removeImage(id);
    } else if (btn.classList.contains('edit')) {
      openPromptModal(id);
    }
  }

  // --- Video Result List Logic ---

  async function renderVideoList(img) {
      if (!els.videoResultContainer) return;
      els.videoResultContainer.innerHTML = '';
      
      const videos = img.videoUrls || [];
      if (img.videoUrl && !videos.includes(img.videoUrl)) videos.push(img.videoUrl);
      
      if (videos.length === 0) {
          els.videoResultContainer.innerHTML = `<div class="hint-large">${t('msg_no_video_generated')}</div>`;
          return;
      }

      // De-duplicate
      const uniqueVideos = [...new Set(videos)];
      
      for (const url of uniqueVideos) {
          const card = document.createElement('div');
          card.className = 'video-card';
          
          const vid = document.createElement('video');
          vid.src = url;
          vid.controls = true; // Preview
          vid.preload = 'metadata'; // Load metadata for duration/res
          
          const info = document.createElement('div');
          info.className = 'info';
          
          // Metadata placeholder, update on load
          const meta = document.createElement('div');
          meta.className = 'meta';
          meta.textContent = '...';
          
          vid.onloadedmetadata = () => {
              meta.textContent = `${vid.videoWidth}x${vid.videoHeight} • ${Math.round(vid.duration)}s`;
          };
          vid.onerror = () => {
              // 区分是用户中止（如删除）还是真的加载错误
              if (!vid.src || vid.src === '') return;
              meta.textContent = t('msg_video_load_fail');
              meta.style.color = 'var(--err)';
              card.style.opacity = '0.6'; // 变灰暗示不可用
          };

          // Removed filename display as per user request
          /*
          const nameDiv = document.createElement('div');
          try {
              const u = new URL(url, location.href);
              nameDiv.textContent = u.searchParams.get('filename') || 'Unknown';
          } catch { nameDiv.textContent = 'Video'; }
          info.appendChild(nameDiv);
          */
          
          info.appendChild(meta);
          
          const actions = document.createElement('div');
          actions.className = 'actions';
          
          const delBtn = document.createElement('button');
          delBtn.className = 'del-btn';
          delBtn.textContent = '✕'; // Compact icon
          delBtn.title = 'Remove';
          delBtn.onclick = (e) => { e.stopPropagation(); deleteVideo(img, url, card); }; // Stop propagation so we don't play video on delete
          
          actions.appendChild(delBtn);
          
          card.appendChild(vid);
          card.appendChild(info);
          card.appendChild(actions);
          
          // Click card to play/pause (if we want custom behavior, otherwise controls handle it)
          // Since controls=true, native controls take precedence. 
          // If we want "preview", we might want to toggle controls on hover or just let it be.
          // But user asked for "Video preview area", usually implies clicking plays.
          // Let's keep native controls for now as it's robust.
          
          els.videoResultContainer.appendChild(card);
      }
  }

  // --- Blocklist Logic for Deleted Videos ---
  function getDeletedBlocklist() {
    try {
        const raw = localStorage.getItem('pf_deleted_videos');
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function addToDeletedBlocklist(filename) {
      if (!filename) return;
      const list = getDeletedBlocklist();
      if (!list.includes(filename)) {
          list.push(filename);
          // Limit list size to prevent infinite growth? Say 2000 items.
          if (list.length > 2000) list.shift();
          localStorage.setItem('pf_deleted_videos', JSON.stringify(list));
      }
  }

  async function deleteVideo(img, url, cardEl) {
      if (!confirm(t('msg_confirm_delete_video'))) return;
      
      // 1. Remove from UI immediately (optimistic)
      cardEl.remove();
      
      // 2. Remove from state
      if (img.videoUrls) {
          img.videoUrls = img.videoUrls.filter(u => u !== url);
      }
      if (img.videoUrl === url) {
          img.videoUrl = img.videoUrls && img.videoUrls.length > 0 ? img.videoUrls[img.videoUrls.length-1] : null;
      }
      
      // 3. Mark for regeneration (if now empty or below max)
      // Actually auto-generation checks count < max, so just removing is enough.
      // But we can ensure forcePlayVideo is off if it was this one.
      
      // 4. Async delete from backend
      try {
          const u = new URL(url, location.href);
          const filename = u.searchParams.get('filename');
          const subfolder = u.searchParams.get('subfolder') || '';
          const type = u.searchParams.get('type') || 'output';
          
          if (filename) {
              const base = getBase();
              
              // Remove from cache
              removeVideoFromCache(img.name); 
              
              // Add to local blocklist so it doesn't reappear on sync
              addToDeletedBlocklist(filename);
              
              showToast(t('msg_toast_remove_success'), 'success');
          }
      } catch (e) {
          console.warn('Delete cleanup failed', e);
          showToast(t('msg_toast_remove_fail'), 'error');
      }
      
      // Check if empty
      if (els.videoResultContainer.children.length === 0) {
          els.videoResultContainer.innerHTML = `<div class="hint-large">${t('msg_no_video_generated')}</div>`;
      }
  }

  function removeVideoFromCache(imageName) {
      try {
          const key = 'pf_video_map';
          const raw = localStorage.getItem(key) || '{}';
          const map = JSON.parse(raw);
          if (map[imageName]) {
              delete map[imageName];
              localStorage.setItem(key, JSON.stringify(map));
          }
      } catch {}
  }

  function showToast(msg, type = 'success') {
      let container = document.querySelector('.toast-container');
      if (!container) {
          container = document.createElement('div');
          container.className = 'toast-container';
          document.body.appendChild(container);
      }
      
      const el = document.createElement('div');
      el.className = `toast ${type}`;
      el.textContent = msg;
      
      // Undo button?
      if (type === 'success' && msg.includes('移除')) {
          // Implementing real undo is complex (need to restore state).
          // Skip for now to keep simple < 300ms.
      }
      
      container.appendChild(el);
      setTimeout(() => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(20px)';
          setTimeout(() => el.remove(), 300);
      }, 3000);
  }

  function removeImage(id) {
    state.images = state.images.filter(x => x.id !== id);
    renderThumbs();
    enableGenerateIfReady();
  }

  function enableGenerateIfReady() {
    const ready = Boolean(getBase()) && state.images.length > 0 && Boolean(els.workflowJson.value.trim());
    els.generateBtn.disabled = !ready;
  }

  async function onGenerate() {
    const base = getBase();
    if (!base) return;
    const workflowText = els.workflowJson.value.trim();
    if (state.images.length === 0 || !workflowText) return;

    try {
      state.isGenerating = true;
      els.generateBtn.disabled = true;
      els.generateBtn.style.display = 'none';
      if (els.stopGenerateBtn) {
          els.stopGenerateBtn.style.display = 'inline-block';
          els.stopGenerateBtn.disabled = false;
      }

      const total = state.images.length;
      // 生成前保存当前工作流到最近 - Removed
      // addRecentWorkflow(workflowText); 
      for (let i = 0; i < total; i++) {
        if (!state.isGenerating) {
            setProgress(t('msg_progress_stopped'));
            break;
        }

        try {
          const item = state.images[i];
          setProgress(`(${i + 1}/${total}) ${t('msg_progress_upload')}: ${item.name}`);
          const uploadInfo = await uploadImage(base, item.file);
          state.lastUploaded = uploadInfo;
  
          // 生成本次输出文件名并注入占位
          const outName = nextOutputFilename(i + 1, total);
          state.pendingOutputName = outName;
          state.pendingOutputSubfolder = 'magicpf';
          
          // 如果用户设置了“单图最大视频数”，在手动生成时也检查是否已达上限？
          // 通常手动点击生成意味着强制生成，所以不检查 maxVideosPerImage 限制。
          // 但是我们应该尊重“已删除黑名单”吗？手动生成应该允许“复活”吗？
          // 手动生成产生的新文件名通常是新的（基于时间戳），所以不会被黑名单拦截。
          // 除非用户在工作流里写死了固定的 filename_prefix 且没有使用 {{OUTPUT_FILENAME}} 占位符。
          // 默认工作流使用了占位符，所以是安全的。

          setProgress(`(${i + 1}/${total}) ${t('msg_progress_prepare')}`);
          const promptObj = prepareWorkflow(workflowText, uploadInfo, item);

          setProgress(`(${i + 1}/${total}) ${t('msg_progress_submit')}`);
          const promptId = await submitPrompt(base, promptObj, state.clientId);
          state.lastPromptId = promptId;
  
          // 优先使用 WebSocket 事件驱动的完成通知；若 WS 不可用再退回轮询
          if (!state.wsConnected) {
            if (state.currentExpectedOutput?.filename) {
              startOutputExistPolling(base, state.currentExpectedOutput);
            } else if (state.currentExpectedPrefix) {
              startOutputExistPollingByPrefix(base, state.currentExpectedPrefix);
            }
          }
  
          setProgress(`(${i + 1}/${total}) ${t('msg_progress_waiting')}`);
          const result = await pollHistoryForVideo(base, promptId);
  
          if (result) {
            const videoUrl = buildViewUrl(base, result);
            showResult(videoUrl, result);
          } else {
            setProgress(`(${i + 1}/${total}) ${t('msg_progress_failed')}: No video found`);
          }
        } catch (itemErr) {
          console.error(`Error processing item ${i + 1}:`, itemErr);
          setProgress(`(${i + 1}/${total}) ${t('msg_progress_failed')}: ${itemErr?.message || 'Unknown error'}, skipping...`);
          // Continue to next item
        }
      }
      setProgress(t('msg_progress_success'));
    } catch (err) {
      console.error(err);
      setProgress(`${t('msg_progress_failed')}: ` + (err?.message || 'Unknown error'));
    }
    finally {
      state.isGenerating = false;
      els.generateBtn.style.display = 'inline-block';
      if (els.stopGenerateBtn) {
          els.stopGenerateBtn.style.display = 'none';
          els.stopGenerateBtn.textContent = t('btn_stop_generate');
          els.stopGenerateBtn.disabled = false;
      }
      enableGenerateIfReady();
    }
  }

  function toWsUrl(base) {
    try {
      const u = new URL(base);
      u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
      u.pathname = '/ws';
      u.search = `client_id=${encodeURIComponent(state.clientId)}`;
      return u.toString();
    } catch {
      return '';
    }
  }

  function ensureWebSocket(base) {
    if (!base) return;
    const wsUrl = toWsUrl(base);
    if (!wsUrl) return;
    // 如果已有且地址一致，则不重复连接
    if (state.ws && state.wsBase === base && state.wsConnected) return;
    try { if (state.ws) { state.ws.close(); state.ws = null; state.wsConnected = false; } } catch {}
    const ws = new WebSocket(wsUrl);
    state.ws = ws; state.wsBase = base; state.wsConnected = false;
    ws.onopen = () => { state.wsConnected = true; };
    ws.onclose = () => { state.wsConnected = false; };
    ws.onerror = () => { state.wsConnected = false; };
    ws.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      const t = msg?.type;
      const data = msg?.data || {};
      // ComfyUI 在队列空闲时会发送 { type:'executing', data:{ prompt_id, node:null } }
      if (t === 'executing' && data?.prompt_id && data?.node === null) {
        if (state.lastPromptId && data.prompt_id === state.lastPromptId) {
          onPromptFinished(base, data.prompt_id);
        }
      }
    };
  }

  async function onPromptFinished(base, promptId) {
    try {
      setProgress(t('msg_progress_waiting')); // Reuse waiting msg
      const r = await fetch(base + '/history/' + promptId);
      if (!r.ok) { console.warn('[onPromptFinished] history HTTP', r.status); setProgress(t('msg_progress_failed')); return; }
      const hist = await r.json();
      const keys = Object.keys(hist || {});
      console.log('[onPromptFinished] history entries', { base, promptId, entries: keys.length });
      const videos = collectVideosFromHistory(hist);
      console.log('[onPromptFinished] videos', { count: videos.length, sample: videos.slice(0, 3).map(v => v.filename) });
      if (!videos.length) { setProgress(t('msg_progress_failed') + ': No video in history'); return; }
      videos.sort((a, b) => {
        const ta = a.ts || 0, tb = b.ts || 0;
        if (tb !== ta) return tb - ta;
        const na = a.num || 0, nb = b.num || 0;
        if (nb !== na) return nb - na;
        return scoreFilenameRecency(b.filename) - scoreFilenameRecency(a.filename);
      });
      const picked = pickNextUnique(videos) || videos[0];
      const url = buildViewUrl(base, picked);
      console.log('[onPromptFinished] pick', { filename: picked.filename, type: picked.type, subfolder: picked.subfolder, ts: picked.ts });
      showResult(url, picked);
      setProgress(t('msg_progress_success'));
    } catch (err) {
      console.error('[onPromptFinished] error', err);
      setProgress(`${t('msg_progress_failed')}: ` + (err?.message || 'Unknown'));
    }
  }

  async function onRefreshLastResult() {
    const base = getBase();
    if (!base) return;
    const pid = state.lastPromptId;
    if (!pid) {
      // 无最近ID时，直接从全量历史中查找最新视频
      try {
        setProgress(t('msg_checking'));
        console.log('[onRefreshLastResult] no promptId, using all history', { base });
        const latest = await fetchLatestVideoFromAllHistory(base);
        if (latest) {
          const url = buildViewUrl(base, latest);
          console.log('[onRefreshLastResult] latest-from-all', { filename: latest.filename, type: latest.type, subfolder: latest.subfolder, ts: latest.ts });
          showResult(url, latest);
          setProgress(t('msg_progress_success'));
        } else {
          setProgress(t('msg_no_video_generated'));
        }
      } catch (err) {
        console.error(err);
        setProgress(`${t('msg_progress_failed')}`);
      }
      return;
    }
    try {
      setProgress(t('msg_progress_waiting'));
      console.log('[onRefreshLastResult] with promptId', { base, promptId: pid });
      const result = await pollHistoryForVideo(base, pid, { timeoutMs: 15000, intervalMs: 1200 });
      if (result) {
        const videoUrl = buildViewUrl(base, result);
        console.log('[onRefreshLastResult] poll-picked', { filename: result.filename, type: result.type, subfolder: result.subfolder, ts: result.ts });
        showResult(videoUrl, result);
        setProgress(t('msg_progress_success'));
      } else {
        // 回退：从全量历史中寻找最新视频
        console.log('[onRefreshLastResult] poll missed, fallback to all history');
        const latest = await fetchLatestVideoFromAllHistory(base);
        if (latest) {
          const url = buildViewUrl(base, latest);
          console.log('[onRefreshLastResult] fallback-picked', { filename: latest.filename, type: latest.type, subfolder: latest.subfolder, ts: latest.ts });
          showResult(url, latest);
          setProgress(t('msg_progress_success'));
        } else {
          setProgress(t('msg_no_video_generated'));
        }
      }
    } catch (err) {
      console.error(err);
      setProgress(`${t('msg_progress_failed')}`);
    }
  }

  function setProgress(text) {
    const prev = state.lastProgressText || '';
    els.progress.textContent = text;
    state.lastProgressText = text;
    // 当提示从“生成中，等待结果...”变更为其他内容时，主动尝试刷新一次结果以防漏检
    if (prev.includes(t('msg_progress_waiting')) && text !== prev) {
      console.log('[setProgress] progress changed, trigger refresh', { prev, next: text });
      // 异步触发，避免与当前流程竞争
      setTimeout(() => {
        try { onRefreshLastResult(); } catch (e) { console.warn('[setProgress] onRefreshLastResult error', e); }
      }, 0);
    }
  }

  async function uploadImage(base, file) {
    const form = new FormData();
    form.append('image', file);
    const r = await fetch(base + '/upload/image', { method: 'POST', body: form });
    if (!r.ok) throw new Error(t('msg_image_load_fail'));
    const data = await r.json();
    // Expected shape: { name or filename, subfolder, type }
    const filename = data?.name || data?.filename || file.name;
    return { filename, subfolder: data?.subfolder || '', type: data?.type || 'input' };
  }

  function prepareWorkflow(workflowText, uploadInfo, item = null) {
    let obj;
    try {
      obj = JSON.parse(workflowText);
    } catch (err) {
      // Fallback: do placeholder replacement in raw text then parse
      const replaced = workflowText
        .replaceAll('{{IMAGE_FILENAME}}', uploadInfo.filename)
        .replaceAll('{{IMAGE_SUBFOLDER}}', uploadInfo.subfolder || '')
        .replaceAll('{{OUTPUT_FILENAME}}', state.pendingOutputName || 'output.mp4')
        .replaceAll('{{OUTPUT_PREFIX}}', derivePrefixFromImageName(uploadInfo.filename))
        .replaceAll('{{VIDEO_SCALE}}', state.photoFrame.config.videoScaleLength || 240);
      obj = JSON.parse(replaced);
    }

    // Determine prompt text
    let promptText = '';
    // Priority: Custom prompts > Default prompts
    if (item && item.prompts && item.prompts.length > 0) {
        promptText = item.prompts[Math.floor(Math.random() * item.prompts.length)];
    } else if (state.photoFrame.config.defaultPrompts && state.photoFrame.config.defaultPrompts.length > 0) {
        promptText = state.photoFrame.config.defaultPrompts[Math.floor(Math.random() * state.photoFrame.config.defaultPrompts.length)];
    }
    
    // 标记是否真的注入了精确的输出文件名（仅当某节点具有 filename 字段且被替换）
    let usedExactFilename = false;

    // Deep replace placeholders even if we parsed first
    deepTraverse(obj, (key, value, parent) => {
      if (typeof value === 'string') {
        if (value.includes('{{IMAGE_FILENAME}}')) parent[key] = value.replaceAll('{{IMAGE_FILENAME}}', uploadInfo.filename);
        if (value.includes('{{IMAGE_SUBFOLDER}}')) parent[key] = value.replaceAll('{{IMAGE_SUBFOLDER}}', uploadInfo.subfolder || '');
        if (value.includes('{{OUTPUT_FILENAME}}')) parent[key] = value.replaceAll('{{OUTPUT_FILENAME}}', state.pendingOutputName || 'output.mp4');
        if (value.includes('{{PROMPT}}')) parent[key] = value.replaceAll('{{PROMPT}}', promptText);
      }
      // Randomize seeds
      if (key.toLowerCase() === 'seed' && (typeof value === 'number' || typeof value === 'string')) {
        parent[key] = Math.floor(Math.random() * 2147483647);
      }
      // Heuristic: auto set common image fields if empty
      if (key.toLowerCase() === 'image' && (value === '' || value === null)) {
        parent[key] = uploadInfo.filename;
      }
      if (key.toLowerCase() === 'subfolder' && (value === '' || value === null)) {
        parent[key] = uploadInfo.subfolder || '';
      }
      // 输出子目录占位
      if (key.toLowerCase() === 'subfolder' && typeof value === 'string' && value.includes('{{OUTPUT_SUBFOLDER}}')) {
        parent[key] = (state.pendingOutputSubfolder || '').toString();
      }
      // 若检测到保存视频节点的 filename 为空或为默认，尝试注入，并记录使用了精确文件名
      if (key.toLowerCase() === 'filename' && typeof value === 'string' && (value === '' || /\.mp4$/i.test(value))) {
        if (state.pendingOutputName) { parent[key] = state.pendingOutputName; usedExactFilename = true; }
      }
      // VHS 视频合并节点：为 filename_prefix 注入“输入图片文件名（去扩展名）”作为稳定前缀
      if (key.toLowerCase() === 'filename_prefix' && typeof value === 'string') {
        const pref = derivePrefixFromImageName(uploadInfo.filename);
        parent[key] = 'magicpf/' + pref;
        state.currentExpectedPrefix = pref;
      }
      
      // Update VIDEO_SCALE placeholder
      if (typeof value === 'string' && value.includes('{{VIDEO_SCALE}}')) {
          const val = value.replaceAll('{{VIDEO_SCALE}}', state.photoFrame.config.videoScaleLength || 240);
          // Try to convert to number if it looks like a pure number
          if (!isNaN(val) && !isNaN(parseFloat(val))) {
              parent[key] = Number(val);
          } else {
              parent[key] = val;
          }
      }
    });

    // 仅当确实注入了精确文件名时，记录期望输出；否则清空以使用前缀轮询
    if (usedExactFilename && state.pendingOutputName) {
      state.currentExpectedOutput = { filename: state.pendingOutputName, subfolder: state.pendingOutputSubfolder || '', type: 'output' };
    } else {
      state.currentExpectedOutput = null;
    }

    return obj;
  }

  function deepTraverse(obj, fn) {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) deepTraverse(obj[i], fn);
      return;
    }
    if (obj && typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        fn(k, obj[k], obj);
        deepTraverse(obj[k], fn);
      }
    }
  }

  function nextOutputFilename(index = 1, total = 1) {
    // 使用时间戳 + 序号作为唯一文件名，扩展名 mp4
    const pad = (n, w = 5) => String(n).padStart(w, '0');
    const ts = Date.now();
    return `Auto_${pad(index)}_${ts}.mp4`;
  }

  function nextOutputPrefix(basePrefix = 'Output') {
    // 运行时唯一前缀：保持用户前缀基础上附加时间戳
    const d = new Date();
    const pad = n => (n < 10 ? '0' + n : '' + n);
    const ts = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    return `${basePrefix}_${ts}`;
  }

  function derivePrefixFromImageName(name = '') {
    // 取文件名基名（去路径、去扩展名），并规范空白
    try {
      const base = String(name).replace(/^.*[\\\/]/, ''); // 去路径
      const stem = base.replace(/\.[^.]+$/, ''); // 去扩展名
      const cleaned = stem.trim().replace(/\s+/g, '_');
      return cleaned || 'Output';
    } catch {
      return 'Output';
    }
  }

  async function submitPrompt(base, promptObj, clientId) {
    const r = await fetch(base + '/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptObj, client_id: clientId }),
    });
    if (!r.ok) throw new Error('提交失败');
    const data = await r.json();
    return data?.prompt_id || data?.promptId || data?.id;
  }

  async function pollHistoryForVideo(base, promptId, { timeoutMs = 180000, intervalMs = 1500 } = {}) {
    const start = Date.now();
    let attempt = 0;
    while (Date.now() - start < timeoutMs) {
      attempt++;
      let hist;
      try {
        // Add timestamp to prevent caching
        const r = await fetch(base + '/history/' + promptId + '?t=' + Date.now());
        if (r.ok) {
          hist = await r.json();
          const keys = Object.keys(hist || {});
          console.log('[pollHistoryForVideo] OK', { base, promptId, attempt, entries: keys.length });
        } else {
          console.log('[pollHistoryForVideo] HTTP', { status: r.status, attempt });
        }
      } catch (err) {
        // 网络/CORS问题，等待后重试
        console.warn('[pollHistoryForVideo] fetch error', err);
      }
      if (hist) {
        const videos = collectVideosFromHistory(hist);
        console.log('[pollHistoryForVideo] videos collected', { attempt, count: videos.length, sample: videos.slice(0, 3).map(v => v.filename) });
        if (videos.length > 0) {
          const pref = state.currentExpectedPrefix || '';
          let candidates = videos;
          if (pref) {
            const byPref = videos.filter(v => typeof v.filename === 'string' && v.filename.startsWith(pref));
            console.log('[pollHistoryForVideo] prefix filter', { prefix: pref, matched: byPref.length });
            if (byPref.length > 0) candidates = byPref;
          }
          candidates.sort((a, b) => (b.ts || 0) - (a.ts || 0));
          const picked = pickNextUnique(candidates);
          if (picked) {
            console.log('[pollHistoryForVideo] picked', { attempt, filename: picked.filename, type: picked.type, subfolder: picked.subfolder, ts: picked.ts });
            return picked;
          }
          console.log('[pollHistoryForVideo] fallback to first', { attempt, filename: candidates[0].filename });
          return candidates[0];
        }
      }
      await sleep(intervalMs);
    }
    return null;
  }

  function collectVideosFromHistory(hist) {
    const out = [];
    try {
      const entries = Object.values(hist || {});
      console.log('[collectVideosFromHistory] entries', { count: entries.length });
      for (const entry of entries) {
        const ts = extractEntryTimestamp(entry);
        const nodes = entry?.outputs ? Object.values(entry.outputs) : [];
        for (const n of nodes) {
          // 兼容不同字段命名：videos / video / gifs / media
          const candidates = [];
          if (Array.isArray(n?.videos)) candidates.push(...n.videos);
          if (Array.isArray(n?.video)) candidates.push(...n.video);
          if (Array.isArray(n?.gifs)) candidates.push(...n.gifs);
          if (Array.isArray(n?.media)) candidates.push(...n.media);
          // 某些工作流可能将视频也放入 images（如 mp4/gif 扩展名）
          if (Array.isArray(n?.images)) {
            for (const img of n.images) {
              const fname = img?.filename || img?.name || img?.path || '';
              if (/\.(mp4|gif)$/i.test(fname)) candidates.push(img);
            }
          }
          for (const v of candidates) {
            const filename = v?.filename || v?.name || v?.path;
            if (filename) {
              const type = v?.type || n?.type || entry?.type || 'output';
              const subfolder = v?.subfolder || n?.subfolder || entry?.subfolder || '';
              out.push({ ...v, filename, type, subfolder, ts, num: extractNumericHint(filename) });
            }
          }
        }
      }
    } catch (err) {
      console.warn('解析历史失败', err);
    }
    console.log('[collectVideosFromHistory] videos', { count: out.length, sample: out.slice(0, 3).map(v => v.filename) });
    return out;
  }

  function extractEntryTimestamp(entry) {
    // 尝试从常见字段提取时间戳（毫秒）
    const candidates = [
      entry?.timestamp,
      entry?.time,
      entry?.created_at,
      entry?.created,
      entry?.date,
      entry?.ended,
      entry?.finished,
      entry?.start_time,
      entry?.end_time,
    ];
    for (const c of candidates) {
      if (!c) continue;
      if (typeof c === 'number') {
        // 可能是秒或毫秒
        return c > 1e12 ? c : c * 1000;
      }
      if (typeof c === 'string') {
        const t = Date.parse(c);
        if (!isNaN(t)) return t;
      }
    }
    return 0;
  }

  async function fetchLatestVideoFromAllHistory(base) {
    try {
      const r = await fetch(base + '/history');
      if (!r.ok) return null;
      const hist = await r.json();
      const videos = collectVideosFromHistory(hist);
      if (videos.length === 0) return null;
      // 当存在期望前缀时，优先筛选该前缀
      const pref = state.currentExpectedPrefix || '';
      const candidates = pref ? videos.filter(v => typeof v.filename === 'string' && v.filename.startsWith(pref)) : videos;
      console.log('[fetchLatestVideoFromAllHistory] prefix filter', { prefix: pref, total: videos.length, matched: candidates.length });
      // 排序规则：ts 降序 > 数字后缀降序 > 日期打分降序
      candidates.sort((a, b) => {
        const ta = a.ts || 0, tb = b.ts || 0;
        if (tb !== ta) return tb - ta;
        const na = a.num || 0, nb = b.num || 0;
        if (nb !== na) return nb - na;
        return scoreFilenameRecency(b.filename) - scoreFilenameRecency(a.filename);
      });
      const picked = pickNextUnique(candidates);
      const chosen = picked || candidates[0];
      console.log('[fetchLatestVideoFromAllHistory]', { base, total: videos.length, matched: candidates.length, chosen: chosen?.filename, type: chosen?.type, subfolder: chosen?.subfolder, ts: chosen?.ts });
      return chosen;
    } catch (err) {
      console.warn('[fetchLatestVideoFromAllHistory] error', err);
      return null;
    }
  }

  function scoreFilenameRecency(name = '') {
    // 朴素打分：越包含常见日期/时间片段得分越高
    let s = 0;
    if (/\d{4}-\d{2}-\d{2}/.test(name)) s += 3; // YYYY-MM-DD
    if (/\d{8}_\d{6}/.test(name)) s += 3; // YYYYMMDD_HHMMSS
    if (/\d{14}/.test(name)) s += 2; // 纯14位时间戳
    if (/\d{10}/.test(name)) s += 1; // 10位时间戳
    return s;
  }

  function extractNumericHint(name = '') {
    // 取文件名中最后一个数字作为“新近度”提示，例如 AllInOne01_00006.mp4 -> 6
    const nums = name.match(/\d+/g);
    if (!nums || !nums.length) return 0;
    const last = parseInt(nums[nums.length - 1], 10);
    return isNaN(last) ? 0 : last;
  }

  function buildViewUrl(base, videoInfo) {
    const params = new URLSearchParams({
      filename: videoInfo.filename,
      subfolder: videoInfo.subfolder || '',
      type: videoInfo.type || 'output',
    });
    const url = base + '/view?' + params.toString();
    console.log('[buildViewUrl]', { url, filename: videoInfo.filename, type: videoInfo.type, subfolder: videoInfo.subfolder });
    // Append timestamp to force reload in video element
    return url + '&t=' + Date.now();
  }

  function startOutputExistPolling(base, info) {
    try { if (state.outputPollTimer) { clearInterval(state.outputPollTimer); state.outputPollTimer = null; } } catch {}
    const url = buildViewUrl(base, info);
    const deadline = Date.now() + (state.outputCheckTimeoutMs || 180000);
    state.outputPollTimer = setInterval(async () => {
      if (Date.now() > deadline) {
        clearInterval(state.outputPollTimer); state.outputPollTimer = null;
        setProgress('Timeout waiting for file');
        return;
      }
      try {
        const r = await fetch(url, { method: 'GET', cache: 'no-store' });
        if (r.ok) {
          clearInterval(state.outputPollTimer); state.outputPollTimer = null;
          showResult(url, info);
          setProgress('File detected');
        }
      } catch (err) {
        // 网络错误忽略，继续轮询
      }
    }, state.outputCheckIntervalMs || 1500);
  }

  async function findByPrefixFromHistory(base, prefix) {
    // 查询历史，返回匹配前缀的最新视频（按时间与编号排序）
    let all = [];
    try {
      const r = await fetch(base + '/history');
      if (!r.ok) return null;
      const hist = await r.json();
      all = collectVideosFromHistory(hist);
    } catch {
      return null;
    }
    const list = all.filter(v => typeof v.filename === 'string' && v.filename.startsWith(prefix));
    if (!list.length) return null;
    list.sort((a, b) => {
      const ta = a.ts || 0, tb = b.ts || 0;
      if (tb !== ta) return tb - ta;
      const na = extractNumericHint(a.filename), nb = extractNumericHint(b.filename);
      if (nb !== na) return nb - na;
      return scoreFilenameRecency(b.filename) - scoreFilenameRecency(a.filename);
    });
    console.log('[findByPrefixFromHistory]', { prefix, candidates: list.length, top: list[0]?.filename });
    return list[0];
  }

  function startOutputExistPollingByPrefix(base, prefix) {
    try { if (state.outputPollTimer) { clearInterval(state.outputPollTimer); state.outputPollTimer = null; } } catch {}
    const deadline = Date.now() + (state.outputCheckTimeoutMs || 180000);
    state.outputPollTimer = setInterval(async () => {
      if (Date.now() > deadline) {
        clearInterval(state.outputPollTimer); state.outputPollTimer = null;
        setProgress('Timeout waiting for file (prefix)');
        return;
      }
      try {
        const latest = await findByPrefixFromHistory(base, prefix);
        if (latest) {
          clearInterval(state.outputPollTimer); state.outputPollTimer = null;
          const url = buildViewUrl(base, latest);
          showResult(url, latest);
          setProgress('File detected (prefix)');
        }
      } catch (err) {
        // 忽略错误继续轮询
      }
    }, state.outputCheckIntervalMs || 1500);
  }

  function showResult(videoUrl, meta) {
    const sig = signatureFor(meta);
    // const isRepeat = state.lastShownSig && sig === state.lastShownSig;
    console.log('[showResult]', { url: videoUrl, filename: meta?.filename, type: meta?.type, subfolder: meta?.subfolder, ts: meta?.ts });
    
    // Find matching image(s) and update state
    let updated = false;
    let targetImg = null;
    
    const filename = meta?.filename || '';
    if (filename) {
        for (const img of state.images) {
             const prefix = derivePrefixFromImageName(img.name);
             // Match logic: strict or loose prefix
             if (filename.startsWith('magicpf/' + prefix) || filename.startsWith(prefix)) {
                 if (!Array.isArray(img.videoUrls)) img.videoUrls = [];
                 
                 // Check if already exists (by filename check in url)
                 const exists = img.videoUrls.some(u => u.includes(filename));
                 
                 if (!exists) {
                     img.videoUrls.push(videoUrl);
                     img.videoUrl = videoUrl; // legacy
                     saveVideoInfoToCache(img.name, meta);
                     updated = true;
                     targetImg = img;
                     // Continue checking? Usually one video -> one image (unless duplicate names)
                     // If duplicate names, both get it. That's consistent with prefix logic.
                 } else {
                     // Even if exists, we might want to ensure targetImg is set so we can refresh view
                     // But 'updated' is false, so we won't show toast again?
                     targetImg = img;
                 }
             }
        }
    }
    
    // If updated, refresh UI if needed
    if (targetImg) {
        const selected = document.querySelector('.thumb.selected');
        if (selected) {
            const id = selected.querySelector('.action-btn')?.dataset.id;
            if (id === targetImg.id) {
                renderVideoList(targetImg);
            }
        }
        if (updated) {
             showToast(`${t('msg_progress_success')}: ${targetImg.name}`, 'success');
        }
    } else {
        console.warn('[showResult] Could not find matching image for video:', filename);
    }
    
    state.lastShownSig = sig;
  }

  function signatureFor(info) {
    return `${info?.type || 'output'}|${info?.subfolder || ''}|${info?.filename || ''}`;
  }

  function pickNextUnique(list) {
    const last = state.lastShownSig;
    if (!last) return list[0];
    for (const v of list) {
      if (signatureFor(v) !== last) return v;
    }
    return list[0];
  }

  function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
})();
