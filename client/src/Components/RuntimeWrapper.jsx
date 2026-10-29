import {useState, useLayoutEffect} from 'react';
import { useParams } from 'react-router-dom';

import {config} from '../config'
import { RuntimeHost } from './RuntimeHost';

export const RuntimeWrapper = ({wrapperType}) => {

    const [runtimeId, setRuntimeId] = useState(null);
    const [content, setContent] = useState(null);
    const {wrapperId} = useParams();

    useLayoutEffect(()=> {
        const getTemplate = async () => {
            const res = (await fetch(`${config.apiUrl}/${wrapperType}/${wrapperId}`));
            const serverResponse = await res.json();
            // console.log("line 16", serverResponse);
            if (serverResponse.payload) {
                const template = serverResponse.payload;
                // console.log("line 20", template);
                setRuntimeId(template.runtimeId);
                setContent(template.content);
            }
        }

        getTemplate();

    }, [wrapperId, wrapperType]);

    return (
        <>
        {runtimeId && <RuntimeHost runtimeId={runtimeId} content={content}/>}
        </>
    );
};

export default RuntimeWrapper;