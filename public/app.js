class PhotoshootGenerator {
    constructor() {
        this.selectedScene = null;
        this.uploadedFile = null;
        this.initializeEventListeners();
        this.loadSceneTypes();
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const generateBtn = document.getElementById('generateBtn');

        // Upload area click
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileSelect(e);
        });

        // Generate button
        generateBtn.addEventListener('click', () => {
            this.generatePhotoshoot();
        });
    }

    async loadSceneTypes() {
        try {
            const response = await fetch('/api/scene-types');
            const scenes = await response.json();
            this.renderSceneOptions(scenes);
        } catch (error) {
            console.error('Failed to load scene types:', error);
        }
    }

    renderSceneOptions(scenes) {
        const sceneSelection = document.getElementById('sceneSelection');
        sceneSelection.innerHTML = scenes.map(scene => `
            <div class="scene-option" data-scene="${scene.id}">
                <div class="scene-icon">${this.getSceneIcon(scene.id)}</div>
                <h4>${scene.name}</h4>
                <p>${scene.description}</p>
            </div>
        `).join('');

        // Add click listeners to scene options
        document.querySelectorAll('.scene-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectScene(option.dataset.scene);
            });
        });
    }

    getSceneIcon(sceneId) {
        const icons = {
            studio: '🏢',
            lifestyle: '👥',
            outdoor: '🌳',
            creative: '🎨'
        };
        return icons[sceneId] || '📸';
    }

    selectScene(sceneId) {
        this.selectedScene = sceneId;
        
        // Update UI
        document.querySelectorAll('.scene-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-scene="${sceneId}"]`).classList.add('selected');
        
        this.updateGenerateButton();
    }

    handleFileSelect(event) {
        const file = event.target.files?.[0] || event.dataTransfer?.files?.[0];
        
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }

            this.uploadedFile = file;
            this.displayPreview(file);
            this.updateGenerateButton();
        }
    }

    displayPreview(file) {
        const preview = document.getElementById('previewImage');
        const reader = new FileReader();

        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };

        reader.readAsDataURL(file);
    }

    updateGenerateButton() {
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.disabled = !(this.uploadedFile && this.selectedScene);
    }

    async generatePhotoshoot() {
        if (!this.uploadedFile || !this.selectedScene) return;

        // Show loading, hide upload section
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';

        try {
            const formData = new FormData();
            formData.append('productImage', this.uploadedFile);
            formData.append('sceneType', this.selectedScene);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.displayResults(result.processedImages);
            } else {
                throw new Error(result.error || 'Generation failed');
            }

        } catch (error) {
            console.error('Generation error:', error);
            alert('Failed to generate photoshoot. Please try again.');
            this.resetApp();
        }
    }

    displayResults(images) {
        const resultsGrid = document.getElementById('resultsGrid');
        
        resultsGrid.innerHTML = images.map(image => `
            <div class="result-card">
                <img src="${image.final}" class="result-image" alt="Generated photoshoot">
                <div class="result-info">
                    <h4>${this.getSceneName(this.selectedScene)} Style</h4>
                    <p>${image.prompt}</p>
                </div>
            </div>
        `).join('');

        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
    }

    getSceneName(sceneId) {
        const names = {
            studio: 'Studio',
            lifestyle: 'Lifestyle',
            outdoor: 'Outdoor',
            creative: 'Creative'
        };
        return names[sceneId] || 'Professional';
    }

    resetApp() {
        this.selectedScene = null;
        this.uploadedFile = null;
        
        // Reset UI
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('previewImage').style.display = 'none';
        document.getElementById('fileInput').value = '';
        
        document.querySelectorAll('.scene-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        this.updateGenerateButton();
    }
}

// Initialize the application
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new PhotoshootGenerator();
});

// Global function for reset
function resetApp() {
    app.resetApp();
}