import React, { useReducer, useEffect } from 'react';

import { validate } from '../../util/validators';
import './Input.css';

const inputReducer = (state, action) => {
    switch (action.type) {
        case 'CHANGE':
            return {
                ...state, //copy the state so not lost during transformations
                value: action.val,
                isValid: validate(action.val, action.validators)
            };
        case 'TOUCH': {
           return { 
                ...state, 
                isTouched: true 
           }   
        }
        default:
            return state;
    }
};

const Input = props =>{
    const [inputState, dispatch] = useReducer(inputReducer, {
        value: props.initialValue || '', 
        isTouched: false,
        isValid: props.initialValid || false
    });

    const { id, onInput } = props;
    const { value, isValid } = inputState;

    useEffect(() => {
        onInput(id, value, isValid)
    }, [id, value, isValid, onInput]);
   
    const changeHandler = event =>{
        dispatch({
            type: 'CHANGE', 
            val:event.target.value, 
            validators: props.validators
        });
    };

    const touchHandler = () => {
        dispatch({
            type: 'TOUCH'
        });
    };



    const element = props.element === 'input' ? (  //depending on the element prop, it becomes one or other component for the app
        <input 
            type={props.type} 
            id={props.id} 
            placeholder={props.placeholder} 
            onChange={changeHandler}
            onBlur={touchHandler} //So it doesn't looks red before even typing anything due to the validation (if empty, red)
            value={inputState.value}

        /> 
        ) : ( 
        <textarea 
            id={props.id} 
            rows={props.row || 3} 
            onChange={changeHandler} 
            onBlur={touchHandler}
            value={inputState.value}
        /> 
    );

    return <div className={`form-control ${!inputState.isValid && inputState.isTouched && 'form-control--invalid'}`}>

        <label htmlFor={props.id}>{props.label}</label>
        {element}
        {!inputState.isValid && inputState.isTouched && <p>{props.errorText}</p>}
    </div>

};

export default Input;