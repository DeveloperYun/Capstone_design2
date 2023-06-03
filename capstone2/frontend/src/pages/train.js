import React, { useState, useEffect } from "react"; // useState 추가
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Axios from "axios";
import { useAppContext } from "store";

function Train() {
  const {
    store: { jwtToken },
  } = useAppContext();

  const history = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 상태 추가
  const [username, setUsername] = useState(""); // 유저명 상태 추가
  const [dataset, setDataset] = useState(""); // 데이터셋 상태 추가

  useEffect(() => {
    // 로컬 스토리지에서 유저명 가져오기
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // 로컬 스토리지에서 데이터셋 가져오기
    const storedDataset = localStorage.getItem("dataset");
    if (storedDataset) {
      setDataset(storedDataset);
    }
  }, []);

  const handleSignUp = () => {
    history("/accounts/signup");
  };

  const handleLogin = () => {
    history("/accounts/login");
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
  };

  const handleResultView = () => {
    const headers = { Authorization: `JWT ${jwtToken}` };

    if (selectedImage && username) {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("username", username);
      formData.append("dataset", dataset);

      Axios.post("http://localhost:8000/result/", formData,{headers})
      .then(response => {
        console.log("success response:", response);
      })
      .catch(error => {
        console.log("error:", error);
      });
    }
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
            {/* 이미지 업로드 input 추가 */}
            <input type="file" onChange={handleImageUpload} />
            <button onClick={handleResultView}>결과보기</button>
          </div>
          <div className="image"></div>
        </div>
      </div>
    </div>
  );
}

export default Train;
