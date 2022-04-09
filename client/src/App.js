import React, { Component } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import Ticker from './Components/Ticker';
import Layout from './Components/Layout';
import AddDonation from './Components/AddDonation';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route index element={<Ticker />} />  
            <Route path="add" element={<AddDonation />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
