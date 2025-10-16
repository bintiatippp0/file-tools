// Global Variables
let compressFiles = [];
let convertFiles = [];
let currentConversionType = '';
let isProcessing = false;

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const compressUpload = document.getElementById('compressUpload');
const compressFileInput = document.getElementById('compressFileInput');
const compressFileList = document.getElementById('compressFileList');
const startCompressBtn = document.getElementById('startCompress');
const clearCompressBtn = document.getElementById('clearCompressFiles');
const compressionQuality = document.getElementById('compressionQuality');

const convertUpload = document.getElementById('convertUpload');
const convertFileInput = document.getElementById('convertFileInput');
const convertFileList = document.getElementById('convertFileList');
const startConvertBtn = document.getElementById('startConvert');
const clearConvertBtn = document.getElementById('clearConvertFiles');
const convertTool = document.getElementById('convertTool');
const convertTitle = document.getElementById('convertTitle');
const backToTypes = document.getElementById('backToTypes');
const fromFormat = document.getElementById('fromFormat');
const toFormat = document.getElementById('toFormat');

const progressModal = document.getElementById('progressModal');
const resultModal = document.getElementById('resultModal');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const progressTitle = document.getElementById('progressTitle');
const cancelProcess = document.getElementById('cancelProcess');
const resultTitle = document.getElementById('resultTitle');
const resultContent = document.getElementById('resultContent');
const downloadAll = document.getElementById('downloadAll');
const closeResult = document.getElementById('closeResult');

// Conversion Format Options
const formatOptions = {
    pdf: {
        from: ['pdf'],
        to: ['docx', 'xlsx', 'pptx', 'jpg', 'png', 'txt']
    },
    image: {
        from: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'],
        to: ['jpg', 'png', 'webp', 'bmp', 'pdf']
    },
    document: {
        from: ['docx', 'xlsx', 'pptx', 'txt'],
        to: ['pdf', 'docx', 'xlsx', 'pptx', 'txt']
    },
    video: {
        from: ['mp4', 'avi', 'mov', 'mkv', 'wmv'],
        to: ['mp4', 'avi', 'mov', 'mkv', 'webm']
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setupDragAndDrop();
});

// Event Listeners
function initializeEventListeners() {
    // Navigation
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Compression
    compressFileInput.addEventListener('change', handleCompressFileSelect);
    startCompressBtn.addEventListener('click', startCompression);
    clearCompressBtn.addEventListener('click', clearCompressFiles);
    
    // Conversion
    convertFileInput.addEventListener('change', handleConvertFileSelect);
    startConvertBtn.addEventListener('click', startConversion);
    clearConvertBtn.addEventListener('click', clearConvertFiles);
    backToTypes.addEventListener('click', showConversionTypes);
    fromFormat.addEventListener('change', updateToFormatOptions);
    
    // Conversion Types
    document.querySelectorAll('.conversion-card').forEach(card => {
        card.addEventListener('click', () => selectConversionType(card.dataset.type));
    });
    
    // Modals
    cancelProcess.addEventListener('click', cancelCurrentProcess);
    closeResult.addEventListener('click', closeResultModal);
    downloadAll.addEventListener('click', downloadAllFiles);
    
    // Upload area clicks
    compressUpload.addEventListener('click', () => compressFileInput.click());
    convertUpload.addEventListener('click', () => convertFileInput.click());
}

// Mobile Navigation
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// Smooth Scrolling
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}

// Drag and Drop Setup
function setupDragAndDrop() {
    // Compress upload area
    setupDragAndDropForElement(compressUpload, handleCompressFiles);
    
    // Convert upload area
    setupDragAndDropForElement(convertUpload, handleConvertFiles);
}

function setupDragAndDropForElement(element, handler) {
    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        element.classList.add('dragover');
    });
    
    element.addEventListener('dragleave', () => {
        element.classList.remove('dragover');
    });
    
    element.addEventListener('drop', (e) => {
        e.preventDefault();
        element.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        handler(files);
    });
}

// File Handling Functions
function handleCompressFileSelect(e) {
    const files = Array.from(e.target.files);
    handleCompressFiles(files);
}

function handleConvertFileSelect(e) {
    const files = Array.from(e.target.files);
    handleConvertFiles(files);
}

