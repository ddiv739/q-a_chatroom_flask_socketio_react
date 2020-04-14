## Overview
A simple LAN oriented Q&A application composed of a  server + client that supports individual rooms and anonymous question. 
To get started a host may create a room which will appear in an active room list. Clients may join this room, ask questions and have their questions upvoted for priority in answering - all in real time.

Built using Python (Flask, Flask-SocketIO) and ReactJS (React-flip-move, react-bootstrap).

## Features

+ 'Real-time' question asking
+ Question upvoting and sorting by upvotes
+ Named rooms 
+ Room based questions
+ Refresh handling

## Not Implemented

+ Security (CSRF/XSS etc)
+ Message packet optimisation (Upvoting triggers entire history re-send at present if order requires update)
+ Hosting mode (Probably TODO next via sessions. A host mode to show if host is connected and which question they are answering )
+ Input Validation (low hanging fruit)
+ Robust error handling

##  How to run locally

To run locally is as simple as cloning this repo. Running `npm install` to install client dependencies then `cd/server` to navigate to the server's location and running `pip install -r requirements.txt` to install python packages.

From this point simply open up 2 terminals - both navigated to the root folder. and run:
`npm start` to run the client
`npm run-script start-api` to run the server (alternatively you can navigate into the server's folder and run `python app.py`

Both will now hot reload on any change if you wish to work on anything.

##To run on a local network without deploying
TODO - in a nutshell find all instances of localhost in the client (should be in App.js and package.json) and replace localhost with your current machine's ip. This is a sub-optimal route to take as both node and python will be running their respective development environments.

It's highly reccomended to run `npm build` before serving up the client if you plan to use this in . See below

##How to deploy
TODO
