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
  const [imgSrc, setImgSrc] = useState("");

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

  const handleSignUp = () => {
    history("/accounts/signup");
  };
  // const loginCheck = () => {
  //   setLoginState(localStorage.username);
  // };

  // const logout = () => {
  //   // localStorage.clear();
  //   localStorage.removeItem("username");
  //   loginCheck();
  //   alert("로그아웃 되었습니다!");
  //   history("/");
  // };

  const handleLogin = () => {
    history("/accounts/login");
  };

  const handleImageUpload = (event) => {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);

      // 파일리더 생성
      var preview = new FileReader();
      preview.onload = function (e) {
        // img id 값
        document.getElementById("user-image").src = e.target.result;
        setImgSrc(e.target.result);
      };
      // input id 값
      preview.readAsDataURL(document.getElementById("chooseFile").files[0]);
    }
  };

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
          <a className="logo">
            Nocode <b onClick={handleHome}>AI platform</b>
          </a>
          <ul className="links">
            {/* <li onClick={handleHome} style={{ color: "black" }}>
              Home
            </li> */}
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

            <li onClick={handleHome}>Home</li>
          </ul>
        </div>
      </header>

      <h2 className="h2-Labeling">
        <a href="/train" style={{ color: "black" }}>
          Result
        </a>
      </h2>

      {/* 파일 업로드 */}
      {resultMessage ? (
        // 결과반환
        <div className="result-message">
          <h1 class="test-h1">{resultMessage} 입니다!</h1>
          <div className="Image-Area">
            <img class="user-image" id="user-image" src={imgSrc} alt="" />
          </div>
        </div>
      ) : (
        // 파일 업로드
        <div className="ImageUpload-form-train">
          <h1 class="test-h1">테스트 이미지 업로드</h1>

          <div className="Image-Area">
            <img
              class="user-image"
              id="user-image"
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
        </div>
      )}

      <hr />
    </div>
  );
}

export default Train;