
const videoElement = document.getElementById('camera-feed');
const startCameraButton = document.getElementById('start-camera-btn');
const captureButton = document.getElementById('capture-btn');
const stopCameraButton = document.getElementById('stop-camera-btn');
const canvas = document.getElementById('capture-canvas');
const capturedPhoto = document.getElementById('captured-photo');
let stream = null;
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        videoElement.play();
        captureButton.disabled = false;
        stopCameraButton.disabled = false;
        startCameraButton.disabled = true;
    } catch (error) {
        alert('Camera access denied or unavailable.');
        console.error(error);
    }
}
function stopCamera() {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
        stream = null;
        captureButton.disabled = true;
        stopCameraButton.disabled = true;
        startCameraButton.disabled = false;
    }
}
function captureImage() {
    const context = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    capturedPhoto.src = imageData;
    // Send the image data to the server
    fetch('/save-image', {
        method: 'POST',
        body: JSON.stringify({ image: imageData }),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json())
        .then(data => {
            console.log('Image saved:', data);
        })
        .catch(error => {
            console.error('Error saving image:', error);
        });
}

startCameraButton.addEventListener('click', startCamera);
captureButton.addEventListener('click', captureImage);
stopCameraButton.addEventListener('click', stopCamera);



async function registerEmployee(imageData) {
    try {
        const formData = new FormData();
        formData.append('photo', imageData, 'passport-photo.png');
        formData.append('name', 'John Doe'); // Replace with form input
        formData.append('employeeId', '12345'); // Replace with form input

        const response = await fetch('http://localhost:5000/api/images/register', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            alert('Employee registered successfully');
        } else {
            alert('Registration failed');
        }
    } catch (error) {
        console.error('Error registering employee:', error);
    }
}

async function recognizeEmployee(imageData) {
    try {
        const formData = new FormData();
        formData.append('photo', imageData, 'captured-image.png');

        const response = await fetch('http://localhost:5000/api/images/recognize', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Employee recognized: ${result.message}`);
        } else {
            alert('Recognition failed');
        }
    } catch (error) {
        console.error('Error recognizing employee:', error);
    }
}

function captureAndUpload(action) {
    const context = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((imageData) => {
        if (action === 'register') {
            registerEmployee(imageData);
        } else if (action === 'recognize') {
            recognizeEmployee(imageData);
        }
    }, 'image/png');
}