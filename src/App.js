import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import socketIOClient from 'socket.io-client'
import FlipMove from 'react-flip-move'

var socket
class App extends Component {

  constructor() {
    super();
    this.state = {
      endpoint : "http://192.168.1.152:5000",
      messages : [],
      currentTime: 0,
      new_message : "",
      new_room : "",
      client_count: 0,
      room : null,
      room_list : []
    }
    socket = socketIOClient(this.state.endpoint)
    this.clickHandle = this.clickHandle.bind(this)
    this.clickHandleJoinRoom = this.clickHandleJoinRoom.bind(this)
  }

  componentDidMount() {
    //replace with fetching messages
    fetch('/roomlist').then(res => res.json()).then(data => {
      console.log(data)
      this.setState({room_list: data.room_list})
    });

    socket.on('room_joined', (room_name) => {
      console.log(room_name)
      fetch('/history?room=' + room_name).then(res => res.json()).then(data => {
        console.log(data)
        this.setState({messages: data.history, room:room_name})
      });
      // this.setState({room : room_name})
    })

    socket.on('new room', (new_room) => {
      console.log(new_room)
      this.setState((prevState) => ({ 
        room_list: [...prevState.room_list,new_room]
      }))
    })

    socket.on('room_message', (msg) => {
      this.setState((prevState) => ({ 
        messages: [...prevState.messages,msg]
      }))
    })

    socket.on('new message order', (msg_list) => {
      this.setState({messages : msg_list})
    })

    socket.on('client count' , (count) => {
      this.setState({client_count : count})
    })

  }

  clickHandle(e) {
    e.preventDefault()
    socket.emit('add message event', {'message':this.state.new_message, 'room': this.state.room})
    this.setState({new_message:''})
  }

  clickHandleJoinRoom(e) {
    e.preventDefault()
    socket.emit('join', this.state.new_room)
  }

 
  render() {
    if(this.state.room === null) {
      return (
        <div>
          <p>Welcome to Mentos</p>
          <FlipMove typeName='ul'>
              {
                this.state.room_list.map((room_name) => 
                  <li  key={room_name} onClick={() => {socket.emit('join', room_name)}} >
                    {room_name}
                  </li>
                )
              }
          </FlipMove>
          {this.render_roomjoin_button}
          <form>
            <input value={this.state.new_room} name="join_room" onChange={e => this.setState({new_room:e.target.value})} />
            <button onClick={(e) => {this.clickHandleJoinRoom(e)}}>Create a room</button>
          </form>

        </div>
      )
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>The current time is {this.state.currentTime}.</p>
          <p> There are {this.state.client_count} users connected</p>
          <FlipMove typeName='ul'>
              {
                this.state.messages.map((message, index) => 
                  <li key={message.timestamp + message.message} >
                    {message.message} {message.score}
                    <button onClick={(e)=>{
                      e.preventDefault(); socket.emit('upvote', {'room':this.state.room, 'position': index} );
                    }}>
                    upvote
                    </button>
                  </li>
                )
              }
          </FlipMove>
         
          <form>
            <input value={this.state.new_message} name="new_message" onChange={e => this.setState({new_message:e.target.value})} />
            <button onClick={(e) => {this.clickHandle(e)}}>Send Message</button>
          </form>
        </header>
      </div>
    );
  }
  
}

export default App;
