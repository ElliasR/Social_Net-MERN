import React, { useEffect, useState, useContext, Fragment } from 'react';
import { useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context'; //by using useContext
import './UpdateUser.css';

//-------------USER UPDATE-----------------------
const UpdateUser = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUser, setLoadedUser] = useState();
  const userId = auth.userId;
  const history = useHistory();

  const [formState, inputHandler, setFormData] = useForm(
    {
      name: {
        value: '',
        isValid: false,
      },
      email: {
        value: '',
        isValid: false,
      },
      accountPassword: {
        value: '',
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/users/${userId}` //GENERATE API FOR SEARCHING FOR THE USER
        );
        setLoadedUser(responseData.user);
        setFormData(
          {
            name: {
              value: responseData.user.name,
              isValid: true,
            },
            email: {
              value: responseData.user.email,
              isValid: true,
            },
          },
          true
        );
      } catch (err) {}
    };
    fetchUser();
  }, [sendRequest, userId, setFormData]);

  //--------------NAME EMAIL UPDATE-----------------------
  const userUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `http://localhost:5000/api/users/${userId}`, //GENERATE API FOR PATCHING USER'S VALUES
        'PATCH',
        JSON.stringify({
          name: formState.inputs.name.value,
          email: formState.inputs.email.value,
          password: formState.inputs.accountPassword.value,
        }),
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token,
        }
      );
      history.push('/');
    } catch (err) {}
  };

  //-----------------PSSW UPDATE---------------------
  const psswUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `http://localhost:5000/api/users/passw/${userId}`, //GENERATE API FOR PATCHING USER'S VALUES
        'PATCH',
        JSON.stringify({
          oldPassword: formState.inputs.oldPassword.value,
          newPassword: formState.inputs.newPassword.value,
          repeatPassword: formState.inputs.repeatPassword.value,
        }),
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token,
        }
      );
      history.push('/');
    } catch (err) {}
  };

  //-------------------LOADING SPINNER...--------------------
  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedUser && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find the user!</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedUser && (
        <Fragment>
          <form className="updateUser-form" onSubmit={userUpdateSubmitHandler}>
            <Input
              id="name"
              element="input"
              type="text"
              label="Name"
              validators={[VALIDATOR_MINLENGTH(3)]}
              errorText="Please enter a valid name (min. 3 characters)."
              onInput={inputHandler}
              initialValue={loadedUser.name}
              initialValid={true}
            />
            <Input
              id="email"
              element="input"
              type="email"
              label="Email"
              validators={[VALIDATOR_EMAIL()]}
              errorText="Please enter a valid email."
              onInput={inputHandler}
              initialValue={loadedUser.email}
              initialValid={true}
            />
            <Input
              id="accountPassword"
              element="input"
              type="password"
              label="Account Password"
              validators={[VALIDATOR_MINLENGTH(6)]}
              errorText="Please enter a valid password (min. 6 characters)."
              onInput={inputHandler}
              // initialValue={'Validate it is you'}
              initialValid={true}
              autoComplete="current-password"
            />
            <Button type="submit" disabled={!formState.isValid}>
              UPDATE USER
            </Button>
          </form>
          <br />
          <form className="updateUser-form" onSubmit={psswUpdateSubmitHandler}>
            <Input
              id="oldPassword"
              element="input"
              type="password"
              label="OLD Password"
              validators={[VALIDATOR_MINLENGTH(6)]}
              errorText="Please enter a valid password (min. 6 characters)."
              onInput={inputHandler}
              //initialValue={'Confirm your OLD password'}
              initialValid={true}
              autoComplete="current-password"
            />
            <Input
              id="newPassword"
              element="input"
              type="password"
              label="NEW Password"
              validators={[VALIDATOR_MINLENGTH(6)]}
              errorText="Please enter a valid password (min. 6 characters)."
              onInput={inputHandler}
              // initialValue={'Type your NEW password'}
              initialValid={true}
              autoComplete="new-password"
            />
            <Input
              id="repeatPassword"
              element="input"
              type="password"
              label="Repeat NEW Password"
              validators={[VALIDATOR_MINLENGTH(6)]}
              errorText="Please enter a valid password (min. 6 characters)."
              onInput={inputHandler}
              // initialValue={'Confirm your NEW password'}
              initialValid={true}
              autoComplete="new-password"
            />
            <Button type="submit" disabled={!formState.isValid}>
              UPDATE PASSWORD
            </Button>
          </form>
          <br />
          <form className="updateUser-form">
            <Button to="/image">Update Profile IMAGE {'>'}</Button>
          </form>
          <br />
          <form className="updateUser-form">
            <Button to="/activ">Deactivate account {'>'}</Button>
          </form>
        </Fragment>
      )}
    </React.Fragment>
  );
};

export default UpdateUser;
