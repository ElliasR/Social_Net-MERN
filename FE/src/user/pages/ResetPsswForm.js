import React, { Fragment } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { VALIDATOR_MINLENGTH } from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './UpdateUser.css';

//-------------USER UPDATE-----------------------
const ResetPsswForm = () => {
  const history = useHistory();
  const resetPsswCode = useParams().resetPsswCode;
  if (resetPsswCode.length < 20) {
    history.push('/auth');
  }
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  //const [loadedUser, setLoadedUser] = useState();
  // const userId = auth.userId;

  const [formState, inputHandler] = useForm();

  //-----------------PSSW UPDATE---------------------
  const psswUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    console.log(formState.inputs.newPassword.value);
    console.log(formState.inputs.repeatPassword.value);
    if (
      formState.inputs.newPassword.value !==
      formState.inputs.repeatPassword.value
    ) {
      return alert('passwords do not match!');
    }
    try {
      await sendRequest(
        `http://localhost:5000/api/users/resetpassw/${resetPsswCode}`, //GENERATE API FOR PATCHING USER'S VALUES
        'PATCH',
        JSON.stringify({
          newPassword: formState.inputs.newPassword.value,
          repeatPassword: formState.inputs.repeatPassword.value,
          resetPsswCode: resetPsswCode,
        }),
        {
          'Content-Type': 'application/json',
        }
      );
      history.push('/auth');
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

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && (
        <Fragment>
          <form className="updateUser-form" onSubmit={psswUpdateSubmitHandler}>
            <Input
              id="newPassword"
              element="input"
              type="password"
              label="NEW Password"
              validators={[VALIDATOR_MINLENGTH(6)]}
              errorText="Please enter a valid password (min. 6 characters)."
              onInput={inputHandler}
              // initialValue={'Type your NEW password'}
              initialValid={false}
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
              initialValid={false}
              autoComplete="new-password"
            />
            <Button type="submit" disabled={!formState.isValid}>
              UPDATE PASSWORD
            </Button>
          </form>
        </Fragment>
      )}
    </React.Fragment>
  );
};

export default ResetPsswForm;
