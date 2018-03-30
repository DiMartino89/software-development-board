import React from 'react';
import { fieldPropTypes } from '../../util/proptype-utils';

const TextInput = ({ input, meta, id, placeholder, type, defaultValue, label = '', maxLength, extraClasses = '' }) => (
  <label htmlFor={id} className="form-label">
    {label}
    {meta.touched && meta.error && <div className="alert alert-card alert-error">{meta.error}</div>}
    <input
      {...input}
      id={id}
      className={`form-control ${extraClasses}`}
      placeholder={placeholder}
      type={type}
      value={defaultValue}
      maxLength={maxLength}
    />
  </label>
);

TextInput.propTypes = fieldPropTypes;

export default TextInput;