function handleCompressFiles(files) {
    files.forEach(file => {
        if (isValidCompressFile(file)) {
            const fileObj = {
                id: generateId(),
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                status: 'pending'
            };
            compressFiles.push(fileObj);
        } else {
            showAlert(`File ${file.name} tidak didukung untuk kompresi`);
        }
    });
    
    updateCompressFileList();
    updateCompressButton();
}

function handleConvertFiles(files) {
    files.forEach(file => {
        if (isValidConvertFile(file)) {
            const fileObj = {
                id: generateId(),
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                extension: getFileExtension(file.name),
                status: 'pending'
            };
            convertFiles.push(fileObj);
        } else {
            showAlert(`File ${file.name} tidak didukung untuk konversi jenis ini`);
        }
    });
    
    updateConvertFileList();
    updateConvertButton();
}

// File Validation
function isValidCompressFile(file) {
    const validTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
        'application/pdf', 'application/zip',
        'video/mp4', 'video/quicktime', 'video/x-msvideo'
    ];
    return validTypes.some(type => file.type.includes(type.split('/')[1]));
}

function isValidConvertFile(file) {
    if (!currentConversionType) return true;
    
    const extension = getFileExtension(file.name);
    const validExtensions = formatOptions[currentConversionType]?.from || [];
    
    return validExtensions.includes(extension);
}

// File List Updates
function updateCompressFileList() {
    compressFileList.innerHTML = '';
    
    compressFiles.forEach(fileObj => {
        const fileItem = createFileListItem(fileObj, 'compress');
        compressFileList.appendChild(fileItem);
    });
}

function updateConvertFileList() {
    convertFileList.innerHTML = '';
    
    convertFiles.forEach(fileObj => {
        const fileItem = createFileListItem(fileObj, 'convert');
        convertFileList.appendChild(fileItem);
    });
}

function createFileListItem(fileObj, type) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
        <div class="file-info">
            <i class="fas ${getFileIcon(fileObj.name)} file-icon"></i>
            <div class="file-details">
                <h4>${fileObj.name}</h4>
                <p>${formatFileSize(fileObj.size)} • ${fileObj.type || 'Unknown'}</p>
            </div>
        </div>
        <div class="file-actions">
            <span class="file-status status-${fileObj.status}">
                ${getStatusText(fileObj.status)}
            </span>
            <button class="remove-file" onclick="removeFile('${fileObj.id}', '${type}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    return fileItem;
}

// Utility Functions
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

function getFileIcon(filename) {
    const extension = getFileExtension(filename);
    const iconMap = {
        pdf: 'fa-file-pdf',
        doc: 'fa-file-word',
        docx: 'fa-file-word',
        xls: 'fa-file-excel',
        xlsx: 'fa-file-excel',
        ppt: 'fa-file-powerpoint',
        pptx: 'fa-file-powerpoint',
        jpg: 'fa-file-image',
        jpeg: 'fa-file-image',
        png: 'fa-file-image',
        gif: 'fa-file-image',
        webp: 'fa-file-image',
        mp4: 'fa-file-video',
        avi: 'fa-file-video',
        mov: 'fa-file-video',
        zip: 'fa-file-archive',
        rar: 'fa-file-archive'
    };
    
    return iconMap[extension] || 'fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getStatusText(status) {
    const statusMap = {
        pending: 'Menunggu',
        processing: 'Memproses',
        completed: 'Selesai',
        error: 'Error'
    };
    
    return statusMap[status] || status;
}

// File Management
function removeFile(fileId, type) {
    if (type === 'compress') {
        compressFiles = compressFiles.filter(f => f.id !== fileId);
        updateCompressFileList();
        updateCompressButton();
    } else {
        convertFiles = convertFiles.filter(f => f.id !== fileId);
        updateConvertFileList();
        updateConvertButton();
    }
}

function clearCompressFiles() {
    compressFiles = [];
    updateCompressFileList();
    updateCompressButton();
}

function clearConvertFiles() {
    convertFiles = [];
    updateConvertFileList();
    updateConvertButton();
}

// Button State Management
function updateCompressButton() {
    startCompressBtn.disabled = compressFiles.length === 0 || isProcessing;
}

function updateConvertButton() {
    const hasFiles = convertFiles.length > 0;
    const hasFormats = fromFormat.value && toFormat.value;
    startConvertBtn.disabled = !hasFiles || !hasFormats || isProcessing;
}

