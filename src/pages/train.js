import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Modal, Upload, notification } from "antd";
import { FrownOutlined, PlusOutlined } from "@ant-design/icons";
import { getBase64FromFile } from "utils/base64";
import { useAppContext } from "store";
import { useNavigate } from "react-router-dom";
//import { axiosInstance } from "api";
import { parseErrorMessages } from "utils/forms";
import Axios from "axios";
import "../css/train.css";

export default function Train() {
  const [state, setState] = useState(true);

  const {
    store: { jwtToken },
  } = useAppContext();

  const history = useNavigate();

  const [fileList, setFileList] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [previewImage, setPreviewImage] = useState({
    visible: false,
    base64: null,
  });

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

  const handleSignUp = () => {
    history("/accounts/signup");
  };

  const handleLogin = () => {
    history("/accounts/login");
  };

  const handleFunc = () => {
    history("/posts/new");
  };

  return (
    <div>
      {state ? (
        <div className="PostNewForm-page">
          <header>
            <div className="container">
              <a href="#" className="logo">
                Your <b onClick={handleHome}>Website</b>
              </a>
              <ul className="links">
                <li>Home</li>
                <li>About Us</li>
                <li>Work</li>
                <li>Info</li>
                <li onClick={handleSignUp}>Sign Up</li>
                <li onClick={handleHome}>Log Out</li>
              </ul>
            </div>
          </header>

          <h2 className="h2-Labeling">Result</h2>
          <Form
            {...layout}
            className="Total-form"
            name="basic"
            initialValues={{ remember: true }}
            onFinish={handleFinish}
          >
            <div className="ImageUpload-form-train">
              <h1>테스트 이미지 업로드</h1>
              <Form.Item
                className="Upload-form-train"
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
                  className="UploadClass-train"
                  listType="picture-card"
                  fileList={fileList}
                  // multiple
                  beforeUpload={() => {
                    return false;
                  }}
                  onChange={handleUploadChange}
                  onPreview={handlePreviewImage}
                >
                  <div class="PlusIconDiv-train">
                    <PlusOutlined className="PlusIcon-train" />
                  </div>
                </Upload>
              </Form.Item>
            </div>

            <Form.Item {...tailLayout}>
              <button
                className="result-button"
                type="primary"
                htmlType="result"
              >
                결과보기
              </button>
            </Form.Item>

            {/* 가져온 사진 눈알 아이콘 누르면 크게 preview해주는코드 */}
            {/* <Modal
          visible={previewImage.visible}
          footer={null}
          onCancel={() => setPreviewImage({ visible: false })}
        >
          <img
            src={previewImage.base64}
            style={{ width: "100%" }}
            alt="preview"
          />
        </Modal> */}
            <hr />
          </Form>
        </div>
      ) : (
        // 여기가 결과
        <div>
          <h1>결과는 땡땡땡 입니다.</h1>
        </div>
      )}
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
