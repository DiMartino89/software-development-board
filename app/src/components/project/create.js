import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {Link} from 'react-router-dom';
import TextInput from '../form-fields/text-input';
import Textarea from '../form-fields/text-area';
import GenericForm from '../form-fields/generic-form';
import {createProject} from '../../redux/modules/project';
import {errorPropTypes} from '../../util/proptype-utils';

const form = reduxForm({
    form: 'postProject',
});

class CreateProject extends Component {
    static propTypes = {
        handleSubmit: PropTypes.func,
        postProject: PropTypes.func,
        /*errors: errorPropTypes,
        message: PropTypes.string,
        loading: PropTypes.bool,*/
    };

    static formSpec = [
        {
            id: 'name',
            name: 'name',
            label: 'Projektname',
            type: 'text',
            placeholder: 'Projektname',
            component: TextInput
        },
        {
            id: 'prefix',
            name: 'prefix',
            label: 'Projektprefix',
            type: 'text',
            placeholder: 'XXXXX',
            maxLength: "5",
            component: TextInput
        },
        {
            id: 'description',
            name: 'description',
            label: 'Beschreibung',
            type: 'text',
            placeholder: '...',
            component: Textarea
        },
        {
            id: 'begin',
            name: 'begin',
            label: 'Startdatum',
            type: 'date',
            placeholder: 'xx.xx.xxxx',
            component: TextInput
        },
        {
            id: 'end',
            name: 'end',
            label: 'Enddatum',
            type: 'date',
            placeholder: 'xx.xx.xxxx',
            component: TextInput
        },
    ];

    handleFormSubmit = formProps => {
        formProps.tickets = [];
        formProps.users = [];
        formProps.sprints = [];
        formProps.users.push(this.props.user.id);
        this.props.postProject(formProps);
    };

    render = () => {
        const {handleSubmit, errors, message, loading} = this.props;

        return (
            <div className={`auth-box ${loading ? 'is-loading' : ''}`}>
                <h1>Create Project</h1>
                <GenericForm
                    onSubmit={handleSubmit(this.handleFormSubmit)}
                    //errors={errors}
                    //message={message}
                    formSpec={CreateProject.formSpec}
                    submitText="Create"
                />
                <Link className="inline" to="/">Cancel</Link>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user.user,
        /*errors: state.project.errors[POST_PROJECT],
        message: state.project.messages[POST_PROJECT],
        loading: state.project.loading[POST_PROJECT],*/
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        postProject: (formData) => {
            dispatch(createProject(formData));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(form(CreateProject));
