import React from "react";

function Post({post}){
    const { label, image } = post;
    
    return (
        <div>
            <img src={image} alt="라벨링 데이타"
                    style = {{ width: '100px'}}></img>
            {label} 
        </div>
    );
}

export default Post;