import React from "react";
import { Card } from "antd";
import PostNewForm from "components/PostNewForm";
import "./PostNew.scss";

export default function PostNew() {
  return (
    <div className="PostNew">
      <Card title="데이터 셋 준비">
        <PostNewForm />
      </Card>
    </div>
  );
}