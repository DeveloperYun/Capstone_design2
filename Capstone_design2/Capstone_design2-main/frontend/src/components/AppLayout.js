import React from "react";
import "./AppLayout.scss";

function AppLayout({ children }){
    return (
        <div className="app">
            <div className="header"><h1>Lobe</h1></div>
            <div className="contents">{children}</div>
            <div className="sidebar">sidebar</div>
            <div className="footer">Footer</div>
        </div>
    );
}

export default AppLayout;