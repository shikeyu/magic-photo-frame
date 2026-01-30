const translations = {
    "zh": {
        "title": "魔法相框",
        "slogan": "让回忆动起来 ✨",
        "label_server_url": "ComfyUI 服务地址",
        "btn_check_server": "连接检测",
        "btn_diagnose": "诊断",
        "status_unchecked": "未检测",
        "section_workflow": "工作流 JSON",
        "hint_workflow": "将你的 ComfyUI 工作流 JSON 粘贴到此处。可使用占位符 {{IMAGE_FILENAME}} 和 {{IMAGE_SUBFOLDER}} 在文件名/子目录字段里，应用会在提交前自动替换。使用 {{PROMPT}} 代表提示词，{{VIDEO_SCALE}} 代表视频分辨率。系统将自动填入自定义或默认值。应用会自动将所有 seed 字段随机化，以保证每次返回不同视频。",
        "hint_not_workflow": "这似乎是一个工作流文件，而不是图片列表文件",
        "hint_video_scale": "视频长边分辨率 (240-1024)",
        "btn_set_default": "设为默认",
        "btn_set_default_active": "已设为默认",
        "btn_import": "导入工作流",
        "btn_export": "导出工作流",
        "section_add_file": "添加文件",
        "btn_select_files": "选择文件",
        "btn_save_list": "保存列表",
        "btn_load_list": "加载列表",
        "btn_generate": "生成魔法视频",
        "btn_stop_generate": "停止生成",
        "btn_stopping": "停止中...",
        "hint_generate": "可添加多张图片并删除不需要的项；生成时会按顺序轮换。按钮会在以下条件全部满足时自动激活：1) 填写 ComfyUI 地址；2) 粘贴有效的工作流 JSON；3) 至少添加一张图片。",
        "section_results": "视频结果管理",
        "btn_sync_history": "同步历史记录",
        "btn_syncing": "同步中...",
        "hint_results_empty": "请点击左侧图片列表中的图片，查看其关联的视频",
        "section_config": "相框模式设置",
        "label_photo_duration": "照片展示时长 (秒)",
        "label_video_prob": "视频触发概率 (%)",
        "label_video_scale": "视频长边分辨率 (240-1024)",
        "label_loop_count": "视频循环次数",
        "label_trans_duration": "过渡动画时长 (毫秒)",
        "label_bg_music": "背景音乐 URL (可选)",
        "label_default_prompts": "默认提示词 (每行一个，生成视频时随机选用)",
        "label_show_clock": "显示时钟",
        "label_auto_generate": "自动后台生成视频",
        "label_max_videos": "单图最大视频数 (0为不限制)",
        "btn_start_frame": "开启相框模式",
        "btn_reset_videos": "重置视频状态",
        "footer_hint": "提示：如果连接检测失败但在浏览器直接访问 /system_stats 有返回，通常是跨域（CORS）导致。解决方案：以允许跨站的方式启动 ComfyUI。例如：python main.py --listen --port 8188 --enable-cors-header",
        "modal_crop_title": "裁切图片 (需符合 3:4 比例)",
        "btn_cancel": "取消",
        "btn_confirm_crop": "确认裁切",
        "modal_prompt_title": "管理自定义提示词",
        "btn_add_prompt": "+ 添加提示词",
        "btn_save": "保存",
        "ph_server_url": "例如：http://127.0.0.1:8188",
        "ph_workflow": "在这里粘贴你的工作流 JSON...",
        "ph_bg_music": "输入音频文件地址...",
        "ph_default_prompts": "例如：让图片动起来，画面生动...",
        "ph_prompt_input": "输入提示词...",
        
        "msg_sync_success": "同步完成，关联了 {n} 个视频",
        "msg_sync_failed": "同步失败",
        "msg_checking": "检测中...",
        "msg_connected": "已连接",
        "msg_connect_failed": "连接失败",
        "msg_service_unavailable": "服务不可用",
        "msg_diagnosing": "诊断中...",
        "msg_diagnose_success": "服务可用",
        "msg_diagnose_failed": "诊断失败",
        "msg_compressing": "压缩中...",
        "msg_save_failed": "保存失败",
        "msg_load_failed": "加载失败",
        "msg_import_success": "成功导入工作流",
        "msg_import_failed": "导入失败",
        "msg_export_failed": "导出失败",
        "msg_set_default_success": "设置成功！",
        "msg_confirm_clear_videos": "确定要清除所有图片已关联的视频信息吗？\n这将导致系统认为图片没有视频，从而触发重新生成。",
        "msg_reset_success": "已重置 {n} 张图片的状态。开启相框模式后将重新生成视频。",
        "msg_alert_add_image": "请先添加图片",
        "msg_confirm_delete_video": "确定要删除这个视频吗？文件将被永久移除。",
        "msg_toast_remove_success": "已从列表中移除视频",
        "msg_toast_remove_fail": "移除失败",
        "msg_progress_upload": "上传图片中",
        "msg_progress_prepare": "准备工作流并随机化种子与输出文件名...",
        "msg_progress_submit": "提交工作流到 ComfyUI...",
        "msg_progress_waiting": "生成中，等待结果...",
        "msg_progress_success": "全部完成",
        "msg_progress_failed": "失败",
        "msg_progress_stopped": "已停止生成",
        "msg_video_load_fail": "无法加载",
        "msg_no_video_generated": "该图片暂无已生成的视频",
        "msg_import_size_limit": "导入失败：文件大小超过 10MB 限制",
        "msg_import_yaml_error": "YAML 解析库未加载，请检查网络或使用 JSON 格式",
        "msg_import_invalid": "无效的文件内容",
        "msg_import_graph_warn": "导入的似乎是 ComfyUI 流程图格式 (Graph)，而非 API 格式。可能无法直接生成。",
        "msg_export_empty": "当前工作流为空，无法导出",
        "msg_export_invalid": "导出失败：当前内容不是有效的 JSON 格式",
        "msg_workflow_empty": "工作流内容为空，无法设置",
        "msg_workflow_invalid": "无效的 JSON 格式，请检查后再试",
        "msg_list_empty": "列表为空，无法保存",
        "msg_format_error": "格式错误",
        "msg_file_format_error": "加载失败：文件格式错误",
        "msg_image_load_fail": "图片加载失败",
        "msg_cancelled": "已取消",
        "msg_fill_server_url": "请填写 ComfyUI 服务地址",
        "diag_ok": "正常",
        "diag_fail": "失败",
        "diag_error": "错误",
        "diag_response": "响应",
        "diag_platform": "平台",
        "diag_gpu": "显卡",
        
        "day_0": "星期日",
        "day_1": "星期一",
        "day_2": "星期二",
        "day_3": "星期三",
        "day_4": "星期四",
        "day_5": "星期五",
        "day_6": "星期六"
    },
    "en": {
        "title": "Magic Photo Frame",
        "slogan": "Animate your memories ✨",
        "label_server_url": "ComfyUI Server URL",
        "btn_check_server": "Check Connection",
        "btn_diagnose": "Diagnose",
        "status_unchecked": "Unchecked",
        "section_workflow": "Workflow JSON",
        "hint_workflow": "Paste your ComfyUI workflow JSON here. Use placeholders {{IMAGE_FILENAME}} and {{IMAGE_SUBFOLDER}} for filename/subfolder fields. Use {{PROMPT}} for prompts and {{VIDEO_SCALE}} for video resolution. The app will replace them automatically. Seeds will be randomized.",
        "hint_not_workflow": "This looks like a workflow file, not an image list file",
        "hint_video_scale": "Video Width (Longest Side)",
        "btn_set_default": "Set as Default",
        "btn_set_default_active": "Default Set",
        "btn_import": "Import Workflow",
        "btn_export": "Export Workflow",
        "section_add_file": "Add Files",
        "btn_select_files": "Select Files",
        "btn_save_list": "Save List",
        "btn_load_list": "Load List",
        "btn_generate": "Generate Magic Video",
        "btn_stop_generate": "Stop Generation",
        "btn_stopping": "Stopping...",
        "hint_generate": "Add multiple images and remove unwanted ones; generation proceeds sequentially. Button activates when: 1) ComfyUI URL is set; 2) Valid Workflow JSON is present; 3) At least one image is added.",
        "section_results": "Video Results",
        "btn_sync_history": "Sync History",
        "btn_syncing": "Syncing...",
        "hint_results_empty": "Click an image on the left to view its associated videos.",
        "section_config": "Photo Frame Settings",
        "label_photo_duration": "Photo Duration (s)",
        "label_video_prob": "Video Probability (%)",
        "label_video_scale": "Video Width (Longest Side)",
        "label_loop_count": "Video Loop Count",
        "label_trans_duration": "Transition Duration (ms)",
        "label_bg_music": "Background Music URL (Optional)",
        "label_default_prompts": "Default Prompts (One per line, picked randomly)",
        "label_show_clock": "Show Clock",
        "label_auto_generate": "Auto Background Generation",
        "label_max_videos": "Max Videos per Image (0 = Unlimited)",
        "btn_start_frame": "Start Photo Frame",
        "btn_reset_videos": "Reset Video State",
        "footer_hint": "Tip: If connection fails but /system_stats works in browser, it's likely a CORS issue. Solution: Launch ComfyUI with: python main.py --listen --port 8188 --enable-cors-header",
        "modal_crop_title": "Crop Image (3:4 Ratio Required)",
        "btn_cancel": "Cancel",
        "btn_confirm_crop": "Confirm Crop",
        "modal_prompt_title": "Manage Custom Prompts",
        "btn_add_prompt": "+ Add Prompt",
        "btn_save": "Save",
        "ph_server_url": "e.g., http://127.0.0.1:8188",
        "ph_workflow": "Paste your workflow JSON here...",
        "ph_bg_music": "Enter audio file URL...",
        "ph_default_prompts": "e.g., Animate the fire, Make it vivid...",
        "ph_prompt_input": "Enter prompt...",
        
        "msg_sync_success": "Sync complete, associated {n} videos",
        "msg_sync_failed": "Sync failed",
        "msg_checking": "Checking...",
        "msg_connected": "Connected",
        "msg_connect_failed": "Connection Failed",
        "msg_service_unavailable": "Service Unavailable",
        "msg_diagnosing": "Diagnosing...",
        "msg_diagnose_success": "Service Available",
        "msg_diagnose_failed": "Diagnosis Failed",
        "msg_compressing": "Compressing...",
        "msg_save_failed": "Save failed",
        "msg_load_failed": "Load failed",
        "msg_import_success": "Workflow imported successfully",
        "msg_import_failed": "Import failed",
        "msg_export_failed": "Export failed",
        "msg_set_default_success": "Set successfully!",
        "msg_confirm_clear_videos": "Are you sure you want to clear all associated video info?\nThis will cause the system to assume images have no videos and trigger regeneration.",
        "msg_reset_success": "Reset status for {n} images. Videos will be regenerated in Photo Frame mode.",
        "msg_alert_add_image": "Please add images first",
        "msg_confirm_delete_video": "Are you sure you want to delete this video? The file will be permanently removed.",
        "msg_toast_remove_success": "Video removed from list",
        "msg_toast_remove_fail": "Removal failed",
        "msg_progress_upload": "Uploading image",
        "msg_progress_prepare": "Preparing workflow and randomizing seeds/output...",
        "msg_progress_submit": "Submitting workflow to ComfyUI...",
        "msg_progress_waiting": "Generating, waiting for result...",
        "msg_progress_success": "All completed",
        "msg_progress_failed": "Failed",
        "msg_progress_stopped": "Generation stopped",
        "msg_video_load_fail": "Cannot Load",
        "msg_no_video_generated": "No generated videos for this image yet",
        "msg_import_size_limit": "Import failed: File size exceeds 10MB limit",
        "msg_import_yaml_error": "YAML parser not loaded, check network or use JSON",
        "msg_import_invalid": "Invalid file content",
        "msg_import_graph_warn": "Imported workflow seems to be in ComfyUI Graph format, not API format. Generation may fail.",
        "msg_export_empty": "Current workflow is empty, cannot export",
        "msg_export_invalid": "Export failed: Current content is not valid JSON",
        "msg_workflow_empty": "Workflow content is empty, cannot set",
        "msg_workflow_invalid": "Invalid JSON format, please check",
        "msg_list_empty": "List is empty, cannot save",
        "msg_format_error": "Format error",
        "msg_file_format_error": "Load failed: File format error",
        "msg_image_load_fail": "Image load failed",
        "msg_cancelled": "Cancelled",
        "msg_fill_server_url": "Please enter ComfyUI Server URL",
        "diag_ok": "OK",
        "diag_fail": "FAIL",
        "diag_error": "Error",
        "diag_response": "Response",
        "diag_platform": "Platform",
        "diag_gpu": "GPU",

        "day_0": "Sunday",
        "day_1": "Monday",
        "day_2": "Tuesday",
        "day_3": "Wednesday",
        "day_4": "Thursday",
        "day_5": "Friday",
        "day_6": "Saturday"
    }
};

let currentLang = localStorage.getItem('magic_pf_lang') || 'zh';

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('magic_pf_lang', lang);
    applyTranslations();
}

function t(key, params = {}) {
    let str = translations[currentLang][key] || key;
    for (const p in params) {
        str = str.replace(`{${p}}`, params[p]);
    }
    return str;
}

function applyTranslations() {
    // 1. Static text with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });

    // 2. Placeholders with data-i18n-ph
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (translations[currentLang][key]) {
            el.placeholder = translations[currentLang][key];
        }
    });

    // 3. Update Toggle Button Text
    const btn = document.getElementById('langToggleBtn');
    if (btn) {
        btn.textContent = currentLang === 'zh' ? 'EN' : '中';
    }

    // 4. Update specific UI states that might be dynamic but need refresh
    // e.g., default button state
    if (typeof updateDefaultButtonState === 'function') {
        updateDefaultButtonState(); 
    }
}
