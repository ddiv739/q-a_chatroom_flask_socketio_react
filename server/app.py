import time
from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

message_history = []

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/history')
def fetch_history():
    return {'history': message_history}
# ----------------------- v1

@socketio.on('upvote')
def upvote_and_sort(position):
    message_history[position]['score'] += 1
    if(position == 0):
        emit('new message order', message_history, broadcast = True) 
        return
    if(message_history[position]['score'] > message_history[position-1]['score']):
        #swap the positions
        message_history[position],  message_history[position-1] =  message_history[position-1] ,  message_history[position]
    
    emit('new message order', message_history, broadcast = True) 

# Emit message to everyone (broadcast)
@socketio.on('add message event')
def add_message(message):
    print(message)
    out_msg = {'message':message,'score':0, 'timestamp':time.time()}
    message_history.append(out_msg)
    emit('message', out_msg , broadcast=True)

@socketio.on('connect')
def connect():
    emit('conn resp', {'data': 'Connected'})    

@socketio.on('disconnect')
def disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    # socketio.run(app)
    socketio.run(app,debug=True, host="0.0.0.0")

