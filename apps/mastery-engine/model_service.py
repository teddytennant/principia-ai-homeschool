# Python microservice for logistic regression inference
# Loads model from pickle and exposes HTTP API for inference

import pickle
from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)

with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

@app.route('/infer', methods=['POST'])
def infer():
    data = request.json
    x = np.array([[data['correct'], data['time_ms'], data['hint_count']]])
    score = float(model.predict_proba(x)[0][1])
    return jsonify({'score': score})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)
