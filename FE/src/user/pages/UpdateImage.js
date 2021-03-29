import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context'; //by using useContext
import './UpdateUser.css';

//IMAGE UPDATE
const UpdateImage = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const userId = auth.userId;
  const history = useHistory();

  const [formState, inputHandler] = useForm(
    {
      image: {
        value: null,
        isValid: false,
      },
    },
    false
  );

  const imageUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('image', formState.inputs.image.value);
      await sendRequest(
        `http://localhost:5000/api/users/image/${userId}`, //GENERATE API FOR PATCHING USER'S VALUES
        'POST',
        formData,
        {
          Authorization: 'Bearer ' + auth.token,
        }
      );
      history.push('/');
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />

      <form className="updateUser-form" onSubmit={imageUpdateSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <ImageUpload
          id="image"
          onInput={inputHandler}
          errorText="Please, provide with an image."
        />
        <Button type="submit" disabled={!formState.isValid}>
          UPDATE IMAGE
        </Button>
      </form>
    </React.Fragment>
  );
};

export default UpdateImage;
