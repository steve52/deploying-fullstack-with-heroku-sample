import React, { Component } from 'react';
import urls from './gifurls';

export default class Ticker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      total: 0,
      last_donation: null,
      websocketError: false,
      currentGifUrl: null
    }
  }

  _getRandomGif = () => {
    const randomIndex = Math.floor(Math.random() * urls.length);
    this.setState({
      currentGifUrl: urls[randomIndex],
    })
  }

  _connectToServer = () => {
    const HOST = window.location.origin.replace(/^http/, 'ws')
    const ws = new WebSocket(HOST);
    ws.onerror = (err) => {
      console.log('err', err);
      this.setState({
        websocketError: true,
      })
    };
    ws.onopen = (err) => {
      console.log('err', err);
      this.setState({
        websocketError: false,
      })
    };
    // Event listener for recieving websocket messages from the server
    ws.addEventListener('message', this._handleMessage );
  }
  _handleMessage = (message) => {
    console.log('message', message);
    if (message.data === 'connection established.') {
      return;
    }
    const data = JSON.parse(message.data);
    this.setState({
      total: data.total,
      last_donation: data.donation
    })
    this._getRandomGif();
  }
  componentDidMount() {
    this._connectToServer();
  }
  render() {
    return (
      <div className="App">
        <h2>Funds raised for The Joyful Heart Foundation - TEST</h2>
        <h1>${this.state.total}</h1>

        {this.state.last_donation &&
          <div>
            <span>Thanks {this.state.last_donation.name || 'Anonymous Do-gooder'}!</span>
            <br/><br/>
            <div>
              <img src={this.state.currentGifUrl} alt=""/>
            </div>
          </div>
        }

          {this.state.websocketError &&
          <div>
            <span>Websocket Error</span><br/>
            <button onClick={this._connectToServer}>Try to connect again</button>
          </div>
        }
      </div>
    );
  }
}
