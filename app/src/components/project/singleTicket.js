import React, {Component} from 'react';
import {connect} from "react-redux";
import TextInput from "../form-fields/text-input";
import PropTypes from "prop-types";
import {reduxForm} from 'redux-form';
import {Link} from 'react-router-dom';
import GenericForm from '../form-fields/generic-form';
import {getProject, editProject} from '../../redux/modules/project';
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/lib/react-responsive-modal.css';
import Textarea from "../form-fields/text-area";
import StandardSelect from "../form-fields/select";
import {editUser, getUsers} from "../../redux/modules/user";
import Moment from "moment/moment";

const form = reduxForm({
    form: 'updateTicket',
});

export class SingleTicket extends Component {

    static propTypes = {
        handleSubmit: PropTypes.func,
        updateTicket: PropTypes.func,
        updateUser: PropTypes.func,
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
            id: 'name',
            name: 'name',
            label: 'Ticketname',
            type: 'text',
            placeholder: 'Ticketname',
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
            id: 'category',
            name: 'category',
            label: 'Kategorie',
            placeholder: 'Kategorie',
            children: [
                {value: 0, label: 'Keine Kategorie'},
                {value: 1, label: 'Story'},
                {value: 2, label: 'FE-Task'},
                {value: 3, label: 'BE-Task'}
            ],
            component: StandardSelect
        },
        {
            id: 'priority',
            name: 'priority',
            label: 'Priorität',
            placeholder: 'Priorität',
            children: [
                {value: 0, label: 'Keine Priorität'},
                {value: 1, label: 'Low'},
                {value: 2, label: 'Medium'},
                {value: 3, label: 'High'},
                {value: 3, label: 'Blocker'}
            ],
            component: StandardSelect
        },
        {
            id: 'estimation',
            name: 'estimation',
            label: 'Schätzung',
            type: 'number',
            placeholder: 'in h',
            component: TextInput
        },
    ];

    componentDidMount() {
        this.props.loadProject();
        this.props.loadUsers();
    };

    getUser = id => {
        return this.props.users[id];
    };

    onOpenModal = () => {
        this.setState({open: true});
        setTimeout(function() {
            const ticket = this.props.project.tickets[window.location.href.split('/')[4].split('-')[1]];
            document.getElementById('state').childNodes[ticket.state].selected = true;
            document.getElementById('category').childNodes[ticket.category].selected = true;
        }, 2000);
    };

    onCloseModal = () => {
        this.setState({open: false});
    };

    handleFormSubmit = formProps => {
        const formData = this.props.project;
        const id = formData.id;
        delete formData.id;
        formProps.id = formData.tickets.length;
        formProps.updatedAt = Moment(new Date()).format('DD.MM.YYYY HH:mm');
        const timeLog = {user: window.location.href.split('/')[4].split('-')[0], log: formProps.log};
        formProps.logging.push(timeLog);
        formData.tickets.push(formProps);
        this.props.updateTicket(formData);
    };

    render = () => {
        const {handleSubmit, errors, message} = this.props;
        const {open} = this.state;

        if (!this.props.project) {
            return null;
        } else {
            const project = this.props.project;
            const ticket = this.props.project.tickets[window.location.href.split('/')[4].split('-')[1]];
            const user = this.getUser(ticket.user);
            const state = ['Offen','In Arbeit','To Review','In Review', 'Freigabe', 'Geschlossen'];
            const category = ['Keine Kategorie','Story','FE-Task','BE-Task'];
            const priority = ['Keine Priorität','Low','Medium','High','Blocker'];
            const divStyle = {
                width: '30px',
                height: '30px',
            };
            return (
                <div>
                    <p>Projekt: {project.name}</p>
                    <form>

                    </form>
                    <p>{project.prefix}-{ticket.id}</p>
                    <p>Name: {ticket.name}</p>
                    <p>Beschreibung: {ticket.description}</p>
                    <p>Status: {state[ticket.state]}</p>
                    <p>Kategorie: {category[ticket.category]}</p>
                    <p>Priorität: {priority[ticket.priority]}</p>
                    <p>Schätzung: {ticket.estimation} h</p>
                    <p>Protokollierung: {ticket.logging} h</p>
                    <p>Sprint: {ticket.sprint}</p>
                    <p>Bearbeiter: {user.firstName} {user.lastName}</p>
                    <img src={user.avatar} style={divStyle}/>
                    <button onClick={this.onOpenModal}>Update Ticket</button>
                    <Modal open={open} onClose={this.onCloseModal} little>
                        <h2>Update Ticket</h2>
                        <GenericForm
                            onSubmit={handleSubmit(this.handleFormSubmit)}
                            //errors={errors}
                            //message={message}
                            formSpec={SingleTicket.formSpec}
                            submitText="Update"
                        />
                    </Modal>
                </div>
            );
        }
    }
}

//
const mapStateToProps = (state) => {
    return {
        project: state.project.project,
        user: state.user.user,
        users: state.user.users,
        /*errors: state.project.errors[EDIT_PROJECT],
        message: state.project.messages[EDIT_PROJECT],
        loading: state.project.loading[EDIT_PROJECT],*/
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadProject: () => {
            dispatch(getProject(window.location.href.split('/')[4].split('-')[0]));
        },
        loadUsers: () => {
            dispatch(getUsers());
        },
        updateTicket: (formData) => {
            dispatch(editProject(window.location.href.split('/')[4].split('-')[0], formData));
        },
        updateUser: (id, formData) => {
            dispatch(editUser(id, formData));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(form(SingleTicket));