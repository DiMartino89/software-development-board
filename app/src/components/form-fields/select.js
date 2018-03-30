import React from 'react';
import PropTypes from 'prop-types';
import { fieldPropTypes } from '../../util/proptype-utils';

const StandardSelect = ({ input, children, meta, id, placeholder, defaultValue, label = '', extraClasses = '' }) => {
    return (
        <label htmlFor={id} className="form-label">
            {label}
            {meta.touched && meta.error && <div className="alert alert-card alert-error">{meta.error}</div>}
            <select
                {...input}
                className={`form-control ${extraClasses && extraClasses}`}
                placeholder={placeholder}
                value={defaultValue}
                id={id}
            >
                {_.map(_.range(children.length), function (i) {
                    return (
                        <option value={children[i].value}>{children[i].label}</option>
                    );
                })};
            </select>
        </label>
    );
};

StandardSelect.propTypes = {
  ...fieldPropTypes,
  children: PropTypes.node,
};

export default StandardSelect;
