import time
from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

# ----------------------- v1

# Emit message to everyone (broadcast)
@socketio.on('add message event')
def add_message(message):
    print(message)
    emit('message', message, broadcast=True)

@socketio.on('connect')
def connect():
    emit('conn resp', {'data': 'Connected'})    

@socketio.on('disconnect')
def disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    # socketio.run(app)
    socketio.run(app, host="0.0.0.0")

