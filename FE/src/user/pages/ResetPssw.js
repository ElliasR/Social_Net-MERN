import React, { Fragment } from 'react';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { VALIDATOR_EMAIL } from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';

const ResetPssw = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler /*, setFormData*/] = useForm(
    {
      email: {
        value: '',
        isValid: false,
      },
    },
    false
  );

  const userUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `http://localhost:5000/api/users/resetpssw`, //GENERATE API FOR PATCHING USER'S VALUES
        'POST',
        JSON.stringify({
          email: formState.inputs.email.value,
        }),
        {
          'Content-Type': 'application/json',
        }
      );
      //window.history.push('/');
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
      {!isLoading && (
        <Fragment>
          <form className="updateUser-form" onSubmit={userUpdateSubmitHandler}>
            <Input
              id="email"
              element="input"
              type="email"
              label="Your user's Email"
              validators={[VALIDATOR_EMAIL()]}
              errorText="Please enter a valid email."
              onInput={inputHandler}
              //   initialValue={loadedUser.email}
              initialValid={false}
            />
            <Button type="submit" disabled={!formState.isValid}>
              RESET PASSWORD
            </Button>
          </form>
        </Fragment>
      )}
    </React.Fragment>
  );
};

export default ResetPssw;
