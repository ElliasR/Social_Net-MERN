import {useState, useCallback, useRef, useEffect} from 'react';

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    const activeHttpRequests = useRef([ ]);      //to avoid issues if the hook starts to run, but the user moves quick to another page before finishing login in...
    //useRef to transform it into a referente and when the useHttpClient gets updated, this is not run. Stored data during the hook rerendering. 

    const sendRequest = useCallback( async (url, method='GET', body = null, headers = {}) => { //callback to avoid loops
        setIsLoading(true);
        const httpAbortCtrl = new AbortController();
        activeHttpRequests.current.push(httpAbortCtrl);
        try{
            const response = await fetch(url, { //parameters forwarded to fetch
                method,
                body,
                headers,
                signal: httpAbortCtrl.signal
            });
            
            const responseData = await response.json();
            
            activeHttpRequests.current = activeHttpRequests.current.filter(
                reqCtrl => reqCtrl !== httpAbortCtrl //keeps all the controllers, except the one used already with the request above. 
            );

            if (!response.ok) {
              throw new Error(responseData.message);
            }
            setIsLoading(false);
            return responseData;
        } catch (err){
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, []);

    const clearError = () => {
        setError(null);
    };
    useEffect (() => {
        return () => {
            activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort());
        };
    }, []);


    return { isLoading, error, sendRequest, clearError }

};