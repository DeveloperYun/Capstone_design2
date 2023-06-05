import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Axios from "axios";
import { useAppContext } from "store";

function Home() {
  const [dataset, setDataset] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginState, setLoginState] = useState(localStorage.username);
  const [loading, setLoading] = useState(false);

  const history = useNavigate();
  // console.log(localStorage, loginState, localStorage.username);
  useEffect(() => {
    // console.log(localStorage.username, username, loginState, "성공");
    setLoginState(username);
  }, [localStorage]);

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
    setLoading(false);
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
    setLoading(true);
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
        localStorage.setItem("dataset", dataset);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const loginCheck = () => {
    setLoginState(localStorage.username);
  };

  const logout = () => {
    // localStorage.clear();
    localStorage.removeItem("username");
    loginCheck();
    alert("로그아웃 되었습니다!");
  };

  return (
    <div className="landing-page">
      <header>
        <div className="container">
          <a href="/" className="logo">
            Nocode <b>AI platform</b>
          </a>
          <ul className="links">
            <li>
              <a href="/" style={{ color: "black" }}>
                Home
              </a>
            </li>
            <li>
              <a
                href="https://github.com/DeveloperYun/Capstone_design2"
                target="_blank"
                style={{ color: "black" }}
              >
                About Us
              </a>
            </li>
            <li onClick={handleSignUp}>Sign Up</li>
            {loginState ? (
              <li onClick={logout}>Log Out</li>
            ) : (
              <li onClick={handleLogin}>Log In</li>
            )}
          </ul>
        </div>
      </header>
      <div className="content">
        <div className="container">
          <div className="info">
            <h1>Easy to A.I modeling</h1>
            <p>
              코딩을 몰라도, AI를 몰라도 손쉽게 머신러닝 모델링을 할 수 있는
              저희의 플랫폼을 소개합니다. 두 번의 라벨링을 통해 정확한
              이진분류가 가능한 모델을 경험해보세요
            </p>
            {!loginState && (
              <p>
                <br />
                로그인 후 이용하세요
              </p>
            )}
            {loginState && <button onClick={handleFunc}>라벨링</button>}
            {loginState && <button onClick={handleTrain}>학습하기</button>}
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
            {/* 로딩 */}
            {/* {loading && <h2 class="loading">Loading...</h2>} */}
            {loading && (
              <img
                src="https://i.postimg.cc/0jWH0T0W/Loading.gif"
                width="70px"
                height="70px"
              />
            )}

            <br />
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
