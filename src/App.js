import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import socketIOClient from 'socket.io-client'

var socket
class App extends Component {

  constructor() {
    super();
    this.state = {
      endpoint : "http://192.168.1.151:5000",
      messages : [],
      currentTime: 0,
      new_message : ""
    }
    socket = socketIOClient(this.state.endpoint)
    this.clickHandle = this.clickHandle.bind(this)
  }

  componentDidMount() {
    socket.emit('add message event','yo it worked')

    socket.on('message', (msg) => {
      console.log(msg);
      this.setState((prevState) => ({
        messages: [...prevState.messages,msg]
      }))
    })
    //replace with fetching messages
    fetch('/time').then(res => res.json()).then(data => {
      this.setState({currentTime: data.time})
    });
  }

  clickHandle() {
    socket.emit('add message event', this.state.new_message)
    this.setState({new_message:''})
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <p>The current time is {this.state.currentTime}.</p>
          <ul>
            {
              this.state.messages.map((message) => 
                <li key={message}>
                  {message}
                </li>
              )
            }
          </ul>
        
          <input value={this.state.new_message} name="new_message" onChange={e => this.setState({new_message:e.target.value})} />
          <button onClick={this.clickHandle}>Send Message</button>
        </header>
      </div>
    );
  }
  
}

export default App;
