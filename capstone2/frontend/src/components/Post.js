import React from "react";

function Post({post}){
    const { label, images} = post;
    return (
        <div>
            <img src={images} alt="라벨링 데이타"
                    style = {{ width: '100px'}}></img>
            {label} 
        </div>
    );
}

export default Post;