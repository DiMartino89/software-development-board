import React from 'react';
import { fieldPropTypes } from '../../util/proptype-utils';

const Textarea = ({ input, meta, id, placeholder, type, defaultValue, label = '', extraClasses = '' }) => (
  <label htmlFor={id} className="form-label">
    {label}
    {meta.touched && meta.error && <div className="alert alert-card alert-error">{meta.error}</div>}
    <textarea
      {...input}
      id={id}
      placeholder={placeholder}
      value={defaultValue}
      className={`form-control ${extraClasses && extraClasses}`}
    />
  </label>
);

Textarea.propTypes = fieldPropTypes;

export default Textarea;
