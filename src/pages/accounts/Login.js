import React, { useState, useEffect } from "react";
import Axios from "axios";
import { SmileOutlined, FrownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, notification } from "antd";
import { setToken, useAppContext } from "store";
import "../../css/Login.css";

export default function Login() {
  const { dispatch } = useAppContext();
  const history = useNavigate();
  const [fieldErrors, setFieldErrors] = useState({});

  const { from: loginRedirectUrl } = {
    from: { pathname: "/" },
  };

  const onFinish = (values) => {
    async function fn() {
      const { username, password } = values;

      setFieldErrors({});

      const data = { username, password };
      try {
        const response = await Axios.post(
          "http://localhost:8000/accounts/token/",
          data
        );
        const {
          data: { token: jwtToken },
        } = response;

        dispatch(setToken(jwtToken));
        //setJwtToken(jwtToken);
        notification.open({
          message: "로그인 성공",
          icon: <SmileOutlined style={{ color: "#10Bee9" }} />,
        });

        history(loginRedirectUrl);
      } catch (error) {
        if (error.response) {
          notification.open({
            message: "로그인 실패",
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
  //
  const handleHome = () => {
    history("/");
  };

  const handleSignUp = () => {
    history("/accounts/signup");
  };

  return (
    <div class="login fadeInDownLogin">
      <div id="formContentLogin">
        {/* <!-- Tabs Titles --> */}
        <h2 class="activeLogin"> LOGIN </h2>
        <h2 class="inactiveSignup underlineHoverLogin" onClick={handleSignUp}>
          Sign Up{" "}
        </h2>
        {/* <!-- Icon --> */}
        {/* <div class="fadeInLogin first">
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
            id="login"
            class="fadeInLogin second"
            name="login"
            placeholder="login"
          />
          <input
            type="text"
            id="password"
            class="fadeInLogin third"
            name="login"
            placeholder="password"
          />
          <input type="submit" class="fadeInLogin fourth" value="Log In" />
        </form>

        {/* <!-- Remind Passowrd --> */}
        <div id="formFooterLogin">
          <a class="underlineHoverLogin" href="#" onClick={handleHome}>
            Home
          </a>
        </div>
      </div>
    </div>
    // <Card className="login" title="Login">
    //   <Form
    //     {...layout}
    //     name="basic"
    //     initialValues={{ remember: true }}
    //     onFinish={onFinish}
    //   >
    //     <Form.Item
    //       label="Username"
    //       name="username"
    //       rules={[
    //         {
    //           required: true,
    //           message: "5글자 이상 입력하세요",
    //           min: 5,
    //         },
    //       ]}
    //       hasFeedback
    //       {...fieldErrors.username}
    //       {...fieldErrors.non_field_errors}
    //     >
    //       <Input />
    //     </Form.Item>

    //     <Form.Item
    //       label="Password"
    //       name="password"
    //       rules={[
    //         {
    //           required: true,
    //           message: "Please input your password!",
    //         },
    //       ]}
    //       {...fieldErrors.password}
    //     >
    //       <Input.Password />
    //     </Form.Item>

    //     <Form.Item {...tailLayout}>
    //       <Button type="primary" htmlType="submit">
    //         Submit
    //       </Button>
    //     </Form.Item>
    //   </Form>
    // </Card>
  );
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
