import React, { Component } from "react"

import 'bootstrap/dist/css/bootstrap.min.css';


import Header from './header';
import Footer from './footer';

export default function Home() {
  return (
    <div>
      <Header />
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-12">
            <h1>Home Page</h1>
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry...
            </p>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-md-4">
            <h2>Section 1</h2>
            <p>More content here...</p>
          </div>
          <div className="col-md-4">
            <h2>Section 2</h2>
            <p>More content here...</p>
          </div>
          <div className="col-md-4">
            <h2>Section 3</h2>
            <p>More content here...</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}