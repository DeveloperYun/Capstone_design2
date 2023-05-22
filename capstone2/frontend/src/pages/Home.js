import React from "react";
import PostList from "components/PostList";
import AppLayout from "components/AppLayout";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

function Home(){
    const history = useNavigate();
    const handleClick = () => {
        history("/posts/new");
    }

    const handleSignUp = () => {
        history("/accounts/signup");
      };
    
      const handleLogin = () => {
        history("/accounts/login");
      };
    
    return (
        <AppLayout>
            
            <Button type="primary" onClick={handleClick}>데이터 셋 준비</Button>
            <Button type="secondary" onClick={handleSignUp}>
                Sign Up
            </Button>
            <Button type="secondary" onClick={handleLogin}>
                Log In
            </Button>
            <PostList />
        </AppLayout>
    );
}

export default Home;