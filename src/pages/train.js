import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Axios from "axios";

function Train() {
  const history = useNavigate();

  const handleSignUp = () => {
    history("/accounts/signup");
  };

  const handleLogin = () => {
    history("/accounts/login");
  };

  const handleFunc = () => {
    history("/posts/new");
  }


  return (
    <div className="landing-page">
      <header>
        <div className="container">
          <a href="#" className="logo">
            Your <b>Website</b>
          </a>
          <ul className="links">
            <li href="#">Home</li>
            <li>About Us</li>
            <li>Info</li>
            <li onClick={handleSignUp}>Sign Up</li>
            <li onClick={handleLogin}>Log In</li>
          </ul>
        </div>
      </header>
      <div className="content">
        <div className="container">
          <div className="info">
            <h1>Looking For Inspiration</h1>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus odit nihil ullam nesciunt quidem
              iste, Repellendus odit nihil
            </p>
            <button onClick={handleFunc}>바로가기</button>
          </div>
          <div className="image">
          </div>
        </div>
      </div>
    </div>
  );
}

export default Train;