// Conversion Type Selection
function selectConversionType(type) {
    currentConversionType = type;
    
    // Update title
    const titles = {
        pdf: 'Konversi PDF',
        image: 'Konversi Gambar',
        document: 'Konversi Dokumen',
        video: 'Konversi Video'
    };
    
    convertTitle.textContent = titles[type];
    
    // Update format options
    updateFormatOptions();
    
    // Show conversion tool
    document.querySelector('.conversion-types').style.display = 'none';
    convertTool.style.display = 'block';
    
    // Clear previous files
    clearConvertFiles();
}

function showConversionTypes() {
    document.querySelector('.conversion-types').style.display = 'grid';
    convertTool.style.display = 'none';
    currentConversionType = '';
    clearConvertFiles();
}

function updateFormatOptions() {
    const options = formatOptions[currentConversionType];
    
    // Clear previous options
    fromFormat.innerHTML = '<option value="">Pilih format asal</option>';
    toFormat.innerHTML = '<option value="">Pilih format tujuan</option>';
    
    // Add from format options
    options.from.forEach(format => {
        const option = document.createElement('option');
        option.value = format;
        option.textContent = format.toUpperCase();
        fromFormat.appendChild(option);
    });
}

function updateToFormatOptions() {
    const options = formatOptions[currentConversionType];
    const selectedFrom = fromFormat.value;
    
    // Clear to format options
    toFormat.innerHTML = '<option value="">Pilih format tujuan</option>';
    
    if (selectedFrom) {
        // Filter out the same format
        const availableFormats = options.to.filter(format => format !== selectedFrom);
        
        availableFormats.forEach(format => {
            const option = document.createElement('option');
            option.value = format;
            option.textContent = format.toUpperCase();
            toFormat.appendChild(option);
        });
    }
    
    updateConvertButton();
}

// Processing Functions
function startCompression() {
    if (isProcessing || compressFiles.length === 0) return;
    
    isProcessing = true;
    showProgressModal('Mengompres File...');
    
    processCompression();
}

function startConversion() {
    if (isProcessing || convertFiles.length === 0 || !fromFormat.value || !toFormat.value) return;
    
    isProcessing = true;
    showProgressModal('Mengonversi File...');
    
    processConversion();
}

async function processCompression() {
    const quality = compressionQuality.value;
    const results = [];
    
    for (let i = 0; i < compressFiles.length; i++) {
        const fileObj = compressFiles[i];
        
        // Update progress
        const progress = ((i + 1) / compressFiles.length) * 100;
        updateProgress(progress, `Memproses ${fileObj.name}...`);
        
        // Update file status
        fileObj.status = 'processing';
        updateCompressFileList();
        
        try {
            // Simulate compression process
            await simulateProcessing(2000);
            
            // Create compressed file (simulation)
            const compressedFile = await compressFile(fileObj.file, quality);
            
            fileObj.status = 'completed';
            results.push({
                original: fileObj,
                compressed: compressedFile,
                reduction: calculateReduction(fileObj.file.size, compressedFile.size)
            });
            
        } catch (error) {
            fileObj.status = 'error';
            console.error('Compression error:', error);
        }
        
        updateCompressFileList();
    }
    
    hideProgressModal();
    showCompressionResults(results);
    isProcessing = false;
    updateCompressButton();
}

async function processConversion() {
    const from = fromFormat.value;
    const to = toFormat.value;
    const results = [];
    
    for (let i = 0; i < convertFiles.length; i++) {
        const fileObj = convertFiles[i];
        
        // Update progress
        const progress = ((i + 1) / convertFiles.length) * 100;
        updateProgress(progress, `Mengonversi ${fileObj.name}...`);
        
        // Update file status
        fileObj.status = 'processing';
        updateConvertFileList();
        
        try {
            // Simulate conversion process
            await simulateProcessing(3000);
            
            // Create converted file (simulation)
            const convertedFile = await convertFile(fileObj.file, from, to);
            
            fileObj.status = 'completed';
            results.push({
                original: fileObj,
                converted: convertedFile
            });
            
        } catch (error) {
            fileObj.status = 'error';
            console.error('Conversion error:', error);
        }
        
        updateConvertFileList();
    }
    
    hideProgressModal();
    showConversionResults(results);
    isProcessing = false;
    updateConvertButton();
}

// File Processing Simulation
async function compressFile(file, quality) {
    // Simulate file compression
    const compressionRatio = {
        high: 0.8,
        medium: 0.6,
        low: 0.4
    };
    
    const ratio = compressionRatio[quality] || 0.6;
    const compressedSize = Math.floor(file.size * ratio);
    
    // Create a new file object representing the compressed file
    const compressedBlob = new Blob([new ArrayBuffer(compressedSize)], { type: file.type });
    const compressedFile = new File([compressedBlob], `compressed_${file.name}`, { type: file.type });
    
    return compressedFile;
}

