import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Axios from "axios";
import { useAppContext } from "store";

function Home() {
  const [dataset, setDataset] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const history = useNavigate();

  const {
    store: { jwtToken, username },
  } = useAppContext();

  const handleSignUp = () => {
    history("/accounts/signup");
  };

  const handleLogin = () => {
    history("/accounts/login");
  };

  const handleFunc = () => {
    history("/posts/new");
  };

  const handleTrain = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleDatasetChange = (event) => {
    setDataset(event.target.value);
  };

  const handleTrainSubmit = () => {
    const data = {
      username: username,
      dataset: dataset,
    };

    console.log(">> ", data);
    Axios.post("http://localhost:8000/train/", data, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log(response.data);
        setIsModalOpen(false);
        history("/train");
      })
      .catch((error) => {
        console.error(error);
      });
  };

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
            <h1>Label, Train, Feedback</h1>
            <p>
              L.T.F simplifies the process of machine learning into three easy
              steps. Collect and label your images. Train your model and
              understand your results. Then play, improve, and export your
              model.
            </p>
            <button onClick={handleFunc}>라벨링</button>
            <button onClick={handleTrain}>학습하기</button>
          </div>
          <div className="image">
            <img
              src="https://i.postimg.cc/65QxYYzh/001234.png"
              alt="Landing Page Image"
            />
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>학습시킬 데이터 셋을 입력하세요</h2>
            <input
              type="text"
              value={dataset}
              onChange={handleDatasetChange}
              placeholder="Enter dataset"
            />
            <div className="modal-buttons">
              <button onClick={handleTrainSubmit}>Submit</button>
              <button onClick={handleModalClose}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;