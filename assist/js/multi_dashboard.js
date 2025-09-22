document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const getElement = (selector) => document.querySelector(selector);
    const getElements = (selector) => document.querySelectorAll(selector);

    const sidebar = getElement('.sidebar');
    const chatHistory = getElement('.chat-history');
    const newChatBtn = getElement('.new-chat-btn');
    const themeToggleBtn = getElement('#theme-toggle');
    const messagesContainer = getElement('.messages-container');
    const initialPromptsContainer = getElement('#initial-prompts-cards');
    const messagesList = getElement('#messages-list');
    const messageInput = getElement('#message-input');
    const sendBtn = getElement('#send-btn');
    const uploadBtn = getElement('#upload-btn');
    const fileInput = getElement('#file-input');
    const filePreviewContainer = getElement('#file-preview-container');
    const mobileMenuToggle = getElement('.mobile-menu-toggle');
    const desktopSidebarToggle = getElement('#sidebar-toggle-desktop');
    const mobileSidebarCloseBtn = getElement('#mobile-sidebar-close-btn');
    const userProfileButton = getElement('#user-profile-button');
    const userProfilePopover = getElement('#user-profile-popover');
    const accountSettingsModalEl = getElement('#account-settings-modal');
    const supportCenterModalEl = getElement('#support-center-modal');
    const mobileChatTitle = getElement('#mobile-chat-title');
    const mobileNewChatBtn = getElement('#mobile-new-chat-btn');
    const tokenCountText = getElement('#token-count-text');
    const confirmDeleteOverlay = getElement('#confirm-delete-overlay');
    const confirmDeleteDialog = getElement('#confirm-delete-dialog');
    const confirmDeleteMessage = getElement('#confirm-delete-message');
    const confirmDeleteBtn = getElement('#confirm-delete-btn');
    const cancelDeleteBtn = getElement('#cancel-delete-btn');
    const micBtn = getElement('#mic-btn');

    const fileUploadModalEl = getElement('#file-upload-modal');
    const modalFileInput = getElement('#modal-file-input');
    const modalFileInputTrigger = getElement('#modal-file-input-trigger');
    const modalCurrentFilesList = getElement('#modal-current-files-list');
    const modalPreviousFilesList = getElement('#modal-previous-files-list');
    const addSelectedFilesBtn = getElement('#add-selected-files-btn');

    const sidebarSearchBtn = getElement('#sidebar-search-btn');
    const chatSearchPopover = getElement('#chat-search-popover');
    const chatSearchInput = getElement('#chat-search-input');
    const chatSearchCloseBtn = getElement('#chat-search-close-btn');
    const chatSearchResultsContainer = getElement('#chat-search-results-container');
    const newChatFromSearchBtn = getElement('#new-chat-from-search-btn');
    const chatSearchHistoryGroups = getElement('#chat-search-history-groups');
    const chatSearchOverlay = getElement('#chat-search-overlay');

    const confirmLogoutOverlay = getElement('#confirm-logout-overlay');
    const confirmLogoutDialog = getElement('#confirm-logout-dialog');
    const confirmLogoutBtn = getElement('#confirm-logout-btn');
    const cancelLogoutBtn = getElement('#cancel-logout-btn');

    const userAvatarModal = getElement('#user-avatar-modal');
    const avatarUploadInput = getElement('#avatar-upload-input');
    const avatarUploadBtn = getElement('#avatar-upload-btn');
    const displayNameInput = getElement('#display-name');
    const usernameInput = getElement('#username');
    const emailInput = getElement('#email');
    const primaryRoleInput = getElement('#primary-role');
    const userAvatarSidebar = getElement('#user-avatar-sidebar');
    const userNameSidebar = getElement('#user-name-sidebar');
    const userEmailSidebar = getElement('#user-email-sidebar');

    const modelSelectorTriggerBtn = getElement('#model-selector-trigger-btn');
    const modelSelectorPopover = getElement('#model-selector-popover');
    const modelSelectorCurrentName = getElement('#model-selector-current-name');
    const modelSelectorUpgradeBtn = getElement('#model-selector-upgrade-btn');

    const upgradePlanModalEl = getElement('#upgrade-plan-modal');
    const personalPlansContainer = getElement('#personal-plans-container');
    const businessPlansContainer = getElement('#business-plans-container');
    const planToggleButtons = getElements('.plan-toggle-btn');


    let chatData = {};
    let currentChatId = null;
    let uploadedFiles = [];
    let isUserProfilePopoverOpen = false;
    let isChatSearchPopoverOpen = false;
    let isModelSelectorPopoverOpen = false;
    let currentModalId = null;
    let isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    let currentlyOpenHistoryMenu = null;
    let isConfirmDialogOpen = false;
    let isLogoutConfirmDialogOpen = false;
    let modalSelectedFiles = [];
    let previousFilesStore = [];
    let hasSelectedFileInModalSession = false;
    const MAX_PREVIOUS_FILES = 10;
    const MAX_MAIN_PREVIEW_FILES = 5;
    const MAX_AVATAR_SIZE_MB = 2;
    const DEFAULT_AVATAR_SVG = "data:image/svg+xml;charset=UTF-8,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%23E0E0E0'/%3E%3C/svg%3E";
    let currentTokens = 100;

    let recognition = null;
    let isRecording = false;
    let micPermissionState = 'prompt';
    let finalTranscriptForRecognition = '';

    // --- START: Added for Stop Generation ---
    let isAiResponding = false;
    let aiResponseTimeoutId = null;
    let originalSendButtonSVG = '';
    let currentAiMessageElement = null; // Represents the AI's message element (initially loader)
    let stopAiHandlerAttached = false; // To track if the stop handler is currently active

    // Define the stop icon (a simple square, visually similar to the second image context)
    const stopIconSVG = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" class="icon-stop"><rect x="7" y="7" width="10" height="10" rx="1"></rect></svg>`;

    // originalSendButtonSVG will be captured in initializeApp
    // --- END: Added for Stop Generation ---


    const escapeHtml = (str) => { const div = document.createElement('div'); div.appendChild(document.createTextNode(str)); return div.innerHTML; };
    const scrollToBottom = () => { if(messagesContainer) messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' }); };
    
    // Modified enable/disable functions
    const enableSendButton = () => { 
        if(sendBtn && !isAiResponding) sendBtn.disabled = false; 
        // If isAiResponding, button is "stop" and should be enabled (handled by adjustTextareaHeight)
    };
    const disableSendButton = () => { 
        if(sendBtn && !isAiResponding) sendBtn.disabled = true; 
    };

    const showFeedback = (button, text) => { if (!button) return; const originalHtml = button.innerHTML; button.innerHTML = `<span style="font-size: 0.8em;">${text}</span>`; button.disabled = true; setTimeout(() => { if (button && button.closest('.message-actions, .modal-footer, .contact-form, .copy-code-btn, .history-context-menu, .confirm-dialog-actions')) { button.innerHTML = originalHtml; button.disabled = false; } }, 1500); };
    const highlightCodeBlocks = (container = document) => { if (window.Prism) { container.querySelectorAll('pre code[class*="language-"]').forEach(Prism.highlightElement); } };
    const getRelativeDateGroup = (timestamp) => { const now = new Date(); const date = new Date(timestamp); const diffTime = now - date; const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); now.setHours(0, 0, 0, 0); date.setHours(0, 0, 0, 0); const diffDaysNormalized = Math.floor((now - date) / (1000 * 60 * 60 * 24)); if (diffDaysNormalized === 0) return "Today"; if (diffDaysNormalized === 1) return "Yesterday"; if (diffDaysNormalized <= 7) return "Previous 7 Days"; if (diffDaysNormalized <= 30) return "Previous 30 Days"; return "Older"; };

    function copyToClipboard(text) {
        if (!navigator.clipboard) {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed"; textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus(); textArea.select(); document.execCommand('copy');
            document.body.removeChild(textArea);
            return Promise.resolve(true);
        } catch (err) { console.error('Fallback copy failed:', err); return Promise.resolve(false); }
        }
        return navigator.clipboard.writeText(text).then(() => true).catch(err => { console.error('Clipboard copy failed: ', err); return false; });
    }

    const fileIconsSVG = {
        pdf: `<svg viewBox="0 0 24 24" class="file-icon-pdf" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2H6ZM13 3.5V9H18.5L13 3.5Z"/><path d="M7.5 17V14H9V17H7.5ZM12.5 17V14H11V17H12.5ZM14.5 15.5V14H16V15.5C16 16.3284 15.3284 17 14.5 17H14V15.5H14.5Z"/></svg>`,
        doc: `<svg viewBox="0 0 24 24" class="file-icon-doc" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2H6ZM13 3.5V9H18.5L13 3.5Z"/><rect x="7" y="12" width="10" height="2" rx="1"/><rect x="7" y="16" width="7" height="2" rx="1"/></svg>`,
        xls: `<svg viewBox="0 0 24 24" class="file-icon-xls" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2H6ZM13 3.5V9H18.5L13 3.5Z"/><rect x="7" y="12" width="2" height="2" rx="0.5"/><rect x="7" y="15" width="2" height="2" rx="0.5"/><rect x="10.5" y="12" width="2" height="2" rx="0.5"/><rect x="10.5" y="15" width="2" height="2" rx="0.5"/><rect x="14" y="12" width="2" height="2" rx="0.5"/><rect x="14" y="15" width="2" height="2" rx="0.5"/></svg>`,
        ppt: `<svg viewBox="0 0 24 24" class="file-icon-ppt" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2H6ZM13 3.5V9H18.5L13 3.5Z"/><rect x="7" y="12" width="10" height="6" rx="1"/><path d="M10 12V10.5C10 10.2239 10.2239 10 10.5 10H13.5C13.7761 10 14 10.2239 14 10.5V12H10Z"/></svg>`,
        img: `<svg viewBox="0 0 24 24" class="file-icon-img" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 3C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5ZM6.5 7C7.32843 7 8 7.67157 8 8.5C8 9.32843 7.32843 10 6.5 10C5.67157 10 5 9.32843 5 8.5C5 7.67157 5.67157 7 6.5 7ZM6 18L10.5 12L14 16.5L15.5 14.5L19 18H6Z"/></svg>`,
        svg_file: `<svg viewBox="0 0 24 24" class="file-icon-svg_file" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 3C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5ZM9.29289 8.29289C9.68342 7.90237 10.3166 7.90237 10.7071 8.29289L13 10.5858L15.2929 8.29289C15.6834 7.90237 16.3166 7.90237 16.7071 8.29289C17.0976 8.68342 17.0976 9.31658 16.7071 9.70711L14.4142 12L16.7071 14.2929C17.0976 14.6834 17.0976 15.3166 16.7071 15.7071C16.3166 16.0976 15.6834 16.0976 15.2929 15.7071L13 13.4142L10.7071 15.7071C10.3166 16.0976 9.68342 16.0976 9.29289 15.7071C8.90237 15.3166 8.90237 14.6834 9.29289 14.2929L11.5858 12L9.29289 9.70711C8.90237 9.31658 8.90237 8.68342 9.29289 8.29289Z"/></svg>`,
        vid: `<svg viewBox="0 0 24 24" class="file-icon-vid" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V5ZM15 12L9 8V16L15 12Z"/></svg>`,
        aud: `<svg viewBox="0 0 24 24" class="file-icon-aud" fill="currentColor"><path d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17S7.79 21 10 21S14 19.21 14 17V7H18V3H12Z"/></svg>`,
        zip: `<svg viewBox="0 0 24 24" class="file-icon-zip" fill="currentColor"><path d="M20 6H16V4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4V6H4C2.89543 6 2 6.89543 2 8V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V8C22 6.89543 21.1046 6 20 6ZM10 4H14V6H10V4ZM12 17H10V15H12V17ZM12 13H10V11H12V13ZM16 17H14V15H16V17ZM16 13H14V11H16V13Z"/></svg>`,
        code: `<svg viewBox="0 0 24 24" class="file-icon-code" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
        generic: `<svg viewBox="0 0 24 24" class="file-icon-generic" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`
    };
    function getFileIconSVG(fileName, fileType) { const extension = (typeof fileName === 'string' && fileName.includes('.')) ? fileName.split('.').pop().toLowerCase() : ''; if (fileType === 'image/svg+xml' || extension === 'svg') return fileIconsSVG.svg_file; if (typeof fileType === 'string') { if (fileType.startsWith('image/')) return fileIconsSVG.img; if (fileType.startsWith('video/')) return fileIconsSVG.vid; if (fileType.startsWith('audio/')) return fileIconsSVG.aud; if (fileType === 'application/pdf') return fileIconsSVG.pdf; if (fileType === 'application/zip' || ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return fileIconsSVG.zip; } if (['doc', 'docx', 'odt', 'rtf'].includes(extension)) return fileIconsSVG.doc; if (['xls', 'xlsx', 'csv', 'ods'].includes(extension)) return fileIconsSVG.xls; if (['ppt', 'pptx', 'odp'].includes(extension)) return fileIconsSVG.ppt; if (['js', 'py', 'html', 'css', 'java', 'c', 'cpp', 'json', 'xml', 'sh', 'rb', 'php', 'cs', 'ts', 'jsx', 'tsx', 'md', 'log', 'txt'].includes(extension)) return fileIconsSVG.code; if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(extension)) return fileIconsSVG.img; if (['mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm'].includes(extension)) return fileIconsSVG.vid; if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(extension)) return fileIconsSVG.aud; return fileIconsSVG.generic; }
    function cleanFileName(name) { if (typeof name !== 'string') return 'Unnamed File'; return name.replace(/\s*\(\d+(\.\d+)?\s*(kb|kilobytes|mb|megabytes|gb|gigabytes)\)$/i, '').trim(); }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    async function checkMicPermission() { if (!SpeechRecognition) { console.warn("Speech Recognition API not supported."); if(micBtn) { micBtn.disabled = true; micBtn.title = "Speech input not supported"; micBtn.style.display = 'none'; } return 'unsupported'; } try { const permissionStatus = await navigator.permissions.query({ name: 'microphone' }); micPermissionState = permissionStatus.state; permissionStatus.onchange = () => { micPermissionState = permissionStatus.state; if (micPermissionState !== 'granted' && isRecording) stopSpeechRecognition(); if (micBtn) { if (micPermissionState === 'denied') { micBtn.classList.remove('recording'); micBtn.title = "Microphone access denied"; } else if (micPermissionState === 'granted' && !isRecording) { micBtn.title = "Start voice input"; } } }; return micPermissionState; } catch (error) { console.error("Error querying microphone permission:", error); micPermissionState = 'prompt'; return 'prompt'; } }
    function initializeSpeechRecognition() { if (!SpeechRecognition || recognition) return; recognition = new SpeechRecognition(); recognition.continuous = true; recognition.interimResults = true; recognition.lang = navigator.language || 'en-US'; recognition.onstart = () => { isRecording = true; micBtn.classList.add('recording'); micBtn.title = "Stop voice input"; messageInput.placeholder = "Listening continuously..."; }; recognition.onresult = (event) => { let interimTranscript = ''; let newFinalChunk = ''; for (let i = event.resultIndex; i < event.results.length; ++i) { const transcriptPart = event.results[i][0].transcript; if (event.results[i].isFinal) { newFinalChunk += transcriptPart; } else { interimTranscript += transcriptPart; } } if (newFinalChunk) { finalTranscriptForRecognition += (finalTranscriptForRecognition.endsWith(' ') || finalTranscriptForRecognition === '' || newFinalChunk.startsWith(' ') ? '' : ' ') + newFinalChunk; } messageInput.value = finalTranscriptForRecognition + interimTranscript; adjustTextareaHeight(); if (messageInput.value.trim()) enableSendButton(); messageInput.scrollTop = messageInput.scrollHeight; }; recognition.onerror = (event) => { console.error('Speech recognition error:', event.error); if (event.error === 'not-allowed' || event.error === 'service-not-allowed') { micPermissionState = 'denied'; alert("Microphone access was denied. Please enable it in your browser settings."); if(micBtn) micBtn.title = "Microphone access denied"; stopSpeechRecognition(false); } else if (event.error === 'no-speech') {} else if (event.error === 'network') { messageInput.placeholder = "Network error during voice input."; stopSpeechRecognition(false); } else { messageInput.placeholder = "Voice input error. Try again."; stopSpeechRecognition(false); } }; recognition.onend = () => { if (isRecording && micPermissionState === 'granted') { try { setTimeout(() => { if (isRecording && recognition && micPermissionState === 'granted') { recognition.start(); } else if (!isRecording) { stopSpeechRecognition(true); } }, 100); } catch (e) { console.warn("Could not restart recognition on 'onend':", e); stopSpeechRecognition(true); } } else { stopSpeechRecognition(true); } }; }
    function startSpeechRecognition() { if (!recognition) { initializeSpeechRecognition(); if (!recognition) return; } if (isRecording) { if (micBtn && !micBtn.classList.contains('recording')) { micBtn.classList.add('recording'); micBtn.title = "Stop voice input"; messageInput.placeholder = "Listening continuously..."; } return; } if (micPermissionState === 'denied') { alert("Microphone access is denied. Please enable it in your browser settings for this site."); return; } try { finalTranscriptForRecognition = messageInput.value; if (finalTranscriptForRecognition.length > 0 && !finalTranscriptForRecognition.endsWith(' ')) { finalTranscriptForRecognition += ' '; } recognition.start(); } catch (e) { console.warn("Error starting speech recognition:", e); stopSpeechRecognition(); } }
    function stopSpeechRecognition(resetPlaceholder = true) { const wasRecordingBeforeStop = isRecording; isRecording = false; if (recognition && wasRecordingBeforeStop) { recognition.stop(); } if(micBtn) { micBtn.classList.remove('recording'); micBtn.title = (micPermissionState === 'denied') ? "Microphone access denied" : "Start voice input"; } if(resetPlaceholder && messageInput && messageInput.placeholder !== "Type your message or ask a question...") { messageInput.placeholder = "Type your message or ask a question..."; } if (messageInput && messageInput.value.trim()) enableSendButton(); if (messageInput) adjustTextareaHeight(); }
    function toggleSpeechRecognition() { if (!SpeechRecognition) { alert("Sorry, your browser doesn't support speech recognition."); return; } if (isRecording) { stopSpeechRecognition(); } else { if (!recognition) initializeSpeechRecognition(); if (!recognition) return; navigator.permissions.query({ name: 'microphone' }).then(permissionStatus => { micPermissionState = permissionStatus.state; if (micPermissionState === 'prompt' || micPermissionState === 'granted') { startSpeechRecognition(); } else { alert("Microphone access is denied. Please enable it in your browser settings."); if (micBtn) micBtn.title = "Microphone access denied"; } }).catch(err => { console.error("Error querying permission before toggle:", err); startSpeechRecognition(); }); } }

    function loadTheme() { const savedPref = localStorage.getItem('theme') || 'dark'; const useDark = (savedPref === 'system') ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) : (savedPref === 'dark'); applyTheme(useDark ? 'dark' : 'light'); updateThemeUIElements(savedPref); const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)'); mediaQuery.removeEventListener('change', handleSystemThemeChange); if (savedPref === 'system') mediaQuery.addEventListener('change', handleSystemThemeChange); }
    function handleSystemThemeChange(e) { if (localStorage.getItem('theme') === 'system') applyTheme(e.matches ? 'dark' : 'light'); }
    function applyTheme(theme) { document.body.classList.toggle('light-mode', theme === 'light'); document.body.classList.toggle('dark-mode', theme === 'dark'); updateThemeToggleButton(document.body.classList.contains('light-mode')); }
    function updateThemeToggleButton(isActuallyLight) { const savedPref = localStorage.getItem('theme') || 'dark'; let buttonText = "Dark Mode"; let iconHtml = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'; if (savedPref === 'light') { buttonText = "Light Mode"; iconHtml = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'; } else if (savedPref === 'system') { buttonText = "System Theme"; iconHtml = isActuallyLight ? '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>' : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'; } if (themeToggleBtn) { const svgEl = themeToggleBtn.querySelector('svg'); if (svgEl) svgEl.innerHTML = iconHtml; const spanEl = themeToggleBtn.querySelector('#theme-toggle-text'); if (spanEl) spanEl.textContent = buttonText; } }
    function updateThemeUIElements(selectedPref) { getElements('.theme-option').forEach(btn => btn.classList.toggle('active', btn.dataset.theme === selectedPref)); updateThemeToggleButton(document.body.classList.contains('light-mode')); }
    function handleThemeSelection(selectedPref) { localStorage.setItem('theme', selectedPref); loadTheme(); }
    function loadAccentColor() { const savedColor = localStorage.getItem('accentColor') || '#6A5AE0'; applyAccentColor(savedColor); getElements('.accent-color-option').forEach(btn => btn.classList.toggle('active', btn.dataset.color === savedColor)); }
    function applyAccentColor(color) { document.documentElement.style.setProperty('--accent-primary', color); const isLightMode = document.body.classList.contains('light-mode'); let hoverColor = color; try { const amount = isLightMode ? -10 : 10; let R = parseInt(color.substring(1,3),16); let G = parseInt(color.substring(3,5),16); let B = parseInt(color.substring(5,7),16); R = Math.max(0, Math.min(255, parseInt(R * (100 + amount)/100))); G = Math.max(0, Math.min(255, parseInt(G * (100 + amount)/100))); B = Math.max(0, Math.min(255, parseInt(B * (100 + amount)/100))); hoverColor = `#${R.toString(16).padStart(2,'0')}${G.toString(16).padStart(2,'0')}${B.toString(16).padStart(2,'0')}`; } catch(e){} document.documentElement.style.setProperty('--accent-primary-hover', hoverColor); localStorage.setItem('accentColor', color); document.documentElement.style.setProperty('--progress-value', color); }

    function toggleUserProfilePopover(event) { event?.stopPropagation(); isUserProfilePopoverOpen = !isUserProfilePopoverOpen; userProfilePopover?.classList.toggle('show', isUserProfilePopoverOpen); if (isUserProfilePopoverOpen) { if (isChatSearchPopoverOpen) closeChatSearchPopover(); if (isModelSelectorPopoverOpen) closeModelSelectorPopover(); document.body.classList.add('popover-open'); } else if (!isChatSearchPopoverOpen && !isModelSelectorPopoverOpen) { document.body.classList.remove('popover-open'); } }
    function closeUserProfilePopover() { if (isUserProfilePopoverOpen) { isUserProfilePopoverOpen = false; userProfilePopover?.classList.remove('show'); if (!isChatSearchPopoverOpen && !isModelSelectorPopoverOpen) { document.body.classList.remove('popover-open'); } } }
    function openChatSearchPopover() { if (!chatSearchPopover || !chatSearchOverlay) return; if (isUserProfilePopoverOpen) closeUserProfilePopover(); if (isModelSelectorPopoverOpen) closeModelSelectorPopover(); isChatSearchPopoverOpen = true; chatSearchOverlay.classList.add('show'); chatSearchPopover.classList.add('show'); document.body.classList.add('popover-open'); renderChatSearchResults(); setTimeout(() => chatSearchInput?.focus(), 50); }
    function closeChatSearchPopover() { if (isChatSearchPopoverOpen) { isChatSearchPopoverOpen = false; chatSearchPopover?.classList.remove('show'); chatSearchOverlay?.classList.remove('show'); if (chatSearchInput) chatSearchInput.value = ''; if (!isUserProfilePopoverOpen && !isModelSelectorPopoverOpen) { document.body.classList.remove('popover-open'); } } }
    function toggleChatSearchPopover(event) { event?.stopPropagation(); if (isChatSearchPopoverOpen) { closeChatSearchPopover(); } else { openChatSearchPopover(); } }
    function toggleModelSelectorPopover(event) { event?.stopPropagation(); isModelSelectorPopoverOpen = !isModelSelectorPopoverOpen; modelSelectorPopover?.classList.toggle('show', isModelSelectorPopoverOpen); modelSelectorTriggerBtn?.setAttribute('aria-expanded', isModelSelectorPopoverOpen.toString()); if (isModelSelectorPopoverOpen) { if (isUserProfilePopoverOpen) closeUserProfilePopover(); if (isChatSearchPopoverOpen) closeChatSearchPopover(); if (!document.body.classList.contains('popover-open')) { document.body.classList.add('popover-open'); } } else { if (!isUserProfilePopoverOpen && !isChatSearchPopoverOpen) { document.body.classList.remove('popover-open'); } } }
    function closeModelSelectorPopover() { if (isModelSelectorPopoverOpen) { isModelSelectorPopoverOpen = false; modelSelectorPopover?.classList.remove('show'); modelSelectorTriggerBtn?.setAttribute('aria-expanded', 'false'); if (!isUserProfilePopoverOpen && !isChatSearchPopoverOpen) { document.body.classList.remove('popover-open'); } } }
    function selectModel(modelType) { const options = modelSelectorPopover?.querySelectorAll('.model-option-item'); options?.forEach(opt => { opt.classList.remove('active'); opt.setAttribute('aria-checked', 'false'); }); const selectedOption = modelSelectorPopover?.querySelector(`.model-option-item[data-model="${modelType}"]`); selectedOption?.classList.add('active'); selectedOption?.setAttribute('aria-checked', 'true'); if (modelType === 'default') { if(modelSelectorCurrentName) modelSelectorCurrentName.textContent = 'Edu YBAI'; console.log("Selected Model: Edu YBAI (Default)"); } }
    function openModal(modalId) { closeUserProfilePopover(); closeChatSearchPopover(); closeModelSelectorPopover(); const overlay = document.getElementById(`${modalId}-overlay`); const modal = document.getElementById(`${modalId}-modal`); if (overlay && modal) { currentModalId = modalId; overlay.style.display = 'flex'; void overlay.offsetWidth; overlay.classList.add('show'); document.body.classList.add('modal-open'); const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'); if (focusable) setTimeout(() => focusable.focus(), 100); } else { console.error(`Modal/overlay not found for ${modalId}`); } }
    
    function closeModal(modalId = currentModalId) {
        if (!modalId) return;
        const overlay = document.getElementById(`${modalId}-overlay`);
        if (overlay && overlay.classList.contains('show')) {
            overlay.classList.remove('show');
            if (modalId === 'file-upload') {
                hasSelectedFileInModalSession = false;
                console.log('[CloseModal file-upload] hasSelectedFileInModalSession reset to false.');
            }
            const handler = (e) => {
                if (e.target === overlay) {
                    if (currentModalId === modalId && !overlay.classList.contains('show')) {
                        overlay.style.display = 'none';
                        document.body.classList.remove('modal-open');
                        currentModalId = null;
                    }
                    overlay.removeEventListener('transitionend', handler);
                }
            };
            overlay.addEventListener('transitionend', handler);
            setTimeout(() => {
                if (currentModalId === modalId && !overlay.classList.contains('show')) {
                    overlay.style.display = 'none';
                    document.body.classList.remove('modal-open');
                    currentModalId = null;
                    overlay.removeEventListener('transitionend', handler);
                }
            }, 400);
        }
    }
    function switchModalSection(modalElement, sectionId) { if (!modalElement) return; modalElement.querySelectorAll('.modal-nav-item').forEach(item => item.classList.toggle('active', item.dataset.section === sectionId)); modalElement.querySelectorAll('.modal-content .modal-section').forEach(section => section.classList.toggle('active', section.id === `${sectionId}-section`)); const contentArea = modalElement.querySelector('.modal-content'); if(contentArea) contentArea.scrollTop = 0; }

    function openConfirmDialog(chatId, chatTitle) { if (!confirmDeleteOverlay || !confirmDeleteDialog || !confirmDeleteMessage) return; confirmDeleteMessage.textContent = `Are you sure you want to permanently delete the chat "${escapeHtml(chatTitle)}"?`; confirmDeleteDialog.dataset.chatIdToDelete = chatId; confirmDeleteOverlay.style.display = 'flex'; void confirmDeleteOverlay.offsetWidth; confirmDeleteOverlay.classList.add('show'); if (!isLogoutConfirmDialogOpen) document.body.classList.add('confirm-dialog-open'); isConfirmDialogOpen = true; }
    function closeConfirmDialog() { if (!confirmDeleteOverlay || !isConfirmDialogOpen) return; confirmDeleteOverlay.classList.remove('show'); const handler = () => { if (!confirmDeleteOverlay.classList.contains('show')) { confirmDeleteOverlay.style.display = 'none'; confirmDeleteDialog.removeAttribute('data-chat-id-to-delete'); if (!isLogoutConfirmDialogOpen) document.body.classList.remove('confirm-dialog-open'); isConfirmDialogOpen = false; } }; confirmDeleteOverlay.addEventListener('transitionend', handler, { once: true }); setTimeout(() => { if (!confirmDeleteOverlay.classList.contains('show')) { handler(); confirmDeleteOverlay.removeEventListener('transitionend', handler); } }, 300); }
    function openLogoutConfirmDialog() { if (!confirmLogoutOverlay || !confirmLogoutDialog) return; closeUserProfilePopover(); closeChatSearchPopover(); closeModelSelectorPopover(); closeConfirmDialog(); closeModal(); confirmLogoutOverlay.style.display = 'flex'; void confirmLogoutOverlay.offsetWidth; confirmLogoutOverlay.classList.add('show'); document.body.classList.add('confirm-dialog-open'); isLogoutConfirmDialogOpen = true; }
    function closeLogoutConfirmDialog() { if (!confirmLogoutOverlay || !isLogoutConfirmDialogOpen) return; confirmLogoutOverlay.classList.remove('show'); const handler = () => { if (!confirmLogoutOverlay.classList.contains('show')) { confirmLogoutOverlay.style.display = 'none'; if (!isConfirmDialogOpen) document.body.classList.remove('confirm-dialog-open'); isLogoutConfirmDialogOpen = false; } }; confirmLogoutOverlay.addEventListener('transitionend', handler, { once: true }); setTimeout(() => { if (!confirmLogoutOverlay.classList.contains('show')) { handler(); confirmLogoutOverlay.removeEventListener('transitionend', handler); } }, 300); }

    function addInitialPromptCardListeners() { initialPromptsContainer?.querySelectorAll('.prompt-card').forEach(card => { card.removeEventListener('click', handleInitialPromptOrCommandClick); card.addEventListener('click', handleInitialPromptOrCommandClick); }); }
    function addCommandButtonListeners() { initialPromptsContainer?.querySelectorAll('.command-btn').forEach(button => { button.removeEventListener('click', handleInitialPromptOrCommandClick); button.addEventListener('click', handleInitialPromptOrCommandClick); }); }
    function handleInitialPromptOrCommandClick(event) { const element = event.currentTarget; const promptText = element.dataset.prompt || element.textContent.trim(); if(promptText && messageInput) { messageInput.value = promptText; messageInput.focus(); adjustTextareaHeight(); handleSend(); } }

     function loadChatHistory() { const storedChatData = localStorage.getItem('wispaChatData'); chatData = storedChatData ? JSON.parse(storedChatData) : {}; currentChatId = localStorage.getItem('wispaCurrentChatId'); renderChatHistoryList(); if (currentChatId && chatData[currentChatId] && chatData[currentChatId].messages && chatData[currentChatId].messages.length > 0) { loadChat(currentChatId, chatData[currentChatId]?.title || 'Chat'); } else { currentChatId = null; localStorage.removeItem('wispaCurrentChatId'); startNewChat(false); } }
     function renderChatHistoryList() { if (!chatHistory) return; chatHistory.innerHTML = ''; const grouped = {}; const sortedChatIds = Object.keys(chatData).sort((a, b) => { const lastMsgA = chatData[a]?.messages?.slice(-1)[0]?.timestamp || 0; const lastMsgB = chatData[b]?.messages?.slice(-1)[0]?.timestamp || 0; return lastMsgB - lastMsgA; }); sortedChatIds.forEach(chatId => { const chat = chatData[chatId]; if (!chat || !chat.messages || chat.messages.length === 0 || !chat.title) return; const lastMessageTimestamp = chat.messages[chat.messages.length - 1].timestamp; const groupName = getRelativeDateGroup(lastMessageTimestamp); (grouped[groupName] = grouped[groupName] || []).push({ ...chat, id: chatId }); }); const groupOrder = ["Today", "Yesterday", "Previous 7 Days", "Previous 30 Days", "Older"]; groupOrder.forEach(groupName => { if (grouped[groupName]) { const groupDiv = document.createElement('div'); groupDiv.classList.add('history-group'); groupDiv.innerHTML = `<h4>${groupName}</h4>`; const list = document.createElement('ul'); grouped[groupName].sort((a, b) => (b.messages.slice(-1)[0]?.timestamp || 0) - (a.messages.slice(-1)[0]?.timestamp || 0)); grouped[groupName].forEach(item => { const li = document.createElement('li'); li.classList.add('history-list-item'); li.dataset.chatId = item.id; const contentWrapper = document.createElement('div'); contentWrapper.classList.add('history-item-content'); contentWrapper.innerHTML = `<button class="history-item" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</button>`; const optionsBtn = document.createElement('button'); optionsBtn.classList.add('history-options-btn'); optionsBtn.title = "Chat options"; optionsBtn.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>'; const contextMenu = document.createElement('div'); contextMenu.classList.add('history-context-menu'); contextMenu.innerHTML = ` <button class="rename-chat-btn"> <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Rename </button> <button class="delete-chat-btn delete"> <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> Delete </button> `; li.appendChild(contentWrapper); li.appendChild(optionsBtn); li.appendChild(contextMenu); if (item.id === currentChatId) { li.classList.add('active'); } list.appendChild(li); }); groupDiv.appendChild(list); chatHistory.appendChild(groupDiv); } }); }
    function saveChatData() { localStorage.setItem('wispaChatData', JSON.stringify(chatData)); if (currentChatId) { localStorage.setItem('wispaCurrentChatId', currentChatId); } else { localStorage.removeItem('wispaCurrentChatId'); } }
    function addMessageToChat(chatId, messageData) { if (!chatId) { console.error("addMessageToChat: chatId is missing"); return; } if (!chatData[chatId]) { const defaultTitle = messageData.text?.split(' ').slice(0, 4).join(' ') || messageData.text?.substring(0, 30) + (messageData.text?.length > 30 ? '...' : '') || `Chat ${chatId.substring(5)}`; chatData[chatId] = { title: defaultTitle, messages: [] }; } if (!chatData[chatId].messages) { chatData[chatId].messages = []; } chatData[chatId].messages.push(messageData); saveChatData(); renderChatHistoryList(); }
    function loadChat(chatId, chatTitle = 'Chat') { if (!messagesList || !messageInput || !filePreviewContainer) return; const existingMessages = messagesList.querySelectorAll('.message').length > 0; if (currentChatId === chatId && existingMessages) { document.querySelectorAll('.history-list-item.active').forEach(li => li.classList.remove('active')); const newActiveLi = chatHistory?.querySelector(`.history-list-item[data-chat-id="${chatId}"]`); if (newActiveLi) newActiveLi.classList.add('active'); if (mobileChatTitle) mobileChatTitle.textContent = chatTitle; closeMobileSidebarIfNeeded(); messageInput.focus(); return; } currentChatId = chatId; saveChatData(); messagesList.innerHTML = ''; uploadedFiles = []; filePreviewContainer.innerHTML = ''; filePreviewContainer.classList.remove('visible'); messageInput.value = ''; adjustTextareaHeight(); disableSendButton(); const messages = chatData[chatId]?.messages || []; if (messages.length > 0) { initialPromptsContainer?.classList.remove('visible'); messagesList.style.display = 'flex'; messages.forEach(msg => { const attachmentFiles = (msg.attachments || []).map(attInfo => attInfo); displayMessage(msg.text, msg.sender, msg.id, attachmentFiles); }); setTimeout(scrollToBottom, 50); } else { initialPromptsContainer?.classList.add('visible'); messagesList.style.display = 'none'; addInitialPromptCardListeners(); addCommandButtonListeners(); } document.querySelectorAll('.history-list-item.active').forEach(li => li.classList.remove('active')); const newActiveLi = chatHistory?.querySelector(`.history-list-item[data-chat-id="${chatId}"]`); if (newActiveLi) newActiveLi.classList.add('active'); if (mobileChatTitle) mobileChatTitle.textContent = chatTitle; closeMobileSidebarIfNeeded(); messageInput.focus(); }
    function startNewChat(clearMessages = true) {
        console.log('[StartNewChat] Start. Current uploadedFiles:', JSON.stringify(uploadedFiles.map(f => f.name)));
        
        // If AI is responding, stop it before starting a new chat
        if (isAiResponding) {
            handleStopAiResponse();
        }

        currentChatId = null;
        saveChatData();
        if(messagesList) {
            messagesList.innerHTML = '';
            messagesList.style.display = 'none';
        }
        uploadedFiles = [];
        console.log('[StartNewChat] After clearing, uploadedFiles:', JSON.stringify(uploadedFiles.map(f => f.name)));
        if(filePreviewContainer) {
            filePreviewContainer.innerHTML = '';
            filePreviewContainer.classList.remove('visible');
        }
        if(messageInput) {
            messageInput.value = '';
            adjustTextareaHeight();
        }
        disableSendButton();
        document.querySelectorAll('.history-list-item.active').forEach(li => li.classList.remove('active'));
        if(mobileChatTitle) mobileChatTitle.textContent = "New Chat";
        initialPromptsContainer?.classList.add('visible');
        addInitialPromptCardListeners();
        addCommandButtonListeners();
        closeMobileSidebarIfNeeded();
        if(messageInput) messageInput.focus();
    }

    function displayMessage(text, sender, messageId = `msg_${Date.now()}`, attachments = []) {
        if (!messagesList) return null;
        initialPromptsContainer?.classList.remove('visible');
        messagesList.style.display = 'flex';

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.dataset.messageId = messageId;

        let avatarHtml;
        if (sender === 'user') {
            const userAvatarSrc = localStorage.getItem('userAvatar') || DEFAULT_AVATAR_SVG;
            if (userAvatarSrc === DEFAULT_AVATAR_SVG || userAvatarSrc.startsWith('data:image/svg+xml')) {
                avatarHtml = `<svg class="avatar" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>`;
            } else {
                avatarHtml = `<img src="${escapeHtml(userAvatarSrc)}" alt="User Avatar" class="avatar">`;
            }
        } else {
            avatarHtml = `<svg class="avatar" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.07,4.93C17.5,3.36,15.73,2.5,12,2.5S6.5,3.36,4.93,4.93C3.36,6.5,2.5,8.27,2.5,12S3.36,17.5,4.93,19.07C6.5,20.64,8.27,21.5,12,21.5s5.5-0.86,7.07-2.43C20.64,17.5,21.5,15.73,21.5,12S20.64,6.5,19.07,4.93z M12,6.25c1.51,0,2.75,1.24,2.75,2.75S13.51,11.75,12,11.75s-2.75-1.24-2.75-2.75S10.49,6.25,12,6.25z M12,18.25c-2.28,0-4.32-0.93-5.79-2.46c1.02-1.41,3.15-2.29,5.79-2.29s4.77,0.88,5.79,2.29C16.32,17.32,14.28,18.25,12,18.25z" fill="currentColor" /></svg>`;
        }

        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add('message-content');
        messageElement.innerHTML = avatarHtml;
        messageElement.appendChild(messageContentDiv);

        let attachmentsContainer;
        if (attachments && attachments.length > 0) {
            attachmentsContainer = document.createElement('div');
            attachmentsContainer.classList.add('message-attachments');
            attachments.forEach(fileOrRef => {
                if (!fileOrRef || !fileOrRef.name) return;
                const attachmentItem = document.createElement('div');
                attachmentItem.classList.add('message-attachment-item');
                
                const iconSpan = document.createElement('span');
                iconSpan.classList.add('file-icon'); // This span will host either icon or preview
                attachmentItem.appendChild(iconSpan);

                let previewGenerated = false;
                if (fileOrRef instanceof File) { // Only generate previews for actual File objects
                    const isDisplayableImage = fileOrRef.type.startsWith('image/') && fileOrRef.type !== 'image/svg+xml';
                    const isSVG = fileOrRef.type === 'image/svg+xml' || (typeof fileOrRef.name === 'string' && fileOrRef.name.toLowerCase().endsWith('.svg'));

                    if (isDisplayableImage) {
                        const imgPreview = document.createElement('img');
                        imgPreview.classList.add('message-preview-image'); // Class for message image previews
                        imgPreview.alt = "Preview";
                        iconSpan.innerHTML = ''; // Clear for preview
                        iconSpan.appendChild(imgPreview);
                        const reader = new FileReader();
                        reader.onload = (e) => { imgPreview.src = e.target.result; };
                        reader.readAsDataURL(fileOrRef);
                        previewGenerated = true;
                    } else if (isSVG) {
                        const svgPreviewWrapper = document.createElement('div');
                        svgPreviewWrapper.classList.add('message-preview-svg-container'); // Class for message SVG previews
                        iconSpan.innerHTML = ''; 
                        iconSpan.appendChild(svgPreviewWrapper);
                        const reader = new FileReader();
                        reader.onload = (e_reader) => {
                            const svgContent = e_reader.target.result;
                            if (svgContent && typeof svgContent === 'string') {
                                try {
                                    const parser = new DOMParser();
                                    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
                                    const svgElement = svgDoc.documentElement;
                                    if (svgElement && svgElement.nodeName.toLowerCase() === 'svg' && !svgElement.querySelector('parsererror')) {
                                        svgElement.removeAttribute('width'); svgElement.removeAttribute('height'); // Let CSS control size
                                        svgPreviewWrapper.appendChild(svgElement);
                                    } else { svgPreviewWrapper.innerHTML = getFileIconSVG(fileOrRef.name, fileOrRef.type); }
                                } catch (parseError) { svgPreviewWrapper.innerHTML = getFileIconSVG(fileOrRef.name, fileOrRef.type); }
                            } else { svgPreviewWrapper.innerHTML = getFileIconSVG(fileOrRef.name, fileOrRef.type); }
                        };
                        reader.onerror = () => { svgPreviewWrapper.innerHTML = getFileIconSVG(fileOrRef.name, fileOrRef.type); };
                        reader.readAsText(fileOrRef);
                        previewGenerated = true;
                    }
                }
                
                if (!previewGenerated) { // Fallback to icon if not File or not displayable
                    iconSpan.innerHTML = getFileIconSVG(fileOrRef.name, fileOrRef.type);
                }
                
                const displayName = cleanFileName(fileOrRef.name);
                const fileNameSpan = document.createElement('span');
                fileNameSpan.classList.add('file-name');
                fileNameSpan.title = escapeHtml(fileOrRef.name);
                fileNameSpan.textContent = escapeHtml(displayName);
                attachmentItem.appendChild(fileNameSpan);
                attachmentsContainer.appendChild(attachmentItem);
            });
            messageContentDiv.appendChild(attachmentsContainer);
        }


        if (sender === 'ai' && text === '<div class="ai-loader-placeholder"></div>') {
            messageContentDiv.insertAdjacentHTML('beforeend', ` <div class="ai-loader"> <span class="dot"></span><span class="dot"></span><span class="dot"></span> </div>`);
        } else if (text && text.trim() !== '') {
            const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
            const boldRegex = /\*\*(.*?)\*\*/g; 

            let lastIndex = 0;
            const mainTextWrapper = document.createElement('div'); 
            mainTextWrapper.style.whiteSpace = 'pre-wrap'; 
            if (attachmentsContainer) mainTextWrapper.style.marginTop = "8px"; 

            text.replace(codeBlockRegex, (match, lang, code, offset) => {
                if (offset > lastIndex) {
                    const regularTextPart = text.substring(lastIndex, offset);
                    const escapedText = escapeHtml(regularTextPart).replace(boldRegex, '<strong>$1</strong>');
                    const textNode = document.createElement('span'); 
                    textNode.innerHTML = escapedText.replace(/\n/g, '<br>');
                    mainTextWrapper.appendChild(textNode);
                }
                const language = lang ? lang.trim().toLowerCase() : 'plaintext';
                const pre = document.createElement('pre');
                const codeEl = document.createElement('code');
                codeEl.className = `language-${language}`;
                codeEl.textContent = code.trimEnd(); 
                
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-code-btn';
                copyBtn.title = 'Copy code';
                copyBtn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy';
                
                pre.appendChild(codeEl);
                pre.appendChild(copyBtn);
                messageContentDiv.appendChild(pre); 

                lastIndex = offset + match.length;
                return match; 
            });

            if (lastIndex < text.length) {
                const remainingTextPart = text.substring(lastIndex);
                 const escapedText = escapeHtml(remainingTextPart).replace(boldRegex, '<strong>$1</strong>');
                const textNode = document.createElement('span');
                textNode.innerHTML = escapedText.replace(/\n/g, '<br>');
                mainTextWrapper.appendChild(textNode);
            }
            
            if (mainTextWrapper.hasChildNodes()) {
                messageContentDiv.appendChild(mainTextWrapper);
            }
        }

        addMessageActions(messageElement, sender);
        messagesList.appendChild(messageElement);

        if (!(sender === 'ai' && text === '<div class="ai-loader-placeholder"></div>')) {
            highlightCodeBlocks(messageElement);
            setTimeout(scrollToBottom, 50);
        }
        return messageElement;
    }


    function addMessageActions(messageElement, sender) { const existingActions = messageElement.querySelector('.message-actions'); if (existingActions) existingActions.remove(); const actionsContainer = document.createElement('div'); actionsContainer.classList.add('message-actions'); if (sender === 'ai') { actionsContainer.innerHTML = `<button class="action-btn like-btn" title="Like"><svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></button><button class="action-btn dislike-btn" title="Dislike"><svg viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg></button><button class="action-btn copy-btn" title="Copy text"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button><button class="action-btn speak-btn" title="Speak text"><svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg></button><button class="action-btn regenerate-btn" title="Regenerate"><svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg></button>`; } else { actionsContainer.innerHTML = `<button class="action-btn copy-btn" title="Copy text"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button><button class="action-btn edit-btn" title="Edit"><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>`; } messageElement.appendChild(actionsContainer); }
    function handleActionClick(event) { const button = event.target.closest('.action-btn'); if (!button) return; const messageElement = button.closest('.message'); if (!messageElement) { console.error("Could not find parent message element."); return; } const messageId = messageElement.dataset.messageId; const messageContentElement = messageElement.querySelector('.message-content'); if (!messageContentElement) { console.error("Could not find message content element."); return; } const messageText = getMessageText(messageContentElement); if (button.classList.contains('copy-btn')) { copyToClipboard(messageText).then(success => { if (success) showFeedback(button, 'Copied!'); else showFeedback(button, 'Failed'); }); } else if (button.classList.contains('edit-btn')) { enterEditMode(messageElement); } else if (button.classList.contains('like-btn')) { button.classList.toggle('active'); if (button.classList.contains('active')) { messageElement.querySelector('.dislike-btn')?.classList.remove('active'); } } else if (button.classList.contains('dislike-btn')) { button.classList.toggle('active'); if (button.classList.contains('active')) { messageElement.querySelector('.like-btn')?.classList.remove('active'); } } else if (button.classList.contains('speak-btn')) { speakText(messageText, button); } else if (button.classList.contains('regenerate-btn')) { regenerateResponse(messageElement); } }
    function getMessageText(messageContentElement) { const clone = messageContentElement.cloneNode(true); clone.querySelectorAll('.copy-code-btn').forEach(el => el.remove()); clone.querySelector('.ai-loader')?.remove(); clone.querySelectorAll('.message-attachments').forEach(el => el.remove()); clone.querySelectorAll('br').forEach(br => br.replaceWith('\n')); clone.querySelectorAll('pre > code[class*="language-"]').forEach(codeBlock => { const preElement = codeBlock.parentElement; const lang = codeBlock.className.replace(/language-|prism /g, '').trim(); const code = codeBlock.textContent || ''; preElement.replaceWith(`\n\`\`\`${lang}\n${code.trim()}\n\`\`\`\n`); }); let text = clone.textContent || clone.innerText || ""; return text.trim(); }
    function enterEditMode(messageElement) { const contentDiv = messageElement.querySelector('.message-content'); if (!contentDiv || contentDiv.querySelector('.edit-textarea')) return; const originalContentHtml = contentDiv.innerHTML; const messageTextForEdit = getMessageText(contentDiv); messageElement.querySelector('.message-actions')?.style.setProperty('display', 'none', 'important'); const attachmentsContainer = contentDiv.querySelector('.message-attachments'); const attachmentsHtml = attachmentsContainer ? attachmentsContainer.outerHTML : ''; contentDiv.innerHTML = `${attachmentsHtml}<textarea class="edit-textarea" spellcheck="false">${messageTextForEdit}</textarea><div class="edit-controls"><button class="btn-primary save-edit-btn btn-small">Save & Submit</button><button class="btn-secondary cancel-edit-btn btn-small">Cancel</button></div>`; const textarea = contentDiv.querySelector('.edit-textarea'); function adjustEditHeight() { textarea.style.height = 'auto'; textarea.style.height = `${textarea.scrollHeight}px`; } textarea.addEventListener('input', adjustEditHeight); adjustEditHeight(); textarea.focus(); textarea.setSelectionRange(textarea.value.length, textarea.value.length); contentDiv.querySelector('.save-edit-btn').onclick = () => saveEdit(messageElement, textarea.value); contentDiv.querySelector('.cancel-edit-btn').onclick = () => cancelEdit(messageElement, originalContentHtml); }
    
    function saveEdit(messageElement, newText) {
        const messageId = messageElement.dataset.messageId;
        const timestamp = Date.now();
        let nextAiMessage = null;
        let currentElem = messageElement.nextElementSibling;
        while (currentElem && !currentElem.classList.contains('user-message')) {
            if (currentElem.classList.contains('ai-message')) {
                nextAiMessage = currentElem;
                break;
            }
            currentElem = currentElem.nextElementSibling;
        }
        if (nextAiMessage) {
            nextAiMessage.remove();
        }
        messageElement.remove();
        let originalAttachmentsInfo = [];
        let originalAttachmentFiles = [];
        if (currentChatId && chatData[currentChatId]) {
            const originalIdBase = messageId.split('_edited_')[0];
            const originalMsgData = chatData[currentChatId].messages.find(m => m.id.startsWith(originalIdBase));
            if (originalMsgData && originalMsgData.attachments) {
                originalAttachmentsInfo = originalMsgData.attachments.map(att => ({ name: att.name, type: att.type, size: att.size, isPreviousReference: att.isPreviousReference }));
                originalAttachmentFiles = originalAttachmentsInfo.map(attInfo => attInfo);
            }
        }
        const newUserMessageData = {
            sender: 'user',
            text: newText,
            attachments: originalAttachmentsInfo,
            timestamp: timestamp,
            id: messageId.split('_edited_')[0] + '_edited_' + timestamp
        };
        const newUserMessageElement = displayMessage(newText, 'user', newUserMessageData.id, originalAttachmentFiles);
        
        let historyForAI = [];
        if (currentChatId && chatData[currentChatId]) {
            const msgIndex = chatData[currentChatId].messages.findIndex(m => m.id.startsWith(messageId.split('_edited_')[0]));
            if (msgIndex !== -1) {
                chatData[currentChatId].messages[msgIndex] = newUserMessageData;
                if (msgIndex + 1 < chatData[currentChatId].messages.length && chatData[currentChatId].messages[msgIndex + 1].sender === 'ai') {
                    chatData[currentChatId].messages.splice(msgIndex + 1, 1);
                }
                historyForAI = chatData[currentChatId].messages.slice(0, msgIndex + 1);
                saveChatData();
                renderChatHistoryList();
            } else {
                console.warn("Could not find message to replace during edit. Appending new one.");
                addMessageToChat(currentChatId, newUserMessageData);
                historyForAI = [newUserMessageData];
            }
        } else {
            console.error("Cannot save edited message without a currentChatId");
            historyForAI = [newUserMessageData];
        }
        simulateAiResponse(newText, newUserMessageElement, null, historyForAI);
    }

    function cancelEdit(messageElement, originalHtml) { const contentDiv = messageElement.querySelector('.message-content'); if (!contentDiv) return; contentDiv.innerHTML = originalHtml; highlightCodeBlocks(contentDiv); messageElement.querySelector('.message-actions')?.style.removeProperty('display'); }
    
    function regenerateResponse(aiMessageElement) {
        if (isAiResponding) {
            handleStopAiResponse(); // Stop current generation if any
        }

        let previousElement = aiMessageElement.previousElementSibling;
        let userMessageElement = null;
        let conversationHistoryForRegen = [];
        let userMessageText = "";

        if (currentChatId && chatData[currentChatId]) {
            const aiMsgId = aiMessageElement.dataset.messageId;
            const aiMsgIndex = chatData[currentChatId].messages.findIndex(m => m.id === aiMsgId);
            if (aiMsgIndex > 0) {
                for (let i = 0; i < aiMsgIndex; i++) {
                    conversationHistoryForRegen.push(chatData[currentChatId].messages[i]);
                    if (chatData[currentChatId].messages[i].sender === 'user') {
                        userMessageText = chatData[currentChatId].messages[i].text; 
                        userMessageElement = messagesList.querySelector(`.message[data-message-id="${chatData[currentChatId].messages[i].id}"]`);
                    }
                }
            }
             // Remove the AI message that's being regenerated from chatData
            if (aiMsgIndex !== -1) {
                chatData[currentChatId].messages.splice(aiMsgIndex, 1);
                saveChatData();
            }
        }
        
        if (userMessageElement && userMessageText) {
            simulateAiResponse(userMessageText, userMessageElement, aiMessageElement, conversationHistoryForRegen);
        } else {
            const contentDiv = aiMessageElement.querySelector('.message-content');
            if (contentDiv) {
                contentDiv.textContent = "Couldn't find original prompt or history.";
                aiMessageElement.querySelector('.message-actions')?.remove();
            }
        }
    }
    function speakText(text, button) { const cleanedText = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => ` Code block ${lang ? 'in ' + lang : ''}. `).replace(/<[^>]*>/g, "").replace(/\*\*(.*?)\*\*/g, '$1').replace(/#{1,6}\s*(.*)/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\[(.*?)\]\(.*?\)/g, '$1').trim(); if (!cleanedText) { if(button) showFeedback(button, 'No text'); return; } if ('speechSynthesis' in window) { if (speechSynthesis.speaking) { speechSynthesis.cancel(); if(button) showFeedback(button, 'Stopped'); } else { const utterance = new SpeechSynthesisUtterance(cleanedText); utterance.onerror = (event) => { console.error('SpeechSynthesis Error:', event); if(button) showFeedback(button, 'Error'); }; speechSynthesis.speak(utterance); } } else { alert('Text-to-speech is not supported in your browser.'); if(button) showFeedback(button, 'Unsupported'); } }


    // --- START: New function to handle stopping AI response ---
    function handleStopAiResponse() {
        if (!isAiResponding || !aiResponseTimeoutId) return;

        console.log("AI response generation stopped by user.");
        clearTimeout(aiResponseTimeoutId);
        aiResponseTimeoutId = null;
        
        if (currentAiMessageElement && currentAiMessageElement.isConnected) {
            currentAiMessageElement.remove();
        }
        currentAiMessageElement = null;
        isAiResponding = false; 

        if (sendBtn) {
            sendBtn.innerHTML = originalSendButtonSVG;
            sendBtn.title = "Send message";
            if (stopAiHandlerAttached) {
                sendBtn.removeEventListener('click', handleStopAiResponse);
                stopAiHandlerAttached = false;
            }
            if (!sendBtn.getAttribute('listener-send')) { // Avoid multiple handleSend listeners
                sendBtn.addEventListener('click', handleSend);
                sendBtn.setAttribute('listener-send', 'true');
            }
        }
        
        if (messageInput) {
            adjustTextareaHeight(); 
            messageInput.focus();
        }

        if (messagesList && messagesList.children.length === 0 && initialPromptsContainer) {
            initialPromptsContainer.classList.add('visible');
            messagesList.style.display = 'none';
        }
    }
    // --- END: New function ---

    // MODIFIED simulateAiResponse
    function simulateAiResponse(userInput, userMessageElement, aiMessageToReplace = null, conversationHistory = []) {
        if (isAiResponding) { // Prevent multiple AI responses at once
            console.warn("AI is already responding. Please wait or stop the current response.");
            return;
        }

        const messageId = aiMessageToReplace ? aiMessageToReplace.dataset.messageId : `ai_msg_${Date.now()}`;
        let aiMessageElement = aiMessageToReplace;

        if (!aiMessageElement) {
            aiMessageElement = displayMessage('<div class="ai-loader-placeholder"></div>', 'ai', messageId);
        } else { // This path is for regeneration
            const contentDiv = aiMessageElement.querySelector('.message-content');
            if (contentDiv) {
                contentDiv.innerHTML = `<div class="ai-loader"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
                aiMessageElement.querySelector('.message-actions')?.remove();
            } else {
                console.error("Could not find message content div for AI loader.");
                return; // Don't proceed if the element structure is broken
            }
        }
        if (!aiMessageElement) {
            console.error("Failed to get AI message element for loader.");
            return;
        }

        currentAiMessageElement = aiMessageElement; 
        isAiResponding = true;

        if (sendBtn) {
            if (originalSendButtonSVG === '') originalSendButtonSVG = sendBtn.innerHTML; // Ensure it's captured
            if (sendBtn.getAttribute('listener-send')) {
                sendBtn.removeEventListener('click', handleSend);
                sendBtn.removeAttribute('listener-send');
            }
            if (!stopAiHandlerAttached) {
                 sendBtn.addEventListener('click', handleStopAiResponse);
                 stopAiHandlerAttached = true;
            }
            sendBtn.innerHTML = stopIconSVG;
            sendBtn.title = "Stop generating";
            sendBtn.disabled = false; 
        }

        const aiMessageData = { sender: 'ai', text: '', timestamp: Date.now(), id: aiMessageElement.dataset.messageId || messageId };
        let chatIdForData = currentChatId;
        if (!chatIdForData && userMessageElement) {
            const userMsgIdBase = userMessageElement.dataset.messageId.split('_edited_')[0];
            const potentialChatId = Object.keys(chatData).find(id => chatData[id].messages.some(m => m.id === userMessageElement.dataset.messageId || m.id.startsWith(userMsgIdBase)));
            if (potentialChatId) {
                chatIdForData = potentialChatId;
            } else {
                chatIdForData = `chat_${aiMessageData.timestamp}`;
            }
        }
        if (!chatIdForData) {
            console.error("Cannot save AI message without a chat ID");
            handleStopAiResponse(); 
            return;
        }
        
        currentTokens = Math.max(0, currentTokens - 10);
        updateTokenCountDisplay();
        saveTokenCount();

        aiResponseTimeoutId = setTimeout(() => {
            if (!isAiResponding) { 
                console.log("AI response was stopped before completion. Timeout callback executing but will exit.");
                return;
            }
            if (!aiMessageElement || !aiMessageElement.isConnected) {
                console.log("AI message element is no longer connected. Aborting AI response display.");
                isAiResponding = false; 
                if (sendBtn) {
                    sendBtn.innerHTML = originalSendButtonSVG;
                    sendBtn.title = "Send message";
                    if (stopAiHandlerAttached) {
                       sendBtn.removeEventListener('click', handleStopAiResponse);
                       stopAiHandlerAttached = false;
                    }
                     if (!sendBtn.getAttribute('listener-send')) {
                        sendBtn.addEventListener('click', handleSend);
                        sendBtn.setAttribute('listener-send', 'true');
                    }
                    adjustTextareaHeight();
                }
                currentAiMessageElement = null;
                return;
            }

            let historyAck = '';
            if (conversationHistory && conversationHistory.length > 0) {
                const relevantHistoryLength = conversationHistory.filter(msg => msg.id !== aiMessageData.id).length;
                if (relevantHistoryLength > 0) {
                     historyAck = `(Context: ${relevantHistoryLength} previous exchanges)\n`;
                }
            }
            let aiResponseText = aiMessageToReplace
                ? `${historyAck}Regenerated for: "${escapeHtml(userInput)}".\n`
                : `${historyAck}Received: "${escapeHtml(userInput)}".\n`;

            const lowerInput = userInput.toLowerCase();
            if (lowerInput.includes("hello")) aiResponseText += "Hello again!\nHow can I help you today?";
            else if (lowerInput.includes("python")) aiResponseText += "Here's some Python code:\n```python\ndef greet(name):\n  print(f\"Hello, {name}!\")\n\ngreet(\"Developer\")\n# This is an indented comment\n```\nWhat else for Python?";
            else if (lowerInput.includes("css")) aiResponseText += "Here's some CSS:\n```css\nbody {\n  font-family: Arial, sans-serif;\n  line-height: 1.6;\n}\np.highlight {\n  background-color: yellow;\n  /* Indented comment */\n  padding: 10px;\n}\n```\nAny other CSS questions?";
            else aiResponseText += "I've processed your request based on the conversation. Let me know if you need more!";

            aiMessageData.text = aiResponseText;
            const contentDiv = aiMessageElement.querySelector('.message-content');
            if (!contentDiv) {
                 handleStopAiResponse(); 
                 return;
            }
            contentDiv.innerHTML = ''; 

            if (aiResponseText && aiResponseText.trim() !== '') {
                const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
                const boldRegex = /\*\*(.*?)\*\*/g;
                let lastIndex = 0;
                const mainTextWrapper = document.createElement('div');
                mainTextWrapper.style.whiteSpace = 'pre-wrap';

                aiResponseText.replace(codeBlockRegex, (match, lang, code, offset) => {
                    if (offset > lastIndex) {
                        const regularTextPart = aiResponseText.substring(lastIndex, offset);
                        const escapedText = escapeHtml(regularTextPart).replace(boldRegex, '<strong>$1</strong>');
                        const textNode = document.createElement('span'); 
                        textNode.innerHTML = escapedText.replace(/\n/g, '<br>');
                        mainTextWrapper.appendChild(textNode);
                    }
                    const language = lang ? lang.trim().toLowerCase() : 'plaintext';
                    const pre = document.createElement('pre');
                    const codeEl = document.createElement('code');
                    codeEl.className = `language-${language}`;
                    codeEl.textContent = code.trimEnd();
                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'copy-code-btn';
                    copyBtn.title = 'Copy code';
                    copyBtn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy';
                    pre.appendChild(codeEl);
                    pre.appendChild(copyBtn);
                    contentDiv.appendChild(pre);
                    lastIndex = offset + match.length;
                    return match;
                });
                if (lastIndex < aiResponseText.length) {
                    const remainingTextPart = aiResponseText.substring(lastIndex);
                    const escapedText = escapeHtml(remainingTextPart).replace(boldRegex, '<strong>$1</strong>');
                    const textNode = document.createElement('span');
                    textNode.innerHTML = escapedText.replace(/\n/g, '<br>');
                    mainTextWrapper.appendChild(textNode);
                }
                if (mainTextWrapper.hasChildNodes()) {
                     contentDiv.appendChild(mainTextWrapper);
                }
            }
            
            addMessageActions(aiMessageElement, 'ai');
            highlightCodeBlocks(aiMessageElement);
            scrollToBottom();

            if (chatData[chatIdForData]) {
                const existingMsgIndex = chatData[chatIdForData].messages.findIndex(m => m.id === aiMessageData.id);
                if (existingMsgIndex !== -1) {
                    chatData[chatIdForData].messages[existingMsgIndex] = aiMessageData;
                } else {
                    addMessageToChat(chatIdForData, aiMessageData);
                }
                saveChatData();
            } else {
                console.error("Chat data missing for chatId:", chatIdForData);
                addMessageToChat(chatIdForData, aiMessageData);
            }

            isAiResponding = false;
            aiResponseTimeoutId = null;
            currentAiMessageElement = null;
            if (sendBtn) {
                sendBtn.innerHTML = originalSendButtonSVG;
                sendBtn.title = "Send message";
                if (stopAiHandlerAttached) {
                    sendBtn.removeEventListener('click', handleStopAiResponse);
                    stopAiHandlerAttached = false;
                }
                if (!sendBtn.getAttribute('listener-send')) {
                    sendBtn.addEventListener('click', handleSend);
                    sendBtn.setAttribute('listener-send', 'true');
                }
                adjustTextareaHeight(); 
            }

        }, 1200 + Math.random() * 800);
    }
    
    function handleSend() {
        if (isAiResponding) { 
             console.warn("AI is currently responding. Please wait or stop the current response.");
             return;
        }
        console.log('[HandleSend] Start. Current uploadedFiles:', JSON.stringify(uploadedFiles.map(f => f.name)));
        if (!messageInput || !sendBtn) return;
        const text = messageInput.value.trim();
        if (text === '' && uploadedFiles.length === 0) return;
        initialPromptsContainer?.classList.remove('visible');
        if (messagesList) messagesList.style.display = 'flex';
        const timestamp = Date.now();
        const messageId = `msg_${timestamp}`;
        const userMessageText = messageInput.value; 
        let filesToStoreInChatData = [];
        if (uploadedFiles.length > 0) {
            let currentPreviousFiles = JSON.parse(localStorage.getItem('wispaPreviousFiles') || '[]');
            uploadedFiles.forEach(fileOrRef => {
                filesToStoreInChatData.push({
                    name: fileOrRef.name,
                    type: fileOrRef.type,
                    size: fileOrRef instanceof File ? fileOrRef.size : (fileOrRef.size || 0),
                    isPreviousReference: !!fileOrRef.isPreviousReference
                });
                if (fileOrRef instanceof File) {
                    if (!currentPreviousFiles.some(pf => pf.name === fileOrRef.name)) {
                        currentPreviousFiles.unshift({ name: fileOrRef.name, type: fileOrRef.type });
                    }
                }
            });
            previousFilesStore = currentPreviousFiles.slice(0, MAX_PREVIOUS_FILES);
            localStorage.setItem('wispaPreviousFiles', JSON.stringify(previousFilesStore));
        }
        let tempCurrentChatId = currentChatId;
        if (!tempCurrentChatId) {
            tempCurrentChatId = `chat_${timestamp}`;
            currentChatId = tempCurrentChatId;
            let title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
            if (!title && filesToStoreInChatData.length > 0 && filesToStoreInChatData[0]) {
                title = "Chat with " + cleanFileName(filesToStoreInChatData[0].name);
            } else if (!title) {
                title = "New Chat";
            }
            chatData[currentChatId] = { title: title, messages: [] };
            saveChatData();
            renderChatHistoryList();
            setTimeout(() => {
                getElement(`.history-list-item[data-chat-id="${currentChatId}"]`)?.classList.add('active');
            }, 0);
        }
        const userMessageData = {
            sender: 'user',
            text: userMessageText, 
            attachments: filesToStoreInChatData,
            timestamp: timestamp,
            id: messageId
        };
        const userMsgElement = displayMessage(userMessageText, 'user', messageId, uploadedFiles);
        addMessageToChat(currentChatId, userMessageData); 

        let historyForAI = [];
        if (currentChatId && chatData[currentChatId] && chatData[currentChatId].messages) {
            historyForAI = [...chatData[currentChatId].messages]; 
        }
        
        simulateAiResponse(userMessageText, userMsgElement, null, historyForAI);

        console.log('[HandleSend] Before clearing, uploadedFiles:', JSON.stringify(uploadedFiles.map(f => f.name)));
        messageInput.value = '';
        uploadedFiles = [];
        console.log('[HandleSend] After clearing, uploadedFiles:', JSON.stringify(uploadedFiles.map(f => f.name)));
        if(filePreviewContainer) {
            filePreviewContainer.innerHTML = '';
            filePreviewContainer.classList.remove('visible');
        }
        adjustTextareaHeight();
    }

    // MODIFIED adjustTextareaHeight
    function adjustTextareaHeight() { 
        if (!messageInput) return; 
        messageInput.style.height = 'auto'; 
        const maxHeight = parseInt(window.getComputedStyle(messageInput).maxHeight, 10) || 150; 
        const scrollHeight = messageInput.scrollHeight; 
        messageInput.style.height = `${Math.min(scrollHeight, maxHeight)}px`; 
        
        if (sendBtn && isAiResponding) { 
            sendBtn.disabled = false; // Stop button is always enabled
        } else if (sendBtn) { 
            if (messageInput.value.trim() !== '' || uploadedFiles.length > 0) { 
                if (currentTokens > 0) sendBtn.disabled = false; // enableSendButton()
                else sendBtn.disabled = true; // disableSendButton()
            } else { 
                sendBtn.disabled = true; // disableSendButton()
            } 
        } 
    }

    function addFilePreview(file) { if (!filePreviewContainer) return; const item = createFilePreviewItemDOM(file, false, false); item.querySelector('.remove-file-btn').addEventListener('click', (e) => { e.stopPropagation(); removeFileFromMainPreview(file.name); }); filePreviewContainer.appendChild(item); filePreviewContainer.classList.add('visible'); }
    function removeFileFromMainPreview(fileName) { const originalLength = uploadedFiles.length; uploadedFiles = uploadedFiles.filter(f => f.name !== fileName); if (!filePreviewContainer) return; const item = filePreviewContainer.querySelector(`.file-preview-item[data-file-name="${CSS.escape(fileName)}"]`); if (item) item.remove(); if (uploadedFiles.length === 0) { filePreviewContainer.classList.remove('visible'); } if (originalLength > uploadedFiles.length) { adjustTextareaHeight(); } }

    const _handleModalFileTriggerClick = (event) => {
        event.preventDefault();
        console.log('[ModalTrigger Click] Attempting trigger. hasSelectedFileInModalSession:', hasSelectedFileInModalSession);
        if (!hasSelectedFileInModalSession) {
            modalFileInput?.click();
        } else {
            console.log('[ModalTrigger Click] File already selected in this session, preventing new dialog.');
        }
    };

    const _handleModalFileInputChange = (event) => {
        console.log('[ModalFileChange] Files selected or dialog cancelled.');
        const files = event.target.files;
        if (!files || files.length === 0) {
            console.log('[ModalFileChange] No files were selected (dialog likely cancelled).');
            event.target.value = '';
            return;
        }
        let newFilesAddedToModal = false;
        for (const file of files) {
            if (!modalSelectedFiles.some(f => f instanceof File && f.name === file.name && f.size === file.size)) {
                if (file.size > 15 * 1024 * 1024) {
                    alert(`File "${file.name}" exceeds 15MB limit.`);
                    continue;
                }
                modalSelectedFiles.push(file);
                newFilesAddedToModal = true;
            }
        }
        if (newFilesAddedToModal) {
            console.log('[ModalFileChange] New files added to modal list.');
            updateModalCurrentFilesList();
            hasSelectedFileInModalSession = true;
            console.log('[ModalFileChange] hasSelectedFileInModalSession set to true.');
        } else {
            console.log('[ModalFileChange] No *new* files added (duplicates or empty selection). Flag not set if no new files.');
        }
        event.target.value = '';
    };

    const _handleAddSelectedFilesBtnClick = () => addModalFilesToChat();
    const _handleModalCurrentFilesListClick = (e) => { const removeBtn = e.target.closest('.remove-file-btn'); if (removeBtn) { const fileName = removeBtn.closest('.file-preview-item').dataset.fileName; removeFileFromModalCurrent(fileName); } };
    const _handleModalPreviousFilesListClick = (e) => { const addBtn = e.target.closest('.add-previous-file-btn'); const removeFromHistoryBtn = e.target.closest('.remove-from-previous-list-btn'); if (addBtn) { const fileItemElement = addBtn.closest('.file-preview-item'); const fileName = fileItemElement.dataset.fileName; const fileType = fileItemElement.dataset.fileType || 'application/octet-stream'; const fileRef = { name: fileName, type: fileType, size: 0, isPreviousReference: true }; if (!modalSelectedFiles.some(f => f.name === fileRef.name && f.isPreviousReference === fileRef.isPreviousReference)) { modalSelectedFiles.push(fileRef); updateModalCurrentFilesList(); addBtn.disabled = true; addBtn.textContent = 'Added'; } } else if (removeFromHistoryBtn) { const fileItemElement = removeFromHistoryBtn.closest('.file-preview-item'); const fileName = fileItemElement.dataset.fileName; removeFileFromPreviousFilesStore(fileName); } };
    
    function setupFileUploadModalListeners() {
        if (modalFileInputTrigger) {
            if (modalFileInputTrigger._wispaClickHandler) modalFileInputTrigger.removeEventListener('click', modalFileInputTrigger._wispaClickHandler);
            modalFileInputTrigger._wispaClickHandler = _handleModalFileTriggerClick;
            modalFileInputTrigger.addEventListener('click', modalFileInputTrigger._wispaClickHandler);
        }
        if (modalFileInput) {
            if (modalFileInput._wispaChangeHandler) modalFileInput.removeEventListener('change', modalFileInput._wispaChangeHandler);
            modalFileInput._wispaChangeHandler = _handleModalFileInputChange;
            modalFileInput.addEventListener('change', modalFileInput._wispaChangeHandler);
        }
        if (addSelectedFilesBtn) {
            if (addSelectedFilesBtn._wispaClickHandler) addSelectedFilesBtn.removeEventListener('click', addSelectedFilesBtn._wispaClickHandler);
            addSelectedFilesBtn._wispaClickHandler = _handleAddSelectedFilesBtnClick;
            addSelectedFilesBtn.addEventListener('click', addSelectedFilesBtn._wispaClickHandler);
        }
        if (modalCurrentFilesList) {
            if (modalCurrentFilesList._wispaClickHandler) modalCurrentFilesList.removeEventListener('click', modalCurrentFilesList._wispaClickHandler);
            modalCurrentFilesList._wispaClickHandler = _handleModalCurrentFilesListClick;
            modalCurrentFilesList.addEventListener('click', modalCurrentFilesList._wispaClickHandler);
        }
        if (modalPreviousFilesList) {
            if (modalPreviousFilesList._wispaClickHandler) modalPreviousFilesList.removeEventListener('click', modalPreviousFilesList._wispaClickHandler);
            modalPreviousFilesList._wispaClickHandler = _handleModalPreviousFilesListClick;
            modalPreviousFilesList.addEventListener('click', modalPreviousFilesList._wispaClickHandler);
        }
    }

    function updateModalCurrentFilesList() {
        if (!modalCurrentFilesList) return;
        modalCurrentFilesList.innerHTML = '';
        if (modalSelectedFiles.length === 0) {
            modalCurrentFilesList.innerHTML = `<p class="empty-list-placeholder">No files selected yet.</p>`;
            if(addSelectedFilesBtn) addSelectedFilesBtn.disabled = true;
            return;
        }
        modalSelectedFiles.forEach(fileOrRef => {
            const item = createFilePreviewItemDOM(fileOrRef, true, false);
            modalCurrentFilesList.appendChild(item);
        });
        if(addSelectedFilesBtn) addSelectedFilesBtn.disabled = modalSelectedFiles.length === 0;
    }

    function removeFileFromModalCurrent(fileName) {
        const removedFile = modalSelectedFiles.find(f => f.name === fileName);
        modalSelectedFiles = modalSelectedFiles.filter(f => f.name !== fileName);
        updateModalCurrentFilesList();
        if (removedFile && removedFile.isPreviousReference) {
            const prevFileButton = modalPreviousFilesList?.querySelector(`.file-preview-item[data-file-name="${CSS.escape(fileName)}"] .add-previous-file-btn`);
            if (prevFileButton) {
                prevFileButton.disabled = false;
                prevFileButton.textContent = 'Add';
            }
        }
        if (modalSelectedFiles.length === 0) {
            hasSelectedFileInModalSession = false;
            console.log('[removeFileFromModalCurrent] hasSelectedFileInModalSession reset as list is empty.');
        }
    }
    
    function createFilePreviewItemDOM(fileOrRef, isModalCurrentItem, isPreviousListItem = false) {
        const item = document.createElement('div');
        item.classList.add('file-preview-item');
        item.dataset.fileName = fileOrRef.name;
        if (fileOrRef.type) item.dataset.fileType = fileOrRef.type;
    
        const iconSpan = document.createElement('span'); 
        iconSpan.classList.add('file-icon'); 
        item.appendChild(iconSpan);
    
        let previewGenerated = false;
        // Only attempt to generate rich previews for actual File objects
        if (fileOrRef instanceof File) { 
            const isDisplayableImage = fileOrRef.type.startsWith('image/') && fileOrRef.type !== 'image/svg+xml';
            const isSVG = fileOrRef.type === 'image/svg+xml' || (typeof fileOrRef.name === 'string' && fileOrRef.name.toLowerCase().endsWith('.svg'));
    
            if (isDisplayableImage) {
                const imgPreview = document.createElement('img');
                imgPreview.alt = "Preview";
                // Add context-specific class for styling
                imgPreview.classList.add(
                    isModalCurrentItem ? 'file-preview-image' : 'main-input-preview-image'
                );
                iconSpan.innerHTML = ''; // Clear default icon placeholder for preview element
                iconSpan.appendChild(imgPreview);
                const reader = new FileReader();
                reader.onload = (e) => { imgPreview.src = e.target.result; };
                reader.readAsDataURL(fileOrRef);
                previewGenerated = true;
            } else if (isSVG) {
                const svgPreviewWrapper = document.createElement('div');
                svgPreviewWrapper.classList.add(
                    isModalCurrentItem ? 'file-preview-svg-container' : 'main-input-svg-preview-wrapper'
                );
                iconSpan.innerHTML = '';
                iconSpan.appendChild(svgPreviewWrapper);
                const reader = new FileReader();
                reader.onload = (e_reader) => {
                    const svgContent = e_reader.target.result;
                    if (svgContent && typeof svgContent === 'string') {
                        try {
                            const parser = new DOMParser();
                            const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
                            const svgElement = svgDoc.documentElement;
                            if (svgElement && svgElement.nodeName.toLowerCase() === 'svg' && !svgElement.querySelector('parsererror')) {
                                svgElement.removeAttribute('width'); // Let CSS control dimensions
                                svgElement.removeAttribute('height');
                                svgPreviewWrapper.appendChild(svgElement);
                            } else { // Parsing error or not an SVG
                                svgPreviewWrapper.innerHTML = getFileIconSVG(fileOrRef.name, fileOrRef.type);
                            }
                        } catch (parseError) { // Catch any parsing error
                            console.warn("Error parsing SVG for preview:", parseError);
                            svgPreviewWrapper.innerHTML = getFileIconSVG(fileOrRef.name, fileOrRef.type);
                        }
                    } else { // If svgContent is not a string
                        svgPreviewWrapper.innerHTML = getFileIconSVG(fileOrRef.name, fileOrRef.type);
                    }
                };
                reader.onerror = () => { // FileReader error
                    svgPreviewWrapper.innerHTML = getFileIconSVG(fileOrRef.name, fileOrRef.type);
                };
                reader.readAsText(fileOrRef);
                previewGenerated = true;
            }
        }
    
        // If no rich preview was generated (e.g., not a File, or not image/SVG), show fallback icon
        if (!previewGenerated) {
            iconSpan.innerHTML = getFileIconSVG(fileOrRef.name, fileOrRef.type);
        }
    
        const displayName = cleanFileName(fileOrRef.name);
        const fileNameSpan = document.createElement('span');
        fileNameSpan.classList.add('file-name');
        fileNameSpan.title = escapeHtml(fileOrRef.name);
        let fileNameDisplayText = escapeHtml(displayName);
        if (fileOrRef.isPreviousReference && isModalCurrentItem) {
            fileNameDisplayText += ` <em style="font-size:0.8em; color:var(--text-secondary)">(previous)</em>`;
        }
        fileNameSpan.innerHTML = fileNameDisplayText;
        item.appendChild(fileNameSpan);
    
        // Add appropriate remove/add buttons based on context
        if (isModalCurrentItem) { // "Selected Files" list in Modal
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-file-btn';
            removeBtn.title = 'Remove this file from current selection';
            removeBtn.innerHTML = '×';
            item.appendChild(removeBtn);
        } else if (isPreviousListItem) { // "Previously Used Files" list in Modal
            const addBtn = document.createElement('button');
            addBtn.className = 'add-previous-file-btn';
            addBtn.title = 'Add this file to current selection';
            addBtn.textContent = 'Add';
            if (modalSelectedFiles.some(sf => sf.isPreviousReference && sf.name === fileOrRef.name)) {
                addBtn.disabled = true;
                addBtn.textContent = 'Added';
            }
            item.appendChild(addBtn);
            const removeHistoryBtn = document.createElement('button');
            removeHistoryBtn.className = 'remove-from-previous-list-btn';
            removeHistoryBtn.title = 'Remove this file from previously used list permanently';
            removeHistoryBtn.innerHTML = '×';
            item.appendChild(removeHistoryBtn);
        } else { // For main input area preview (filePreviewContainer)
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-file-btn';
            removeBtn.title = 'Remove this file';
            removeBtn.innerHTML = '×';
            item.appendChild(removeBtn);
        }
        return item;
    }


    function loadPreviousFilesToModal() { if (!modalPreviousFilesList) return; const storedFiles = JSON.parse(localStorage.getItem('wispaPreviousFiles') || '[]'); previousFilesStore = storedFiles; modalPreviousFilesList.innerHTML = ''; if (previousFilesStore.length === 0) { modalPreviousFilesList.innerHTML = `<p class="empty-list-placeholder">No previously used files.</p>`; return; } previousFilesStore.forEach(fileInfo => { const item = createFilePreviewItemDOM(fileInfo, false, true); modalPreviousFilesList.appendChild(item); }); }
    function removeFileFromPreviousFilesStore(fileNameToRemove) { previousFilesStore = previousFilesStore.filter(file => file.name !== fileNameToRemove); localStorage.setItem('wispaPreviousFiles', JSON.stringify(previousFilesStore)); loadPreviousFilesToModal(); const wasSelectedAsPreviousRef = modalSelectedFiles.find(f => f.name === fileNameToRemove && f.isPreviousReference); if (wasSelectedAsPreviousRef) { modalSelectedFiles = modalSelectedFiles.filter(f => !(f.name === fileNameToRemove && f.isPreviousReference)); updateModalCurrentFilesList(); } }
    
    function addModalFilesToChat() {
        console.log('[AddModalFilesToChat] Start. Current uploadedFiles:', JSON.stringify(uploadedFiles.map(f => f.name)));
        console.log('[AddModalFilesToChat] modalSelectedFiles to be added:', JSON.stringify(modalSelectedFiles.map(f => f.name)));
        let filesAddedToMainPreviewThisTime = 0;
        let limitReachedAlertShown = false;
        modalSelectedFiles.forEach(modalFileOrRef => {
            let alreadyInMainPreview = false;
            if (modalFileOrRef instanceof File) {
                alreadyInMainPreview = uploadedFiles.some(f => f instanceof File && f.name === modalFileOrRef.name && f.size === modalFileOrRef.size);
            } else if (modalFileOrRef.isPreviousReference) {
                alreadyInMainPreview = uploadedFiles.some(f => f.isPreviousReference && f.name === modalFileOrRef.name);
            }
            if (!alreadyInMainPreview) {
                if (uploadedFiles.length < MAX_MAIN_PREVIEW_FILES) {
                    uploadedFiles.push(modalFileOrRef);
                    console.log('[AddModalFilesToChat] Added to uploadedFiles:', modalFileOrRef.name, 'New uploadedFiles:', JSON.stringify(uploadedFiles.map(f => f.name)));
                    addFilePreview(modalFileOrRef);
                    filesAddedToMainPreviewThisTime++;
                } else if (!limitReachedAlertShown) {
                    alert(`Maximum of ${MAX_MAIN_PREVIEW_FILES} file previews reached. Some files were not added.`);
                    limitReachedAlertShown = true;
                }
            }
        });
        if (uploadedFiles.length > 0 && filePreviewContainer) filePreviewContainer.classList.add('visible');
        if (uploadedFiles.length > 0 || (messageInput && messageInput.value.trim() !== '')) {
            if (currentTokens > 0) enableSendButton();
        }
        if (messageInput) adjustTextareaHeight();
        console.log('[AddModalFilesToChat] End. Final uploadedFiles:', JSON.stringify(uploadedFiles.map(f => f.name)));
        modalSelectedFiles = [];
        console.log('[AddModalFilesToChat] modalSelectedFiles cleared after adding to chat.');
        hasSelectedFileInModalSession = false; 
        console.log('[AddModalFilesToChat] hasSelectedFileInModalSession reset to false.');
        modalPreviousFilesList?.querySelectorAll('.add-previous-file-btn').forEach(btn => {
            btn.disabled = false;
            btn.textContent = 'Add';
        });
        closeModal('file-upload');
    }

    function setupToggleSwitch(modal, switchId, storageKey, defaultValue = false, callback = null) { const toggleInput = modal?.querySelector(`#${switchId}`); if (!toggleInput) return; const savedValue = localStorage.getItem(storageKey); const initialValue = (savedValue !== null) ? (savedValue === 'true') : defaultValue; toggleInput.checked = initialValue; if (callback) callback(initialValue, true); toggleInput.addEventListener('change', (e) => { const enabled = e.target.checked; localStorage.setItem(storageKey, enabled); if (callback) callback(enabled, false); }); }
    function setupAllToggleSwitches() { setupToggleSwitch(accountSettingsModalEl, 'message-history', 'setting_messageHistory', true); setupToggleSwitch(accountSettingsModalEl, 'code-highlighting', 'setting_codeHighlighting', true); setupToggleSwitch(accountSettingsModalEl, 'ai-suggestions', 'setting_aiSuggestions', false); setupToggleSwitch(accountSettingsModalEl, 'e2e-encryption', 'security_e2eEncryption', false); setupToggleSwitch(accountSettingsModalEl, 'auto-delete', 'security_autoDelete', false); setupToggleSwitch(accountSettingsModalEl, 'two-factor', 'security_2fa', false); setupToggleSwitch(accountSettingsModalEl, 'message-bubbles', 'appearance_messageBubbles', true); setupToggleSwitch(accountSettingsModalEl, 'compact-mode', 'appearance_compactMode', false, (enabled) => { messagesContainer?.classList.toggle('compact-mode', enabled); }); setupToggleSwitch(accountSettingsModalEl, 'large-font', 'appearance_largeFont', false, (enabled) => { document.body.classList.toggle('large-font-mode', enabled); }); }

    function applySidebarCollapsedState() { sidebar?.classList.toggle('collapsed', isSidebarCollapsed); if(desktopSidebarToggle) { desktopSidebarToggle.innerHTML = isSidebarCollapsed ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>'; } }
    function toggleDesktopSidebar() { isSidebarCollapsed = !isSidebarCollapsed; localStorage.setItem('sidebarCollapsed', isSidebarCollapsed); applySidebarCollapsedState(); }
    function openMobileSidebar() { document.body.classList.add('sidebar-open'); }
    function closeMobileSidebar() { document.body.classList.remove('sidebar-open'); }
    function closeMobileSidebarIfNeeded() { if (window.innerWidth <= 768 && document.body.classList.contains('sidebar-open')) closeMobileSidebar(); }

    function toggleHistoryContextMenu(menu) { if (currentlyOpenHistoryMenu && currentlyOpenHistoryMenu !== menu) currentlyOpenHistoryMenu.classList.remove('show'); if (menu) { menu.classList.toggle('show'); currentlyOpenHistoryMenu = menu.classList.contains('show') ? menu : null; } else if (currentlyOpenHistoryMenu) { currentlyOpenHistoryMenu.classList.remove('show'); currentlyOpenHistoryMenu = null; } }
    function enterRenameMode(listItem, chatId) { const contentWrapper = listItem.querySelector('.history-item-content'); const currentButton = contentWrapper.querySelector('.history-item'); if (!currentButton) return; const currentTitle = chatData[chatId]?.title || currentButton.textContent; const input = document.createElement('input'); input.type = 'text'; input.value = currentTitle; input.classList.add('history-rename-input'); input.maxLength = 50; contentWrapper.innerHTML = ''; contentWrapper.appendChild(input); input.select(); input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); saveChatRename(listItem, chatId, input.value); } else if (e.key === 'Escape') { cancelRenameMode(listItem, chatId, currentTitle); } }); input.addEventListener('blur', () => { const newTitle = input.value.trim(); if (newTitle && newTitle !== currentTitle) saveChatRename(listItem, chatId, newTitle); else cancelRenameMode(listItem, chatId, currentTitle); }); toggleHistoryContextMenu(null); }
    function saveChatRename(listItem, chatId, newTitle) { newTitle = newTitle.trim(); if (!newTitle) { cancelRenameMode(listItem, chatId, chatData[chatId]?.title || ''); return; } if (chatData[chatId]) { chatData[chatId].title = newTitle; saveChatData(); renderChatHistoryList(); renderChatSearchResults(chatSearchInput?.value || ''); if (chatId === currentChatId) { const updatedLi = chatHistory?.querySelector(`.history-list-item[data-chat-id="${chatId}"]`); if(updatedLi) updatedLi.classList.add('active'); if (mobileChatTitle) mobileChatTitle.textContent = newTitle; } } }
    function cancelRenameMode(listItem, chatId, originalTitle) { const contentWrapper = listItem.querySelector('.history-item-content'); if (!contentWrapper) return; contentWrapper.innerHTML = `<button class="history-item" title="${escapeHtml(originalTitle)}">${escapeHtml(originalTitle)}</button>`; }
    function confirmDeleteChat(listItem, chatId) { const chatTitle = chatData[chatId]?.title || `Chat ID ${chatId}`; openConfirmDialog(chatId, chatTitle); toggleHistoryContextMenu(null); }
    function deleteChat(chatId) { if (chatData[chatId]) { const wasActive = (currentChatId === chatId); delete chatData[chatId]; saveChatData(); renderChatHistoryList(); renderChatSearchResults(chatSearchInput?.value || ''); if (wasActive) startNewChat(true); } }

     function renderChatSearchResults(searchTerm = '') { if (!chatSearchHistoryGroups) return; chatSearchHistoryGroups.innerHTML = ''; const lowerSearchTerm = searchTerm.toLowerCase(); const filteredChats = {}; const sortedChatIds = Object.keys(chatData).sort((a, b) => (chatData[b]?.messages?.slice(-1)[0]?.timestamp || 0) - (chatData[a]?.messages?.slice(-1)[0]?.timestamp || 0)); sortedChatIds.forEach(chatId => { const chat = chatData[chatId]; if (!chat || !chat.messages || chat.messages.length === 0 || !chat.title) return; if (searchTerm === '' || chat.title.toLowerCase().includes(lowerSearchTerm)) { const lastMessageTimestamp = chat.messages[chat.messages.length - 1].timestamp; const groupName = getRelativeDateGroup(lastMessageTimestamp); (filteredChats[groupName] = filteredChats[groupName] || []).push({ ...chat, id: chatId }); } }); const groupOrder = ["Today", "Yesterday", "Previous 7 Days", "Previous 30 Days", "Older"]; let resultsFound = false; groupOrder.forEach(groupName => { if (filteredChats[groupName]) { resultsFound = true; const groupDiv = document.createElement('div'); groupDiv.classList.add('history-group'); groupDiv.innerHTML = `<h4>${groupName}</h4>`; const list = document.createElement('ul'); filteredChats[groupName].sort((a, b) => (b.messages.slice(-1)[0]?.timestamp || 0) - (a.messages.slice(-1)[0]?.timestamp || 0)); filteredChats[groupName].forEach(item => { const li = document.createElement('li'); li.classList.add('popover-item', 'search-result-item'); li.dataset.chatId = item.id; if (item.id === currentChatId) li.classList.add('active'); li.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> <span>${escapeHtml(item.title)}</span>`; li.addEventListener('click', () => { loadChat(item.id, item.title); closeChatSearchPopover(); }); list.appendChild(li); }); groupDiv.appendChild(list); chatSearchHistoryGroups.appendChild(groupDiv); } }); if (!resultsFound && searchTerm !== '') { chatSearchHistoryGroups.innerHTML = `<p style="padding: 10px 15px; color: var(--text-placeholder);">No chats found for "${escapeHtml(searchTerm)}".</p>`; } else if (!resultsFound && searchTerm === '') { chatSearchHistoryGroups.innerHTML = `<p style="padding: 10px 15px; color: var(--text-placeholder);">No chats yet. Start a new one!</p>`; } }

    function setupInitialView() { if (initialPromptsContainer?.classList.contains('visible')) { addInitialPromptCardListeners(); addCommandButtonListeners(); } }

    function loadUserSettings() { const savedName = localStorage.getItem('userDisplayName') || "Erica"; const savedUsername = localStorage.getItem('userUsername') || ""; const savedEmail = localStorage.getItem('userEmail') || "erica@example.com"; const savedRole = localStorage.getItem('userPrimaryRole') || ""; const savedAvatar = localStorage.getItem('userAvatar') || DEFAULT_AVATAR_SVG; if(userNameSidebar) userNameSidebar.textContent = savedName; if(userEmailSidebar) userEmailSidebar.textContent = savedEmail; if(userAvatarSidebar) userAvatarSidebar.src = savedAvatar; if(displayNameInput) displayNameInput.value = savedName; if(usernameInput) usernameInput.value = savedUsername; if(emailInput) emailInput.value = savedEmail; if(primaryRoleInput) primaryRoleInput.value = savedRole; if(userAvatarModal) userAvatarModal.src = savedAvatar; }
    function saveUserSettings() { const newName = displayNameInput?.value || "User"; const newUsername = usernameInput?.value || ""; const newEmail = emailInput?.value || ""; const newRole = primaryRoleInput?.value || ""; localStorage.setItem('userDisplayName', newName); localStorage.setItem('userUsername', newUsername); localStorage.setItem('userEmail', newEmail); localStorage.setItem('userPrimaryRole', newRole); if(userNameSidebar) userNameSidebar.textContent = newName; if(userEmailSidebar) userEmailSidebar.textContent = newEmail; }
    function handleAvatarUpload(event) { const file = event.target.files?.[0]; if (!file || !file.type.startsWith('image/') || file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) { if (file && !file.type.startsWith('image/')) alert("Please select an image file."); else if (file && file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) alert(`Image size exceeds ${MAX_AVATAR_SIZE_MB}MB limit.`); return; } const reader = new FileReader(); reader.onload = (e) => { const imageDataUrl = e.target.result; localStorage.setItem('userAvatar', imageDataUrl); if(userAvatarModal) userAvatarModal.src = imageDataUrl; if(userAvatarSidebar) userAvatarSidebar.src = imageDataUrl; }; reader.onerror = (e) => { console.error("Error reading avatar file:", e); alert("Error reading image file."); }; reader.readAsDataURL(file); }
    function loadTokenCount() { const savedTokens = localStorage.getItem('userTokenCount'); currentTokens = (savedTokens !== null) ? parseInt(savedTokens, 10) : 100; updateTokenCountDisplay(); }
    function saveTokenCount() { localStorage.setItem('userTokenCount', currentTokens); }
    function updateTokenCountDisplay() { if (tokenCountText) tokenCountText.textContent = `${currentTokens} tokens left`; }

    function setupUpgradePlanModalInteraction() {
        if (!upgradePlanModalEl) return;
        planToggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const planType = button.dataset.planType;
                planToggleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                if (planType === 'personal') {
                    if(personalPlansContainer) personalPlansContainer.style.display = 'grid';
                    if(businessPlansContainer) businessPlansContainer.style.display = 'none';
                } else {
                    if(personalPlansContainer) personalPlansContainer.style.display = 'none';
                    if(businessPlansContainer) businessPlansContainer.style.display = 'grid';
                }
            });
        });
        upgradePlanModalEl.querySelectorAll('.plan-action-btn:not(.current-plan-btn)').forEach(button => {
            button.addEventListener('click', (e) => {
                const planCard = button.closest('.upgrade-plan-card');
                const planTitle = planCard?.querySelector('.plan-title')?.textContent || 'Selected Plan';
                console.log(`Get Plan button clicked for: ${planTitle}`);
                alert(`Proceeding to checkout for ${planTitle} (not implemented).`);
                closeModal('upgrade-plan');
            });
        });
        const enterpriseLink = getElement('#see-enterprise-link');
        if (enterpriseLink) {
            enterpriseLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Enterprise link clicked');
                alert('Redirecting to Enterprise page (not implemented).');
                closeModal('upgrade-plan');
            });
        }
    }

    function setupEventListeners() {
        newChatBtn?.addEventListener('click', startNewChat);
        mobileNewChatBtn?.addEventListener('click', startNewChat);
        themeToggleBtn?.addEventListener('click', () => { const currentPref = localStorage.getItem('theme') || 'dark'; let newPref; if (currentPref === 'dark') newPref = 'light'; else if (currentPref === 'light') newPref = 'system'; else newPref = 'dark'; handleThemeSelection(newPref); });
        desktopSidebarToggle?.addEventListener('click', toggleDesktopSidebar);
        userProfileButton?.addEventListener('click', toggleUserProfilePopover);
        sidebarSearchBtn?.addEventListener('click', toggleChatSearchPopover);
        mobileMenuToggle?.addEventListener('click', openMobileSidebar);
        mobileSidebarCloseBtn?.addEventListener('click', closeMobileSidebar);
        
        if(sendBtn) {
            sendBtn.addEventListener('click', handleSend); // Initial handler
            sendBtn.setAttribute('listener-send', 'true'); // Mark that send handler is attached
        }

        messageInput?.addEventListener('input', adjustTextareaHeight);
        messageInput?.addEventListener('keydown', (e) => { 
            if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                if (!isAiResponding) { 
                    handleSend(); 
                } else { 
                    handleStopAiResponse();
                }
            } 
        });
        micBtn?.addEventListener('click', toggleSpeechRecognition);
        
        uploadBtn?.addEventListener('click', () => {
            console.log('[UploadBtn Click] Before modal open, uploadedFiles:', JSON.stringify(uploadedFiles.map(f => f.name)));
            modalSelectedFiles = [];
            console.log('[UploadBtn Click] modalSelectedFiles cleared.');
            hasSelectedFileInModalSession = false; 
            console.log('[UploadBtn Click] hasSelectedFileInModalSession reset to false.');
            openModal('file-upload');
            loadPreviousFilesToModal();
            updateModalCurrentFilesList();
        });

        messagesContainer?.addEventListener('click', (event) => {
            handleActionClick(event);
            const copyCodeBtn = event.target.closest('.copy-code-btn');
            if(copyCodeBtn){ const pre = copyCodeBtn.closest('pre'); const code = pre?.querySelector('code'); if(code) copyToClipboard(code.textContent || '').then(success => showFeedback(copyCodeBtn, success ? 'Copied!' : 'Failed')); }
        });

        userProfilePopover?.addEventListener('click', (e) => {
            const btn = e.target.closest('.popover-item[data-action]');
            if (btn) {
                const action = btn.dataset.action;
                closeUserProfilePopover();
                if (action === 'open-settings') { loadUserSettings(); openModal('account-settings'); }
                else if (action === 'open-support') openModal('support-center');
                else if (action === 'logout') openLogoutConfirmDialog();
                else alert(`Action: ${action} (Not fully implemented)`);
            }
        });

        chatHistory?.addEventListener('click', (e) => {
            const optionsBtn = e.target.closest('.history-options-btn'); const historyItemButton = e.target.closest('.history-item'); const renameBtn = e.target.closest('.rename-chat-btn'); const deleteBtn = e.target.closest('.delete-chat-btn'); const listItem = e.target.closest('.history-list-item'); if (!listItem) return; const chatId = listItem.dataset.chatId; const contextMenu = listItem.querySelector('.history-context-menu');
            if (currentlyOpenHistoryMenu && currentlyOpenHistoryMenu !== contextMenu && !optionsBtn) toggleHistoryContextMenu(null);
            if (optionsBtn) { e.stopPropagation(); toggleHistoryContextMenu(contextMenu); }
            else if (renameBtn) { e.stopPropagation(); enterRenameMode(listItem, chatId); toggleHistoryContextMenu(null); }
            else if (deleteBtn) { e.stopPropagation(); confirmDeleteChat(listItem, chatId); toggleHistoryContextMenu(null); }
            else if (historyItemButton) { const contentWrapper = listItem.querySelector('.history-item-content'); if (contentWrapper && !contentWrapper.querySelector('.history-rename-input')) { loadChat(chatId, chatData[chatId]?.title || 'Chat'); toggleHistoryContextMenu(null); } }
        });

        chatSearchCloseBtn?.addEventListener('click', closeChatSearchPopover);
        chatSearchInput?.addEventListener('input', () => renderChatSearchResults(chatSearchInput.value));
        newChatFromSearchBtn?.addEventListener('click', () => { startNewChat(); closeChatSearchPopover(); });
        chatSearchOverlay?.addEventListener('click', closeChatSearchPopover);

        modelSelectorTriggerBtn?.addEventListener('click', toggleModelSelectorPopover);
        if (modelSelectorPopover) {
            modelSelectorPopover.addEventListener('click', (e) => {
                const targetOptionItem = e.target.closest('.model-option-item');
                const upgradeButton = e.target.closest('.model-option-upgrade-btn');
                if (upgradeButton && upgradeButton.id === 'model-selector-upgrade-btn') {
                    e.stopPropagation();
                    closeModelSelectorPopover();
                    openModal('upgrade-plan');
                    return;
                }
                if (targetOptionItem) {
                    const model = targetOptionItem.dataset.model;
                    if (model === 'default') { selectModel(model); closeModelSelectorPopover(); }
                }
            });
        }

        setupModalInteraction('account-settings');
        setupModalInteraction('support-center');
        setupModalInteraction('file-upload');
        setupModalInteraction('upgrade-plan');
        setupFileUploadModalListeners();
        setupUpgradePlanModalInteraction();

        document.querySelectorAll('#account-settings-modal .theme-option[data-theme]').forEach(button => { button.addEventListener('click', () => handleThemeSelection(button.dataset.theme)); });
        document.querySelectorAll('#account-settings-modal .accent-color-option[data-color]').forEach(button => { button.addEventListener('click', () => { const newColor = button.dataset.color; applyAccentColor(newColor); document.querySelectorAll('#account-settings-modal .accent-color-option.active').forEach(btn => btn.classList.remove('active')); button.classList.add('active'); }); });
        avatarUploadBtn?.addEventListener('click', () => avatarUploadInput?.click());
        avatarUploadInput?.addEventListener('change', handleAvatarUpload);

        confirmDeleteBtn?.addEventListener('click', () => { const chatIdToDelete = confirmDeleteDialog.dataset.chatIdToDelete; if (chatIdToDelete) deleteChat(chatIdToDelete); closeConfirmDialog(); });
        cancelDeleteBtn?.addEventListener('click', closeConfirmDialog);
        confirmLogoutBtn?.addEventListener('click', () => {
            closeLogoutConfirmDialog();
            localStorage.removeItem('userTokenCount'); localStorage.removeItem('wispaCurrentChatId'); localStorage.removeItem('userDisplayName'); localStorage.removeItem('userUsername'); localStorage.removeItem('userEmail'); localStorage.removeItem('userPrimaryRole'); localStorage.removeItem('userAvatar');
            alert("Logged out! (Redirect would happen here)");
            initializeApp(); // Re-initialize, might clear some states
        });
        cancelLogoutBtn?.addEventListener('click', closeLogoutConfirmDialog);

        window.addEventListener('click', (e) => {
            if (isUserProfilePopoverOpen && !userProfilePopover?.contains(e.target) && e.target !== userProfileButton && !userProfileButton?.contains(e.target) ) closeUserProfilePopover();
            if (isModelSelectorPopoverOpen && !modelSelectorPopover?.contains(e.target) && e.target !== modelSelectorTriggerBtn && !modelSelectorTriggerBtn?.contains(e.target)) closeModelSelectorPopover();
            if (window.innerWidth <= 768 && document.body.classList.contains('sidebar-open') && !sidebar?.contains(e.target) && e.target !== mobileMenuToggle && !mobileMenuToggle?.contains(e.target)) closeMobileSidebar();
            if (currentlyOpenHistoryMenu && !currentlyOpenHistoryMenu.contains(e.target) && !e.target.closest('.history-options-btn')) toggleHistoryContextMenu(null);
            if (isConfirmDialogOpen && e.target === confirmDeleteOverlay) closeConfirmDialog();
            if (isLogoutConfirmDialogOpen && e.target === confirmLogoutOverlay) closeLogoutConfirmDialog();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (isLogoutConfirmDialogOpen) closeLogoutConfirmDialog();
                else if (isConfirmDialogOpen) closeConfirmDialog();
                else if (currentModalId) closeModal(currentModalId);
                else if (isChatSearchPopoverOpen) closeChatSearchPopover();
                else if (isModelSelectorPopoverOpen) closeModelSelectorPopover();
                else if (isUserProfilePopoverOpen) closeUserProfilePopover();
                else if (currentlyOpenHistoryMenu) toggleHistoryContextMenu(null);
                else if (isRecording) stopSpeechRecognition();
                else if (window.innerWidth <= 768 && document.body.classList.contains('sidebar-open')) closeMobileSidebar();
                else if (isAiResponding) handleStopAiResponse(); // Allow Esc to stop AI generation
            }
        });
    }

    function setupModalInteraction(modalId) {
        const modalElement = document.getElementById(`${modalId}-modal`);
        const overlayElement = document.getElementById(`${modalId}-overlay`);
        if (!modalElement || !overlayElement) return;
        overlayElement.addEventListener('click', (e) => { if (e.target === overlayElement) closeModal(modalId); });
        modalElement.querySelectorAll(`.modal-close-btn[data-modal-id="${modalId}"]`).forEach(btn => { btn.addEventListener('click', () => closeModal(modalId)); });
        modalElement.querySelectorAll(`button[data-modal-id="${modalId}"].btn-secondary`).forEach(btn => {
             if (btn.closest('.confirm-dialog-actions') || btn.textContent.toLowerCase() === 'cancel') { 
                 btn.addEventListener('click', () => closeModal(modalId));
             }
         });
        modalElement.querySelector('.modal-nav')?.addEventListener('click', (e) => { const item = e.target.closest('.modal-nav-item[data-section]'); if (item && !item.classList.contains('active')) switchModalSection(modalElement, item.dataset.section); });
        if (modalId === 'account-settings') modalElement.querySelector('.save-settings-btn')?.addEventListener('click', () => { saveUserSettings(); showFeedback(modalElement.querySelector('.save-settings-btn'), 'Saved!'); setTimeout(() => closeModal(modalId), 1200); });
        if (modalId === 'support-center') { const form = modalElement.querySelector('#contact-support-form'); form?.addEventListener('submit', (e) => { e.preventDefault(); const btn = form.querySelector('.contact-submit-btn'); showFeedback(btn, 'Sending...'); setTimeout(() => { showFeedback(btn, 'Sent!'); form.reset(); }, 1500); }); }
    }

    async function initializeApp() {
        loadTheme();
        loadAccentColor();
        loadUserSettings();
        loadTokenCount();
        await checkMicPermission();
        if (SpeechRecognition) initializeSpeechRecognition();
        else if(micBtn) micBtn.style.display = 'none';
        
        if (sendBtn && !originalSendButtonSVG) { 
             originalSendButtonSVG = sendBtn.innerHTML;
        }

        applySidebarCollapsedState();
        setupEventListeners(); 
        loadChatHistory();
        setupAllToggleSwitches();
        setupInitialView();
        setupFileUploadModalListeners();
    }
    initializeApp();
});