async function convertFile(file, fromFormat, toFormat) {
    // Simulate file conversion
    const convertedName = file.name.replace(new RegExp(`\.${fromFormat}$`, 'i'), `.${toFormat}`);
    const mimeTypes = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        jpg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        mp4: 'video/mp4',
        avi: 'video/x-msvideo'
    };
    
    const mimeType = mimeTypes[toFormat] || 'application/octet-stream';
    const convertedBlob = new Blob([new ArrayBuffer(file.size)], { type: mimeType });
    const convertedFile = new File([convertedBlob], convertedName, { type: mimeType });
    
    return convertedFile;
}

function simulateProcessing(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

function calculateReduction(originalSize, compressedSize) {
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

// Progress Modal
function showProgressModal(title) {
    progressTitle.textContent = title;
    progressModal.style.display = 'block';
    updateProgress(0, 'Memulai...');
}

function hideProgressModal() {
    progressModal.style.display = 'none';
}

function updateProgress(percentage, text) {
    progressFill.style.width = percentage + '%';
    progressText.textContent = Math.round(percentage) + '%';
    
    if (text) {
        progressTitle.textContent = text;
    }
}

function cancelCurrentProcess() {
    isProcessing = false;
    hideProgressModal();
    
    // Reset file statuses
    compressFiles.forEach(f => {
        if (f.status === 'processing') f.status = 'pending';
    });
    convertFiles.forEach(f => {
        if (f.status === 'processing') f.status = 'pending';
    });
    
    updateCompressFileList();
    updateConvertFileList();
    updateCompressButton();
    updateConvertButton();
}

// Result Modal
function showCompressionResults(results) {
    resultTitle.textContent = 'Kompresi Selesai';
    
    let content = '<div class="result-list">';
    results.forEach(result => {
        const { original, compressed, reduction } = result;
        content += `
            <div class="result-item">
                <div class="result-info">
                    <h4>${original.name}</h4>
                    <p>Ukuran asli: ${formatFileSize(original.file.size)}</p>
                    <p>Ukuran setelah kompresi: ${formatFileSize(compressed.size)}</p>
                    <p class="reduction-text">Pengurangan: ${reduction}%</p>
                </div>
                <button class="btn btn-primary" onclick="downloadFile('${result.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        `;
    });
    content += '</div>';
    
    resultContent.innerHTML = content;
    resultModal.style.display = 'block';
    
    // Store results for download
    window.compressionResults = results;
}

function showConversionResults(results) {
    resultTitle.textContent = 'Konversi Selesai';
    
    let content = '<div class="result-list">';
    results.forEach(result => {
        const { original, converted } = result;
        content += `
            <div class="result-item">
                <div class="result-info">
                    <h4>${original.name}</h4>
                    <p>Format asal: ${original.extension.toUpperCase()}</p>
                    <p>Format hasil: ${getFileExtension(converted.name).toUpperCase()}</p>
                    <p>Ukuran: ${formatFileSize(converted.size)}</p>
                </div>
                <button class="btn btn-primary" onclick="downloadFile('${result.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        `;
    });
    content += '</div>';
    
    resultContent.innerHTML = content;
    resultModal.style.display = 'block';
    
    // Store results for download
    window.conversionResults = results;
}

function closeResultModal() {
    resultModal.style.display = 'none';
}

function downloadFile(resultId) {
    // Implement file download logic here
    showAlert('Download dimulai...');
}

function downloadAllFiles() {
    // Implement batch download logic here
    showAlert('Download semua file dimulai...');
}

// Utility Functions
function showAlert(message) {
    // Simple alert implementation
    // You can replace this with a custom modal or notification system
    alert(message);
}

// Navigation link clicks
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href').substring(1);
        scrollToSection(target);
        
        // Close mobile menu if open
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === progressModal) {
        // Don't allow closing progress modal by clicking outside
        // User should use cancel button
    }
    
    if (e.target === resultModal) {
        closeResultModal();
    }
});

// Format change listeners
fromFormat.addEventListener('change', updateConvertButton);
toFormat.addEventListener('change', updateConvertButton);

// Console log for debugging
console.log('FileTools Pro initialized successfully!');
