import {config} from '../config' 
import { useState, useEffect, useRef } from 'react';


export const RuntimeHost = ({runtimeId, content}) => {
    const [url, setUrl] = useState(null);
    const frameRef = useRef(null);

    useEffect(()=> {
        if (!runtimeId) return;
        const getRuntime = async () => {
            const res = await fetch(`${config.apiUrl}/Runtime/${runtimeId}`);
            const serverResponse = await res.json();
            if (serverResponse.payload) {
                const runtime = serverResponse.payload;
                setUrl(runtime.url);
            }
        }

        getRuntime();
    }, [runtimeId]);

    useEffect(()=> {
        if (!frameRef.current) return;
        console.log(content);

        const frame = frameRef.current;

        frame.addEventListener('load', () => {
            console.log("testing postMessage");
            frame.contentWindow.postMessage(content, '*');
        })

    }, [content, url]);

    
    useEffect(()=> {

        console.log("Registering message listener");

        const handleMessage = async (message) => {

            if (!message.data.nodes && !message.data.edges) return;
            const messageId = crypto.randomUUID();
            console.log("Parent receiving postMessage:", messageId);

            const url = `${config.apiUrl}uploadFile`;
            const newNodes = await Promise.all(
                message.data.nodes.map(async (node) => {
                    if (!(node.data.file)) return node;

                    //upload file
                    const formData = new FormData();
                    formData.append("file", node.data.file, node.data.file.name);

                    try {
                        const response = await fetch(url, {
                            method: "POST",
                            body: formData,
                        });

                        const resId = (await response.json()).payload;

                        return {...node, data: {...node.data, url: `${config.apiUrl}retrieveFile/${resId}`}}

                    } catch (error) {
                        console.error("Fetch failed:", error);
                    }
                })
            )

            const content = {
                nodes: newNodes,
                edges: message.data.edges
            }

            console.log("runtimeId before saving:", runtimeId);

            const newData = {
                name: "testContent",
                type: "ContentPost",
                content: content,
                runtimeId: runtimeId,
                updatedAt: Date.now(),
            }

            const contentUrl = `${config.apiUrl}upload`;

            console.log("contentUrl", contentUrl);
            try {
                const contentResponse = await fetch(contentUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newData),
                });

                const contentResJSON = await contentResponse.json();
                if (contentResJSON.success) console.log(contentResJSON.payload);
            } catch (error) {
                console.log('posting content failed', error.message);
            }
        }

        window.addEventListener('message', handleMessage);
        return () => {
             console.log("Removing message listener");
            window.removeEventListener('message', handleMessage);

        }
    }, [])


    return (
        <div>
            {/* <iframe ref={frameRef} src={url}/> : <h1>Loading Interface</h1> */}
            {url ? <iframe ref={frameRef} src={url} allow="loopback-network"/> : <h1>Loading Interface</h1>}
        </div>
    );
};