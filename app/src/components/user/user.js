import React, {Component} from 'react';
import {connect} from "react-redux";
import TextInput from "../form-fields/text-input";
import PropTypes from "prop-types";
import {reduxForm} from 'redux-form';
import {Link} from 'react-router-dom';
import GenericForm from '../form-fields/generic-form';
import {getAuthenticatedUser, getUser, editUser, deleteUser, postAvatar} from '../../redux/modules/user';
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/lib/react-responsive-modal.css';

const form = reduxForm({
    form: 'updateUser',
});

export class UserProfile extends Component {

    static propTypes = {
        currUser: PropTypes.shape({
            firstName: PropTypes.string,
            lastName: PropTypes.string,
        }),
        handleSubmit: PropTypes.func,
        updateUser: PropTypes.func,
        deleteUser: PropTypes.func,
        /*errors: errorPropTypes,
        message: PropTypes.string,
        loading: PropTypes.bool,*/
    };

    constructor(props) {
        super(props);

        this.state = {
            open: false,
        };
    }

    static formSpec = [
        {
            id: 'firstName',
            name: 'name.first',
            label: 'First Name',
            type: 'text',
            placeholder: 'John',
            component: TextInput
        },
        {
            id: 'lastName',
            name: 'name.last',
            label: 'Last Name',
            type: 'text',
            placeholder: 'Snow',
            component: TextInput
        },
        {
            id: 'email',
            name: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'you@yourdomain.com',
            component: TextInput
        },
        {
            id: 'password',
            name: 'password',
            label: 'Password',
            type: 'password',
            placeholder: '********',
            component: TextInput
        },
        {
            id: 'passwordConfirm',
            name: 'passwordConfirm',
            label: 'Confirm Password',
            type: 'password',
            placeholder: '********',
            component: TextInput
        },
    ];
    componentDidMount() {
        this.props.loadUser();
    };

    onOpenModal = () => {
        this.setState({open: true});
    };

    onCloseModal = () => {
        this.setState({open: false});
    };

    handleFormSubmit = formProps => {
        const {user} = this.props;
        this.props.updateUser(user.id, formProps);
    };

    uploadImage = () => {
        //Upload Avatar
        const {user} = this.props;
        let imageData = new FormData();
        let file = document.getElementById('fileUpload').files[0];
        let filename = user.id;
        let fileExtension = file.name.split('.')[1];
        imageData.append('file', file);
        imageData.append('filename', filename);
        this.props.uploadAvatar(imageData);
        //Update User
        const userData = this.props.user;
        const id = userData.id;
        userData.avatar = 'http://localhost:3000/' + userData.id + '.' + fileExtension;
        delete userData.id;
        this.props.updateUser(id, userData);
    };

    deleteProfile = () => {
        const userId = window.location.href.split('/')[4].split('-')[0];
        this.props.deleteUser(userId);
    };

    render = () => {
        const {handleSubmit, errors, message} = this.props;
        const {open} = this.state;

        if (!this.props.user) {
            return null;
        } else {
            const user = this.props.user;
            const isCurrUser = window.location.href.split('/')[4] === this.props.user.id;
            const divStyle = {
                width: '70px',
                height: '70px',
            };
            return (
                <div>
                    <img src={user.avatar} className="user-avatar" style={divStyle} />
                    <p>{user.firstName} {user.lastName}</p>
                    {isCurrUser ? <button onClick={() => this.deleteProfile} className="button is-primary">Delete Profile</button> : ''}
                    {isCurrUser ? <button onClick={this.onOpenModal}>Update Profile</button>: ''}
                    <Modal open={open} onClose={this.onCloseModal} little>
                        <h2>Update User</h2>
                        <label>Avatar</label>
                        <input type="file" name="file" id="fileUpload" onChange={this.uploadImage}/>
                        <label>Informationen</label>
                        <GenericForm
                            onSubmit={handleSubmit(this.handleFormSubmit)}
                            //errors={errors}
                            //message={message}
                            formSpec={UserProfile.formSpec}
                            submitText="Update"
                        />
                    </Modal>
                </div>
            );
        }
    }
}

//
const mapStateToProps = ({user, authentication}) => {
    return {
        user: user.user,
        currUser: getAuthenticatedUser({user, authentication}),
        /*errors: state.project.errors[EDIT_PROJECT],
        message: state.project.messages[EDIT_PROJECT],
        loading: state.project.loading[EDIT_PROJECT],*/
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadUser: () => {
            dispatch(getUser(window.location.href.split('/')[4].split('-')[0]));
        },
        updateUser: (id, formData) => {
            dispatch(editUser(id, formData));
        },
        deleteUser: (id) => {
            dispatch(deleteUser(id));
        },
        uploadAvatar: (formData) => {
            dispatch(postAvatar(formData));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(form(UserProfile));