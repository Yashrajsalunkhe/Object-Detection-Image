from flask import Flask, request, jsonify, send_file
import cv2
import os
from werkzeug.utils import secure_filename
from ultralytics import YOLO  # Make sure to use the correct model path
import base64
from io import BytesIO

app = Flask(__name__)

# Ensure that the folder exists for saving files
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load YOLOv5 model once at startup
model = YOLO('yolov5mu.pt')  # Make sure to use the correct model path

def detect_and_annotate(image_path, model):
    img = cv2.imread(image_path)
    results = model(img)  # Perform inference

    detections = []

    # The results are now in the 'boxes' attribute of the result object
    # Iterate over the detected objects
    for result in results:
        boxes = result.boxes  # Bounding boxes
        for i, box in enumerate(boxes):
            x1, y1, x2, y2 = map(int, box.xyxy[0])  # Extracting the coordinates from the box
            conf = box.conf[0]  # Confidence score
            cls = box.cls[0]  # Class index
            label = f"{model.names[int(cls)]} {conf:.2f}"  # Class name and confidence score

            # Annotate the image with the bounding box and label
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)  # Green bounding box
            cv2.putText(img, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            # Append detection details to the list
            detections.append({
                "class": model.names[int(cls)],
                "confidence": float(conf),
                "box": [x1, y1, x2, y2]
            })

    # Save the annotated image to a temporary file
    output_path = os.path.join(app.config['UPLOAD_FOLDER'], "annotated_image.jpg")
    cv2.imwrite(output_path, img)
    
    # Convert image to base64 to send to the frontend
    _, img_encoded = cv2.imencode('.jpg', img)  # Encode the image as JPEG
    img_bytes = img_encoded.tobytes()  # Convert to bytes
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')  # Convert to base64 string

    return detections, img_base64


@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image = request.files['image']

    # Secure the filename and save the uploaded image
    filename = secure_filename(image.filename)
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image.save(image_path)

    # Perform detection and annotation
    detections, annotated_image_base64 = detect_and_annotate(image_path, model)

    # Return response with detections and the annotated image as base64
    response = {
        "detections": detections,
        "annotated_image": annotated_image_base64  # Return base64 encoded image
    }
    return jsonify(response)

@app.route('/annotated-image', methods=['GET'])
def get_annotated_image():
    output_image = os.path.join(app.config['UPLOAD_FOLDER'], "annotated_image.jpg")
    if not os.path.exists(output_image):
        return jsonify({"error": "Annotated image not found"}), 404
    return send_file(output_image, mimetype='image/jpeg')

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
