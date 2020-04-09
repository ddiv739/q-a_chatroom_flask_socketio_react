import time
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

message_history = []
room_message_history = {}
clients = set()
active_rooms = set()

#TODO - now that we have a room set, it pays to check if the room exists on any
#requests. Create a decorator that returns a known error message if not so
#client can loop back to index

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/history')
def fetch_history():
    targ_room = request.args.get('room')
    print(targ_room)
    if(targ_room not in active_rooms) :
        return {'room_status':False, 'history': None}
    return {'room_status':True, 'history': room_message_history[targ_room]}

@socketio.on('upvote')
def upvote_and_sort(data):
    print(data)
    room_message_history[data['room']][data['position']]['score'] += 1
    if(data['position'] == 0):
        emit('new message order', room_message_history[data['room']], room = data['room']) 
        return
    if(room_message_history[data['room']][data['position']]['score'] > room_message_history[data['room']][data['position']-1]['score']):
        #swap the data.positions
        room_message_history[data['room']][data['position']],  room_message_history[data['room']][data['position']-1] =  room_message_history[data['room']][data['position']-1] ,  room_message_history[data['room']][data['position']]
    
    emit('new message order', room_message_history[data['room']], room = data['room']) 

@socketio.on('join')
def client_room_join(room_name):
    if(room_name not in active_rooms):
        active_rooms.add(room_name)
        room_message_history[room_name] = []
    join_room(room_name)
    emit('room_joined' , room_name)

# Emit message to everyone (broadcast)
@socketio.on('add message event')
def add_message(data):
    print(data)
    out_msg = {'message':data['message'],'score':0, 'timestamp':time.time()}
    room_message_history[data['room']].append(out_msg)
    emit('room_message', out_msg , room = data['room'])

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

