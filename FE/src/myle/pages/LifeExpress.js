import React, { useEffect, useState, useContext } from 'react';

import LifeChain from '../components/LifeChain';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

import './LifeExpress.css';

const LifeExpress = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedLife, setLoadedLife] = useState();
  const userId = auth.userId;

  useEffect(() => {
    const fetchLife = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/life/${userId}`
        ); //the default request type is GET with fetch, body=null...

        setLoadedLife(responseData.life); //life is what passes from response
      } catch (err) {}
    };
    fetchLife();
  }, [sendRequest, userId]);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedLife && <LifeChain items={loadedLife} />}
    </React.Fragment>
  );
};

export default LifeExpress;
