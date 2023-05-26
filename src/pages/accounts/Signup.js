import React, { useState, useEffect } from "react";
import Axios from "axios";
import { SmileOutlined, FrownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, notification } from "antd";
import "../../css/Signup.css";

export default function Signup() {
  const history = useNavigate();
  const [fieldErrors, setFieldErrors] = useState({});

  const onFinish = (values) => {
    async function fn() {
      const { username, password } = values;

      setFieldErrors({});

      const data = { username, password };
      try {
        await Axios.post("http://localhost:8000/accounts/signup/", data);
        notification.open({
          message: "회원가입을 축하합니다",
          description: "로그인 페이지로 이동합니다",
          icon: <SmileOutlined style={{ color: "#10Bee9" }} />,
        });

        history("/accounts/login/");
      } catch (error) {
        if (error.response) {
          notification.open({
            message: "회원가입 실패",
            description: "아이디 및 비밀번호를 다시 확인해주세요",
            icon: <FrownOutlined style={{ color: "#ff3333" }} />,
          });

          const { data: fieldsErrorMessage } = error.response;

          setFieldErrors(
            Object.entries(fieldsErrorMessage).reduce(
              (acc, [fieldName, errors]) => {
                acc[fieldName] = {
                  validateStatus: "error",
                  help: errors.join(" "),
                };
                return acc;
              },
              {}
            )
          );
        }
      }
    }
    fn();
  };

  const handleHome = () => {
    history("/");
  };

  const handleLogin = () => {
    history("/accounts/login");
  };

  return (
    <div class="signup">
      <div class="wrapper fadeInDown">
        <div id="formContent">
          {/* <!-- Tabs Titles --> */}
          <h2 class="active underlineHover" onClick={handleLogin}>
            {" "}
            LOGIN{" "}
          </h2>
          <h2 class="inactive ">Sign Up </h2>
          {/* <!-- Icon --> */}
          {/* <div class="fadeIn first">
      <img
        src="http://danielzawadzki.com/codepen/01/icon.svg"
        id="icon"
        alt="User Icon"
      />
    </div> */}

          {/* <!-- Login Form --> */}
          <form>
            <input
              type="text"
              id="username"
              class="fadeIn second"
              name="signup"
              placeholder="user name"
            />
            <input
              type="text"
              id="password"
              class="fadeIn third"
              name="signup"
              placeholder="password"
            />
            <input
              type="text"
              id="Re-enter password"
              class="fadeIn third"
              name="signup"
              placeholder="Re-enter password"
            />

            <input type="submit" class="fadeIn fourth" value="Log In" />
          </form>

          {/* <!-- Remind Passowrd --> */}
          <div id="formFooter">
            <a class="underlineHover" href="#" onClick={handleHome}>
              Home
            </a>
          </div>
        </div>
      </div>
    </div>
    // <Form
    //   {...layout}
    //   name="basic"
    //   initialValues={{ remember: true }}
    //   onFinish={onFinish}
    // >
    //   <Form.Item
    //     label="Username"
    //     name="username"
    //     rules={[
    //       {
    //         required: true,
    //         message: "5글자 이상 입력하세요",
    //         min: 5,
    //       },
    //     ]}
    //     hasFeedback
    //     {...fieldErrors.username}
    //   >
    //     <Input />
    //   </Form.Item>

    //   <Form.Item
    //     label="Password"
    //     name="password"
    //     rules={[
    //       {
    //         required: true,
    //         message: "Please input your password!",
    //       },
    //     ]}
    //     {...fieldErrors.password}
    //   >
    //     <Input.Password />
    //   </Form.Item>

    //   <Form.Item {...tailLayout}>
    //     <Button type="primary" htmlType="submit">
    //       Submit
    //     </Button>
    //   </Form.Item>
    // </Form>
  );
}

// const layout = {
//   labelCol: { span: 8 },
//   wrapperCol: { span: 16 },
// };

// const tailLayout = {
//   wrapperCol: { offset: 8, span: 16 },
// };
