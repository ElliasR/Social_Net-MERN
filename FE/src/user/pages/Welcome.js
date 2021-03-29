import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const Welcome = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState();
  const confirmationCode = useParams().confirmationCode;

  useEffect(() => {
    //To avoid a loop everytime a component re-renders the fetch doesn't get requested again and again.
    const checkCode = async () => {
      //useEffect doesn't accept a promise, so function needed.
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/users/confirm/${confirmationCode}`
        ); //the default request type is GET with fetch, body=null...

        setLoadedUsers(responseData.message);
      } catch (err) {}
    };
    checkCode();
  }, [sendRequest, confirmationCode]);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedUsers && (
        <div>
          <header>
            <h3>
              <strong>Account confirmed!</strong>
            </h3>
          </header>
          <Link to="/auth">Please Login</Link>
        </div>
      )}
    </React.Fragment>
  );
};

export default Welcome;
