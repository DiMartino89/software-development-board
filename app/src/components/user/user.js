import React, {Component} from 'react';
import {connect} from "react-redux";
import TextInput from "../form-fields/text-input";
import PropTypes from "prop-types";
import {reduxForm} from 'redux-form';
import GenericForm from '../form-fields/generic-form';
import {getUser, editUser, deleteUser, postAvatar, getUsers} from '../../redux/modules/user';
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/lib/react-responsive-modal.css';
import {getProjects} from "../../redux/modules/project";
import {resetPassword} from "../../redux/modules/authentication";
import {getCookie} from "../../util/cookie-utils";

const form = reduxForm({
    form: 'updateUser',
});

export class UserProfile extends Component {

    static propTypes = {
        authenticated: PropTypes.bool,
        handleSubmit: PropTypes.func,
        resetPassword: PropTypes.func,
        updateUser: PropTypes.func,
        deleteUser: PropTypes.func,
        params: PropTypes.shape({
            token: PropTypes.string,
        }),
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
            name: 'firstName',
            label: 'First Name',
            type: 'text',
            placeholder: 'John',
            component: TextInput
        },
        {
            id: 'lastName',
            name: 'lastName',
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
            label: 'New Password',
            type: 'password',
            placeholder: '********',
            component: TextInput
        },
        {
            id: 'passwordConfirm',
            name: 'passwordConfirm',
            label: 'Confirm New Password',
            type: 'password',
            placeholder: '********',
            component: TextInput
        },
    ];

    componentDidMount() {
        this.props.loadProjects();
        this.props.loadUsers();
        this.props.loadUser();
    };

    getUser = id => {
        return this.props.users[id];
    };

    getProject = id => {
        return this.props.projects[id];
    };

    onOpenModal = () => {
        const userData = this.props.user;
        for (let i = 0; i < UserProfile.formSpec.length; i++) {
            Object.keys(UserProfile.formSpec[i]).forEach(function (fKey) {
                if (fKey === 'name') {
                    Object.keys(userData).forEach(function (pKey) {
                        if (pKey === UserProfile.formSpec[i][fKey] && pKey !== 'password') {
                            UserProfile.formSpec[i]['defaultValue'] = userData[pKey];
                        }
                    });
                }
            });
        }
        this.setState({open: true});
    };

    onCloseModal = () => {
        this.setState({open: false});
    };

    handleFormSubmit = formProps => {
        const userData = this.props.user;
        const id = userData.id;
        delete userData.id;
        formProps.invitations = userData.invitations;
        formProps.avatar = userData.avatar;
        this.props.updateUser(id, formProps);
        this.props.resetPassword(formProps, UserProfile.propTypes.params.token);
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
        location.reload();
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
            UserProfile.propTypes.params.token = getCookie('token');
            const $this = this;
            const user = this.props.user;
            const projects = this.props.projects;
            const isOwnProfile = window.location.href.split('/')[4] === user.id;
            const state = ['Offen', 'In Arbeit', 'To Review', 'In Review', 'Freigabe', 'Geschlossen'];
            const category = ['Keine Kategorie', 'Story', 'FE-Task', 'BE-Task'];
            const priority = ['Keine Priorität', 'Low', 'Medium', 'High', 'Blocker'];

            function getUserProjects() {
                const arr = [];
                Object.keys(projects).forEach(function (key) {
                    if (projects[key].users.includes(user.id)) {
                        arr.push(key);
                    }
                });
                return arr;
            }

            const userProjects = getUserProjects();
            return (
                <div>
                    <div className="user__container">
                        <div className="user__header">
                            <h2>{user.firstName} {user.lastName}</h2>
                            {isOwnProfile ?
                                <button onClick={this.deleteProfile}
                                        className="button is-primary">Account löschen</button> : ''}
                            {isOwnProfile ?
                                <button onClick={this.onOpenModal} className="button is-primary">Update
                                    Account</button> : ''}
                        </div>
                        <div className="user__avatar-container">
                            <img src={user.avatar} className="user-avatar--large"/>
                            <input type="file" name="file" id="fileUpload" onChange={this.uploadImage}/>
                        </div>
                        <div className="user__info-container">
                            <div className="user__info">
                                <label>Projekte:</label>
                                <hr></hr>
                                <ul>
                                    {_.map(_.range(userProjects.length), function (i) {
                                        const project = $this.getProject(userProjects[i]);
                                        return <li>
                                            <p>{project.name}</p>
                                            <p className="user__tickets-headline">Tickets im Projekt:</p>
                                            <ul className="user__tickets-sublist">
                                                {_.map(_.range(project.tickets.length), function (i) {
                                                    return <li>
                                                        <p>{project.tickets[i].user === user.id ?
                                                            <span>{project.tickets[i].name} | {category[parseInt(project.tickets[i].category)]} | {priority[parseInt(project.tickets[i].priority)]} | {state[parseInt(project.tickets[i].state)]} | {project.tickets[i].estimation} h</span> : ''}</p>
                                                    </li>
                                                })}
                                            </ul>
                                        </li>
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <Modal open={open} onClose={this.onCloseModal} little>
                        <h2>Update Account</h2>
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

const mapStateToProps = (state) => {
    return {
        user: state.user.user,
        users: state.user.users,
        projects: state.project.projects,
        authenticated: state.authentication.authenticated,
    };
};

const mapDispatchToProps = (dispatch) => {
    //
    return {
        loadProjects: () => {
            dispatch(getProjects());
        },
        loadUsers: () => {
            dispatch(getUsers());
        },
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
        resetPassword: (formData, token) => {
            dispatch(resetPassword(formData, token));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(form(UserProfile));