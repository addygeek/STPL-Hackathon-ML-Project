#main.py
import cv2
import os
import numpy as np

# Load pre-trained face detector from OpenCV
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Function to load stored faces and labels
def load_faces_and_labels(data_path):
    faces = []
    labels = []
    label_names = {}

    for i, name in enumerate(os.listdir(data_path)):
        label_names[i] = name
        person_path = os.path.join(data_path, name)
        
        for img_name in os.listdir(person_path):
            img_path = os.path.join(person_path, img_name)
            img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
            faces.append(img)
            labels.append(i)

    return np.array(faces), np.array(labels), label_names

# Train face recognizer (LBPHFaceRecognizer)
def train_face_recognizer(faces, labels):
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.train(faces, labels)
    return recognizer

# Main function to start the video capture and recognition
def main():
    data_path = 'face_dataset'  # Directory containing face images
    faces, labels, label_names = load_faces_and_labels(data_path)
    recognizer = train_face_recognizer(faces, labels)

    cap = cv2.VideoCapture(0)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces_detected = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        for (x, y, w, h) in faces_detected:
            roi_gray = gray[y:y + h, x:x + w]
            label, confidence = recognizer.predict(roi_gray)

            label_text = label_names[label] if confidence < 100 else 'Unknown'
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
            cv2.putText(frame, f'{label_text} ({confidence:.2f})', (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)

        cv2.imshow('Face Recognition', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
