import React, { useEffect, useState } from "react";
import Axios from "axios";
import Post from "./Post";
import { Alert } from "antd";
import { useAppContext } from "store";
const apiurl = "http://127.0.0.1:8000/api/post/";


function PostList(){
    const { 
        store: { jwtToken }
    } = useAppContext();

    const [postList, setPostList] = useState([]);

    useEffect(()=>{
        const headers = { Authorization: `JWT ${jwtToken}` };
        Axios.get(apiurl, { headers })
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
            {postList.length === 0 &&
                <Alert type="warning" message="포스팅이 없네요 :("/>
            }
            {postList.map(post => {
                return <Post post={post} key={post.id}/>
            })}
        </div>
    );
}

export default PostList;