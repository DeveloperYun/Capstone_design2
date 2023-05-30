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
    history("../accounts/signup");
  };

  const handleLogin = () => {
    history("../accounts/login");
  };

  return (
    <div class="PostNewForm-page">
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
            <li onClick={handleLogin}>Log Out</li>
          </ul>
        </div>
      </header>
      <Card className="Dataset">
        <h2 class="h2-Labeling">Labeling</h2>

        <Form
          {...layout}
          className="Total-form"
          name="basic"
          initialValues={{ remember: true }}
          onFinish={handleFinish}
        >
          <div class="DataLabel-form">
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

          {/* 여기가 사진 업로드 하는 곳*************************** */}
          <div class="ImageUpload-form">
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
              <div class="please">
                <Upload
                  className="Upload-form2222222222"
                  listType="picture-card"
                  fileList={fileList}
                  multiple
                  beforeUpload={() => {
                    return false;
                  }}
                  onChange={handleUploadChange}
                  onPreview={handlePreviewImage}
                >
                  {/* <div class="Upload-form22222"> */}
                  <br />
                  <PlusOutlined className="PlusIcon" />
                  {/* <div className="ant-upload-text">Upload</div> */}
                  {/* </div> */}
                </Upload>
              </div>
            </Form.Item>
          </div>

          <Form.Item {...tailLayout}>
            <Button className="submit-button" type="primary" htmlType="submit">
              Submit
            </Button>
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
      </Card>
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
