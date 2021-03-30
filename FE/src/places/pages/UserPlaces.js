import React, {useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import PlaceList from '../components/PlaceList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const UserPlaces = () => {
    const [loadedPlaces, setLoadedPlaces] = useState();
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    
    const userId = useParams().userId; //helps getting the dynamic sergments (parameters) from the URL / route
    
    useEffect(() => { //To avoid a loop everytime a component re-renders the fetch doesn't get requested again and again.  
        const fetchPlaces = async () => {
           try {
                const responseData = await sendRequest(`http://localhost:5000/api/places/user/${userId}`); //backticks to inject dynamic data into the string. 
                setLoadedPlaces(responseData.places);
           } catch (err) {}
            
        };
        fetchPlaces();
    }, [sendRequest, userId]);

    const placeDeletedHandler = deletedPlaceId => {
        setLoadedPlaces(prevPlaces => 
            prevPlaces.filter(place => place.id !== deletedPlaceId)
        );
    }; 

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className='center'>
                    <LoadingSpinner />
                </div>
            )}
            {!isLoading && loadedPlaces && <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />}
        </React.Fragment>
    )
};

export default UserPlaces;