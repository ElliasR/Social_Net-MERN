import React, { useContext, useState } from 'react';

import Button from '../../shared/components/FormElements/Button';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import Modal from '../../shared/components/UIElements/Modal';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context'; //by using useContext
import './UpdateUser.css';
import Card from '../../shared/components/UIElements/Card';

//------ ACCOUNT UPDATE ------
const ActiveProfile = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const userId = auth.userId;

  //------ MODAL ------
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };
  const candelDeleteHandler = () => {
    setShowConfirmModal(false);
  };
  const [showConfirmModalP, setShowConfirmModalP] = useState(false);
  const showDeleteWarningHandlerP = () => {
    setShowConfirmModalP(true);
  };
  const candelDeleteHandlerP = () => {
    setShowConfirmModalP(false);
  };

  //------ DELETE or PAUSE account to the backend ------
  const accountUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `http://localhost:5000/api/users/activ/${userId}`, //GENERATE API FOR PATCHING USER'S VALUES
        'PATCH',
        JSON.stringify({
          account: 'DELETE',
        }),
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token,
        }
      );
      auth.logout();
    } catch (err) {}
  };
  const accountUpdateSubmitHandlerP = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `http://localhost:5000/api/users/activ/${userId}`, //GENERATE API FOR PATCHING USER'S VALUES
        'PATCH',
        JSON.stringify({
          account: 'PAUSE',
        }),
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token,
        }
      );
      auth.logout();
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showConfirmModalP}
        onCancel={candelDeleteHandlerP}
        header="Confirm Pause Account - Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button onClick={candelDeleteHandlerP}>CANCEL</Button>
            <Button inverse onClick={accountUpdateSubmitHandlerP}>
              PAUSE
            </Button>
          </React.Fragment>
        }
      >
        <p>
          if you PAUSE your account, you can reactivate it in the future,
          keeping all your information.
        </p>
      </Modal>
      <Modal
        show={showConfirmModal}
        onCancel={candelDeleteHandler}
        header="Confirm Deletion - Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button onClick={candelDeleteHandler}>CANCEL</Button>
            <Button inverse onClick={accountUpdateSubmitHandlerP}>
              PAUSE
            </Button>
            <Button inverse onClick={accountUpdateSubmitHandler}>
              DELETE
            </Button>
          </React.Fragment>
        }
      >
        <p>
          Do you want to delete this account? Please note it cannot be undone
          thereafter: YOU WILL LOSE ALL THE INFORMATION in your account.
        </p>
        <p>
          You can PAUSE your account and re-activate it again in the future.
        </p>
      </Modal>
      <Card className="updateUser-form">
        <Button to="/">CANCEL</Button>
        <Button inverse onClick={showDeleteWarningHandlerP}>
          PAUSE ACCOUNT
        </Button>
        <Button inverse onClick={showDeleteWarningHandler}>
          DELETE ACCOUNT
        </Button>
      </Card>
    </React.Fragment>
  );
};

export default ActiveProfile;
