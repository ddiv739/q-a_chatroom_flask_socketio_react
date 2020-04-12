import time
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

message_history = []
room_message_history = {}
clients = set()
active_rooms = set()

@app.route('/history')
def fetch_history():
    ''' 
        Fetch the message history of the sessions current room.
        Returns a dictionary with 'room_status' and 'history' keys.
        Room status returns a boolean which denotes if room exists.
        History returns full history of the target_room or none when room 
        does not exist 
    '''
    targ_room = request.args.get('room', default=None)
    if(targ_room not in active_rooms) :
        return {'room_status':False, 'history': None}
    return {'room_status':True, 'history': room_message_history[targ_room]}

@app.route('/roomlist')
def fetch_roomlist():
    '''
        Fetch list of active rooms. returns dictionary with a single key
        'room_list' which denotes a list of active room names.
    '''
    return {"room_list": list(active_rooms)}

@socketio.on('upvote')
def upvote_and_sort(data):
    '''
        Allows user to upvote an existing comment. The input data object
        should contain the desired room and the position of the object
    '''
    try:
        #Increment score
        room_message_history[data['room']][data['position']]['score'] += 1
        #Message first already
        if(data['position'] == 0):
            #TODO sending whole order inefficient
            emit('new message order', room_message_history[data['room']], room = data['room']) 
            return
        #Move message up in list until in correct position wrt score
        while(data['position']>0 and room_message_history[data['room']][data['position']]['score'] > room_message_history[data['room']][data['position']-1]['score']):
            room_message_history[data['room']][data['position']],  room_message_history[data['room']][data['position']-1] =  room_message_history[data['room']][data['position']-1] ,  room_message_history[data['room']][data['position']]
            data['position'] -= 1
        
        #Emit now order TODO sending whole history inefficient
        emit('new message order', room_message_history[data['room']], room = data['room']) 
    except:
        #Error due to poor packet, non-existent room or message position
        emit('error', 'The input message was malformed or pertained to a room or message that no longer exists.')

@socketio.on('join')
def client_room_join(room_name):
    '''
        Allows client to connect to rooms. Expects string room name.
        If room name does not exist one is created.
    '''
    #Room does not exist - create
    if(room_name not in active_rooms):
        active_rooms.add(room_name)
        room_message_history[room_name] = []
        emit('new room', room_name, broadcast = True)
    #Allow client to join room
    join_room(room_name)
    emit('room_joined' , room_name)

@socketio.on('add message event')
def add_message(data):
    '''
        Add a message to a room with a initial score of 0.
    '''
    try:
        out_msg = {'message':data['message'],'score':0, 'timestamp':time.time()}
        room_message_history[data['room']].append(out_msg)
        emit('room_message', out_msg , room = data['room'])
    except:
        #Error due to poor packet, non-existent room or message position
        emit('error', 'The input message was malformed or pertained to a room or message that no longer exists.')


@socketio.on('connect')
def connect():
    '''
        Allow client to join and add client to tracked list
    '''
    clients.add(request.sid)
    emit('client count', len(clients)//2 , broadcast = True)

@socketio.on('disconnect')
def disconnect():
    '''
        Allow client to disconnect and remove client from tracked list
    '''
    clients.remove(request.sid)
    emit('client count', len(clients)//2, broadcast = True)

if __name__ == '__main__':
    # socketio.run(app)
    socketio.run(app,debug=True, host="0.0.0.0")

