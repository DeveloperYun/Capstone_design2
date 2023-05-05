import React, { useEffect, useState } from "react";
import Axios from "axios";
import Post from "Post";
const apiurl = "http://127.0.0.1:8000/api/post/";


function PostList(){
    const [postList, setPostList] = useState([]);

    useEffect(()=>{
        Axios.get(apiurl)
            .then(response => {
                const { data } = response;
                console.log("loaded response : ",response);
                setPostList(data);
            })
            .catch(error => {

            });
        console.log("mounted");
    }, []);

    return(
        <div>
            <h1>PostList</h1>
            {postList.map(post => {
                return <Post post={post} key={post.id}/>
            })}
        </div>
    );
}

export default PostList;