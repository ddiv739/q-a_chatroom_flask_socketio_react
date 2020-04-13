import React, { Component } from 'react';
import socketIOClient from 'socket.io-client'
import FlipMove from 'react-flip-move'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'

import './App.css';

var socket
class App extends Component {

  constructor() {
    super();
    this.state = {
      endpoint : "http://localhost:5000",
      messages : [],
      currentTime: 0,
      new_message : "",
      new_room : "",
      client_count: 0,
      room : null,
      room_list : []
    }
    socket = socketIOClient(this.state.endpoint)
    this.clickHandleMessage = this.clickHandleMessage.bind(this)
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

    socket.on('connect_error', function() {
      //TODO handle error correctly. If in room revert to landing. If landing add element.

      //TODO if already on landing show an error toast
      console.log('Error connecting to server');
    });

    socket.on('error', function() {
      // System error. denotes a failure in client.
      console.log('Error in input packet or room');
    });

  }

  clickHandleMessage(e) {
    e.preventDefault()
    if(this.state.new_message === ''){
      return
    }
    socket.emit('add message event', {'message':this.state.new_message, 'room': this.state.room})
    this.setState({new_message:''})
  }

  clickHandleJoinRoom(e) {
    e.preventDefault()
    socket.emit('join', this.state.new_room)
  }

 
  render() {
      return (
        <div className = 'parent_div' >
          <Container fluid className = 'parent_container'>
            <Row  className = 'align-items-center' style={{height:'100vh'}}>
              <Col >
                { this.state.room === null &&
                  <Card className="centered align-center-center" >
                    <Card.Title><h1>Collaborative Q&A Time!</h1></Card.Title>
                    <Card.Body style={{width:'100%'}}>
                      <p>Welcome to Collaborative Q&A Time. There is currently {this.state.client_count} users engaging in conversation.</p>
                      <p>Hosts: Create a room and set a unique password to control your selected questions with.
                      <br />Users: Select your room from the listing below.</p>
                      <p>All hosts and users are fully anonymised but please remember that room entry is not password controlled so anyone may join a session. Ask your questions accordingly.</p>

                      <h3>Active Rooms</h3>
                        {
                          this.state.room_list.length===0 &&
                            <p>There are no active rooms. Create one to get rolling!</p>
                        }
                      <ListGroup className="list-group-flush" >
                        <FlipMove>
                          {
                            this.state.room_list.map((room_name) => 
                              <ListGroup.Item 
                                key={room_name} 
                                onClick={() => {socket.emit('join', room_name)}} >
                                <Button variant="primary" style={{minWidth:'35%', maxWidth:'35%'}}>{room_name}</Button>
                              </ListGroup.Item>
                            )
                          }
                        </FlipMove>
                      </ListGroup>
                    </Card.Body>
                    <Card.Body>
                    <Form inline onSubmit={this.clickHandleJoinRoom}>
                        <Form.Control value={this.state.new_room} name="join_room" onChange={e => this.setState({new_room:e.target.value})}/>
                        <Button type='submit'>Create a room</Button>
                      </Form>
                    </Card.Body>
                  </Card>
                }
                {this.state.room !== null && 
                  <Card className="centered align-center-center" >
                    <Card.Title><h1>{this.state.room} Room.</h1></Card.Title>
                      <Card.Body style={{width:'100%'}}>
                      <Row style={{minWidth:'100%', maxWidth:'100%'}}>
                          <Col>
                            Current Votes
                          </Col>
                          <Col>
                            Question
                          </Col>
                          <Col>
                            Upvote
                          </Col>
                        </Row>
                        {this.state.messages.length === 0 && 
                        <p> There are currently no messages. Let`&apos;`s get this party started!</p>}
                        <ListGroup className="list-group-flush" style={{maxHeight:'40vh',overflowY:'auto'}} >
                          <FlipMove>
                            {
                                this.state.messages.map((message, index) =>  
                                  <ListGroup.Item key={message.timestamp + message.message} >
                                    <Row style={{minWidth:'100%', maxWidth:'100%'}}>
                                      <Col>
                                        {message.score}
                                      </Col>
                                      <Col>
                                        {message.message} 
                                      </Col>
                                      <Col>
                                        <Button onClick={(e)=>{
                                          e.preventDefault(); 
                                          socket.emit('upvote', {'room':this.state.room, 'position': index} );
                                          }}>
                                          ^
                                        </Button>
                                      </Col>
                                    </Row>

                                  </ListGroup.Item>
                                )
                            }
                          </FlipMove>
                        </ListGroup>
                      </Card.Body>
                      <Card.Body style={{width:'100%'}}>
                        <Form inline onSubmit={this.clickHandleMessage} fluid>
                          <Form.Control value={this.state.new_message} name="new_message" onChange={e => this.setState({new_message:e.target.value})} style={{width:'70%'}}/>
                          <Button type='submit' style={{width:'30%'}}>Send Message</Button>
                        </Form>
                      </Card.Body>
                    <Button type='submit' onClick={(e) => {e.preventDefault(); this.setState({room: null});     fetch('/roomlist').then(res => res.json()).then(data => {
                                                      console.log(data)
                                                      this.setState({room_list: data.room_list})
                                                      });
                                                  }}>
                      Go Back
                    </Button>
                  </Card>
                }
              </Col>            
            </Row>
          </Container>
        </div>
      )
  }
}

export default App;
