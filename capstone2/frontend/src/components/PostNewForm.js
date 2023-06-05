import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Modal, Upload, notification } from "antd";
import { FrownOutlined, PlusOutlined } from "@ant-design/icons";
import { getBase64FromFile } from "utils/base64";
import { useAppContext } from "store";
import { useNavigate } from "react-router-dom";
//import { axiosInstance } from "api";
import { parseErrorMessages } from "utils/forms";
import Axios from "axios";
import "../css/PostNewForm.css";

export default function PostNewForm() {
  const {
    store: { jwtToken, username },
  } = useAppContext();

  const history = useNavigate();
  const [loginState, setLoginState] = useState(localStorage.username);
  const [fileList, setFileList] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [previewImage, setPreviewImage] = useState({
    visible: false,
    base64: null,
  });

  useEffect(() => {
    // console.log(localStorage.username, username, loginState, "성공");
    setLoginState(username);
  }, [localStorage]);

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  // 이미지 preview
  const handlePreviewImage = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64FromFile(file.originFileObj);
    }

    setPreviewImage({
      visible: true,
      base64: file.url || file.preview,
    });
  };

  const handleFinish = async (fieldValues) => {
    console.log("fieldValues: ", fieldValues);
    const {
      dataset,
      label_name,
      images: { fileList },
    } = fieldValues;

    console.log("> ", fileList);

    // Form data 구조 수정
    const formData = new FormData();
    formData.append("dataset", dataset);
    formData.append("label_name", label_name);
    fileList.forEach((file) => {
      formData.append("image", file.originFileObj);
    });

    // formData 내용물 확인
    for (let key of formData.keys()) {
      console.log(key, ":", formData.get(key));
    }

    const headers = { Authorization: `JWT ${jwtToken}` };
    try {
      const response = await Axios.post(
        "http://localhost:8000/api/post/",
        formData,
        {
          headers,
        }
      );
      console.log("success response :", response);
      history("/");
    } catch (error) {
      console.log("error: ", error);
      if (error.response) {
        const { status, data: fieldsErrorMessages } = error.response;

        if (typeof fieldsErrorMessages === "string") {
          notification.open({
            message: "서버 오류",
            description: `에러) ${status} 응답을 받았습니다. 서버 에러를 확인해주세요.`,
            icon: <FrownOutlined style={{ color: "#ff3333" }} />,
          });
        } else {
          setFieldErrors(parseErrorMessages(fieldsErrorMessages));
        }
      }
    }
  };

  const handleHome = () => {
    history("/");
  };
  // const handleLogOut = () => {
  //   localStorage.removeItem("username");
  //   // loginCheck();
  //   // alert("로그아웃 되었습니다!");
  //   history("/");
  // };
  const handleSignUp = () => {
    history("../accounts/signup");
  };

  const handleLogin = () => {
    history("../accounts/login");
  };

  return (
    <div className="PostNewForm-page">
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
            {loginState ? (
              <li onClick={handleHome}>Home</li>
            ) : (
              <li onClick={handleLogin}>Log In</li>
            )}
          </ul>
        </div>
      </header>

      <h2 className="h2-Labeling">Labeling</h2>
      <Form
        {...layout}
        className="Total-form"
        name="basic"
        initialValues={{ remember: true }}
        onFinish={handleFinish}
      >
        <div className="DataLabel-form">
          <Form.Item
            className="Database-Form"
            label="Dataset"
            name="dataset"
            rules={[
              {
                required: true,
                message: "데이터셋을 입력하세요",
              },
            ]}
            hasFeedback
            // {...fieldErrors.label}
            {...fieldErrors.non_field_errors}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Label"
            name="label_name"
            rules={[
              {
                required: true,
                message: "레이블을 입력하세요",
              },
            ]}
            hasFeedback
            {...fieldErrors.label}
            {...fieldErrors.non_field_errors}
          >
            <Input />
          </Form.Item>
        </div>

        <div className="ImageUpload-form">
          <p>Images업로드</p>
          <Form.Item
            className="Upload-form"
            //   label="Images업로드"
            name="images"
            rules={[
              {
                required: true,
                message: "사진을 업로드하세요.",
              },
            ]}
            hasFeedback
            {...fieldErrors.image}
          >
            <Upload
              className="UploadClass"
              listType="picture-card"
              fileList={fileList}
              multiple
              beforeUpload={() => {
                return false;
              }}
              onChange={handleUploadChange}
              onPreview={handlePreviewImage}
            >
              <div class="PlusIconDiv">
                <PlusOutlined className="PlusIcon" />
                {/* <div className="ant-upload-text">Upload</div> */}
              </div>
            </Upload>
          </Form.Item>
        </div>

        <Form.Item {...tailLayout}>
          <button className="submit-button" type="primary" htmlType="submit">
            Submit
          </button>
        </Form.Item>

        <Modal
          visible={previewImage.visible}
          footer={null}
          onCancel={() => setPreviewImage({ visible: false })}
        >
          <img
            src={previewImage.base64}
            style={{ width: "100%" }}
            alt="preview"
          />
        </Modal>
        <hr />
      </Form>
    </div>
  );
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};