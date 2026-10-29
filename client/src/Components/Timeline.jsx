import {useState, useLayoutEffect} from 'react';
import {NavLink} from 'react-router-dom'

import {config} from '../config'


export const Timeline = () => {
    //get contentPosts (paginated)
    //sort them by most recent

    const [posts, setPosts] = useState([]);

    useLayoutEffect(()=> {
        const getTemplate = async () => {
            const res = (await fetch(`${config.apiUrl}`));
            const serverResponse = await res.json();
            // console.log("line 16", serverResponse);
            if (serverResponse.payload) {
                // console.log("line 20", template);
                const fetchedPosts = serverResponse.payload;
                setPosts(fetchedPosts);
            }
        }

        getTemplate();

    }, []);


    return (
        
        <>
        <h1>{posts.length} Posts</h1>
            {posts.length ?
            posts.map((post) => (
                <NavLink to={`/${post._id}`}>
                    <div style={{width: '100%', height: '10vh', backgroundColor: 'navy', fontSize: 'xx-large', borderBottom: 'solid 3px white'}}>
                        <h2>{post.name}</h2>
                        <h2>{post._id}</h2>
                    </div>
                </NavLink>
            ))
            :
            (<h1>Loading Timeline...</h1>)}
        </>

        
        
    );
};