import React, { Fragment } from 'react';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { VALIDATOR_EMAIL } from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';

const ResendEmail = () => {
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

  const resendEmailSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `http://localhost:5000/api/users/resendemail`, //GENERATE API FOR PATCHING USER'S VALUES
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
          <form className="updateUser-form" onSubmit={resendEmailSubmitHandler}>
            <p>
              You should have already received an email with the instructions to
              activate your account. It usually takes a few seconds. Check your
              inbox and spam folder.
            </p>
            <p>
              If you can't see the email, get it resend by providing with your
              email address below:
            </p>
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
              RESEND ACTIVATION LINK
            </Button>
          </form>
        </Fragment>
      )}
    </React.Fragment>
  );
};

export default ResendEmail;
