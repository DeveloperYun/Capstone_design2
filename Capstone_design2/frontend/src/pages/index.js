import React from "react";
import AppLayout from "components/AppLayout";
import { Route, Routes } from "react-router-dom";
import About from "./About";
import Home from "./Home";
import AccountRoutes from "./accounts";
import PostNew from "./PostNew";
import Train from "./train";

function Root(){
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />}/>
                <Route path="/train" element={<Train />}/>
                <Route path="/about" element={<About />}/>
                <Route path="/posts/new" element={<PostNew />}/>
                <Route path="/accounts/*" element={<AccountRoutes />} />
            </Routes>
        </>
    );
}

export default Root;