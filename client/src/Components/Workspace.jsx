import {useState, useLayoutEffect} from 'react';
import { useParams } from 'react-router-dom';

import {config} from '../config'
import { RuntimeHost } from './RuntimeHost';

export const Workspace = () => {
    const [runtimeId, setRuntimeId] = useState(null);
    const [content, setContent] = useState(null);
    const {workspaceId} = useParams();

    useLayoutEffect(()=> {
        const getWorkspace = async () => {
            const res = (await fetch(`${config.apiUrl}/Workspace/${workspaceId}`));
            const serverResponse = await res.json();
            // console.log("line 16", serverResponse);
            if (serverResponse.payload) {
                const workspace = serverResponse.payload;
                // console.log("line 20", Workspace);
                setRuntimeId(workspace.runtimeId);
                setContent(workspace.defaultContent);
            }
        }

        getWorkspace();

    }, [workspaceId]);

    return (
        <>
        {runtimeId && <RuntimeHost runtimeId={runtimeId} content={content}/>}
        </>
    );
};

export default Workspace;