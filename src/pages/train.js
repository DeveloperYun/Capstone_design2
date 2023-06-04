import React, { useState, useEffect } from "react"; // useState 추가
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Axios from "axios";
import { useAppContext } from "store";
import "../css/train.css";

function Train() {
  const {
    store: { jwtToken },
  } = useAppContext();

  const history = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 상태 추가
  const [username, setUsername] = useState(""); // 유저명 상태 추가
  const [dataset, setDataset] = useState(""); // 데이터셋 상태 추가
  const [resultMessage, setResultMessage] = useState(""); // Add result message state

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

  const handleHome = () => {
    history("/");
  };

  const handleLogOut = () => {
    localStorage.removeItem("username");
    // loginCheck();
    // alert("로그아웃 되었습니다!");
    history("/");
  };

  const handleSignUp = () => {
    history("/accounts/signup");
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);

    // 파일리더 생성
    var preview = new FileReader();
    preview.onload = function (e) {
      // img id 값
      document.getElementById("user-image").src = e.target.result;
    };
    // input id 값
    preview.readAsDataURL(document.getElementById("chooseFile").files[0]);
  };

  // const PreviewImage = () => {
  //   // 파일리더 생성
  //   var preview = new FileReader();
  //   preview.onload = function (e) {
  //     // img id 값
  //     document.getElementById("user-image").src = e.target.result;
  //   };
  //   // input id 값
  //   preview.readAsDataURL(document.getElementById("chooseFile").files[0]);
  // };

  const handleResultView = () => {
    const headers = { Authorization: `JWT ${jwtToken}` };

    if (selectedImage && username) {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("username", username);
      formData.append("dataset", dataset);

      Axios.post("http://localhost:8000/result/", formData, { headers })
        .then((response) => {
          console.log("success response:", response);
          setResultMessage(response.data.message);
        })
        .catch((error) => {
          console.log("error:", error);
        });
    }
  };

  return (
    // <div className="landing-page">
    <div className="Result-page">
      <header>
        <div className="container">
          <a href="#" className="logo">
            Your <b onClick={handleHome}>Website</b>
          </a>
          <ul className="links">
            <li href="#">Home</li>
            <li>About Us</li>
            <li>Info</li>
            <li onClick={handleSignUp}>Sign Up</li>
            <li onClick={handleLogOut}>Log Out</li>
          </ul>
        </div>
      </header>

      <h2 className="h2-Labeling">Result</h2>

      <div className="ImageUpload-form-train">
        <h1 class="test-h1">테스트 이미지 업로드</h1>

        {/* 이미지 업로드 input 추가 */}

        <div className="Image-Area">
          <img
            class="user-image"
            id="user-image"
            // src="https://i.postimg.cc/Vst6HXrN/bono.gif"
            // src="https://i.postimg.cc/6qJ3mjLB/icons-1151-256.gif"
            // src="https://i.postimg.cc/FRFGJpJs/folder-1.png"
            src="https://i.postimg.cc/7hdNdytf/folder.png"
            alt=""
          />
        </div>

        <div className="File-Area">
          <label class="file-label" for="chooseFile">
            Choose File
          </label>
          <input
            className="File-Area-Input"
            id="chooseFile"
            type="file"
            onChange={handleImageUpload}
            // onChange={PreviewImage}
          />
        </div>

        <div className="result-Area">
          <button className="result-button" onClick={handleResultView}>
            결과보기
          </button>
        </div>
        <div className="image"></div>
      </div>

      {resultMessage && (
        <div className="result-message">
          <h2>Result</h2>
          <p>{resultMessage}</p>
        </div>
      )}
      <hr />
    </div>
  );
}

export default Train;
