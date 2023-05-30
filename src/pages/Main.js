import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import "./Main.css";

function Main() {
  const history = useNavigate();

  const handleSignUp = () => {
    history("/accounts/signup");
  };

  const handleLogin = () => {
    history("/accounts/login");
  };

  return (
    <div className="landing-page">
      <header>
        <div className="container">
          <a href="#" className="logo">
            Your <b>Website</b>
          </a>
          <ul className="links">
            <li>Home</li>
            <li>About Us</li>
            <li>Work</li>
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
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Repellendus odit nihil ullam nesciunt quidem iste, Repellendus
              odit nihil
            </p>
            <button>Button name</button>
          </div>
          <div className="image">
            <img
              src="https://i.postimg.cc/65QxYYzh/001234.png"
              alt="Landing Page Image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
