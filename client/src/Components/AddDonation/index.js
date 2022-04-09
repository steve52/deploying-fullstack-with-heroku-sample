import React, {Component} from 'react';

export default class AddDonation extends Component {
  constructor(props) {
    super(props);
    console.log('HELLLLOO')
    this.state = {
      name: '',
      amount: '',
      sending: false,
      sent: true,
      showForm: true
    }
  }
  handleNameChange = (event) => {
    this.setState({name: event.target.value});
  }
  handleAmountChange = (event) => {
    this.setState({amount: event.target.value});
  }
  onSubmit = (e) => {
    e.preventDefault();
    console.log('ON CLICK', e);
      console.log('this.state', this.state);
    const formData = {
      name: this.state.name,
      amount: this.state.amount
    }
    this.setState({
      showForm: false,
      sending: true
    })
    fetch('http://localhost:5000/donations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      console.log('Success:', response)
      this.setState({
        showForm: false,
        sending: false,
        name: '',
        amount: ''
      })
    })
    .catch(error => console.error('Error:', error));
  }

  render() {

    let content;
      if (this.state.showForm) {
        content = (
          <form onSubmit={this.onSubmit}>
            Name: <input name="name" type="text" value={this.state.name} onChange={this.handleNameChange} />
            Amount: <input name="amount" type="number" value={this.state.amount} onChange={this.handleAmountChange} />
            <button type="submit">Submit</button>
          </form>
        )
      } else if (this.state.sending) {
        content = (
          <div>Sending...</div>
        );
      } else {
        setTimeout(() => {
          this.setState({
            showForm: true
          })
        }, 2000);
        content = (
          <div>Thanks for the donation!</div>
        );
      }
    return (
      <div>
        <h1>Add a Donation</h1>
          {content}
      </div>
    )
  }
}
