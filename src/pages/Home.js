import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import "../css/Home.css";

function Home() {
  const history = useNavigate();

  const handleLabel = () => {
    history("/posts/new");
  };

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
            <h1>Label, Train, Feedback</h1>
            <p>
              L.T.F simplifies the process of machine learning into three easy
              steps. Collect and label your images. Train your model and
              understand your results. Then play, improve, and export your
              model.
            </p>
            <button onClick={handleLabel}>나만의 모델 만들기</button>
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

export default Home;
