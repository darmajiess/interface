document.addEventListener('DOMContentLoaded', () => {
    const cameraInput = document.getElementById('camera');
    const fileInput = document.getElementById('fileUpload');
    let totalImages = 0;
    const maxImages = 20;

	// Update counter display
	const counter = document.createElement('div');
	counter.className = 'image-counter';
	counter.textContent = `${totalImages}/${maxImages} gambar terupload`;
	document.querySelector('.container').appendChild(counter);

    // ... (previous code)

// Camera Access Functionality
const startCameraBtn = document.createElement('button');
startCameraBtn.textContent = 'Ambil Foto';
startCameraBtn.className = 'camera-btn';
startCameraBtn.type = 'button';

// Replace existing camera input
const cameraContainer = document.querySelector('#camera').parentNode;
cameraContainer.replaceChild(startCameraBtn, document.querySelector('#camera'));

// Camera Modal
const cameraModal = document.createElement('div');
cameraModal.className = 'camera-modal';
cameraModal.innerHTML = `
    <div class="camera-modal-content">
        <video class="camera-preview"></video>
        <div class="camera-controls">
            <button class="capture-btn">Ambil Foto</button>
            <button class="close-camera">Tutup</button>
        </div>
    </div>
`;
document.body.appendChild(cameraModal);

let cameraStream = null;

// Open Camera
startCameraBtn.addEventListener('click', async () => {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        });
        
        const video = cameraModal.querySelector('.camera-preview');
        video.srcObject = cameraStream;
        cameraModal.style.display = 'block';
        
        // Add video play handler for iOS
        video.play().catch(error => {
            console.error('Error starting video:', error);
        });
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
    }
});

// Capture Photo
cameraModal.querySelector('.capture-btn').addEventListener('click', () => {
    const video = cameraModal.querySelector('.camera-preview');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(blob => {
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg'
        });
        
        // Simulate FileList
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        handleFiles(dataTransfer.files, 'camera');
    }, 'image/jpeg', 0.9);
    
    closeCamera();
});

// Close Camera
function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    cameraModal.style.display = 'none';
}

cameraModal.querySelector('.close-camera').addEventListener('click', closeCamera);


    function createPreviewContainer(source) {
        const container = document.createElement('div');
        container.className = 'preview-container';
        container.dataset.source = source;
        return container;
    }

    function handleFiles(files, source) {
        if (totalImages + files.length > maxImages) {
            alert(`Maksimal ${maxImages} gambar`);
            return;
        }

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const previewContainer = document.querySelector(`.preview-container[data-source="${source}"]`) || 
                                       createPreviewContainer(source);
                
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'image-wrapper';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-btn';
                removeBtn.innerHTML = '×';
                removeBtn.onclick = () => {
                    imgWrapper.remove();
                    totalImages--;
                };

                imgWrapper.appendChild(img);
                imgWrapper.appendChild(removeBtn);
                previewContainer.appendChild(imgWrapper);
                
                const uploadBtn = document.querySelector(`#${source}`).parentNode;
                uploadBtn.parentNode.insertBefore(previewContainer, uploadBtn.nextSibling);
                
                totalImages++;
            };
            reader.readAsDataURL(file);
        });
    }

    cameraInput.addEventListener('change', (e) => {
        handleFiles(e.target.files, 'camera');
        e.target.value = ''; // Reset input
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files, 'fileUpload');
        e.target.value = ''; // Reset input
    });
});