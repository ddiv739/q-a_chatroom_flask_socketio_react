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
      endpoint : "http://192.168.1.151:5000",
      messages : [],
      currentTime: 0,
      new_message : "",
      client_count: 0
    }
    socket = socketIOClient(this.state.endpoint)
    this.clickHandle = this.clickHandle.bind(this)
  }

  componentDidMount() {

    socket.on('message', (msg) => {
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

    //replace with fetching messages
    fetch('/time').then(res => res.json()).then(data => {
      this.setState({currentTime: data.time})
    });

    fetch('/history').then(res => res.json()).then(data => {
      this.setState({messages: data.history})
    });
  }

  clickHandle(e) {
    e.preventDefault()
    socket.emit('add message event', this.state.new_message)
    this.setState({new_message:''})
  }


  render() {
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
                      e.preventDefault(); socket.emit('upvote', index );
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
