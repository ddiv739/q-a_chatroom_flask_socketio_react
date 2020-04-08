import time
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

message_history = []
clients = set()

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/history')
def fetch_history():
    return {'history': message_history}

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

@socketio.on('join')
def new_room_join(data):
    print(data)
    join_room(data)
    emit('room_message' , {'message':'Wow, you joined a room!','score':0, 'timestamp':time.time()} , room = data)

# Emit message to everyone (broadcast)
@socketio.on('add message event')
def add_message(message):
    print(message)
    out_msg = {'message':message,'score':0, 'timestamp':time.time()}
    message_history.append(out_msg)
    emit('message', out_msg , broadcast=True)

@socketio.on('connect')
def connect():
    print(request.sid)
    clients.add(request.sid)
    print(clients)
    emit('client count', len(clients)//2 , broadcast = True)

@socketio.on('disconnect')
def disconnect():
    clients.remove(request.sid)
    emit('client count', len(clients)//2, broadcast = True)
    print('Client disconnected')

if __name__ == '__main__':
    # socketio.run(app)
    socketio.run(app,debug=True, host="0.0.0.0")

