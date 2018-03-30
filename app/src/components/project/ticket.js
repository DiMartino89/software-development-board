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
        deleteTicket: PropTypes.func,
        updateUser: PropTypes.func,
        /*errors: errorPropTypes,
        message: PropTypes.string,
        loading: PropTypes.bool,*/
    };

    constructor(props) {
        super(props);

        this.state = {
            open: false,
            currentTicket: null,
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

    static formSpec2 = [
        {
            id: 'title',
            name: 'title',
            label: 'Betreff',
            type: 'text',
            placeholder: 'Betreff',
            component: TextInput
        },
        {
            id: 'message',
            name: 'message',
            label: 'Nachricht',
            type: 'text',
            placeholder: 'Nachricht',
            component: Textarea
        },
    ];

    static formSpec3 = [
        {
            id: 'time',
            name: 'time',
            label: 'Zeit protokollieren',
            type: 'number',
            placeholder: 'x.x',
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
        setTimeout(function () {
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
        this.props.updateTicket(id, formData);
    };

    handleFormSubmit2 = formProps => {
        const formData = this.props.project;
        const id = formData.id;
        const ticketId = window.location.href.split('/')[4].split('-')[1];
        delete formData.id;
        formProps.user = this.props.user.id;
        if (this.state.currentTicket !== null) {
            formProps.createdAt = formData.tickets[ticketId].comments[this.state.currentTicket].createdAt;
            formProps.updatedAt = Moment(new Date()).format('DD.MM.YYYY HH:mm');
            delete formData.tickets[ticketId].comments[this.state.currentTicket];
            formProps.id = this.state.currentTicket;
            formProps.title = document.getElementById("title_" + formProps.id).value;
            formProps.message = document.getElementById("message_" + formProps.id).value;
            formData.tickets[ticketId].comments[this.state.currentTicket] = formProps;
            this.props.updateTicket(id, formData);
        } else {
            formProps.createdAt = Moment(new Date()).format('DD.MM.YYYY HH:mm');
            formProps.updatedAt = Moment(new Date()).format('DD.MM.YYYY HH:mm');
            formProps.id = formData.tickets[ticketId].comments.length;
            formData.tickets[ticketId].comments.push(formProps);
            this.props.updateTicket(id, formData);
        }
        return false;
    };

    handleFormSubmit3 = formProps => {
        const formData = this.props.project;
        const id = formData.id;
        const ticketId = window.location.href.split('/')[4].split('-')[1];
        delete formData.id;
        formProps.user = this.props.user.id;
        formProps.date = Moment(new Date()).format('DD.MM.YYYY HH:mm');
        formData.tickets[ticketId].logging.push(formProps);
        this.props.updateTicket(id, formData);
    };

    showSubmit = id => {
        document.getElementById('comment__' + id).style.visibility = "visible";
        document.getElementById('comment__' + id).style.opacity = "1";
        this.setState({currentTicket: id});
    };

    hideSubmit = id => {
        document.getElementById('comment__' + id).style.opacity = "0";
        document.getElementById('comment__' + id).style.visibility = "hidden";
        this.setState({currentTicket: null});
    };

    onTextChange = (val, id) => {
        document.getElementById(id).value = val;
    };

    chooseFile = () => {
        document.getElementById('imgupload').click();
    };

    deleteTicket = () => {
        const projectData = this.props.project;
        const projectIid = projectData.id;
        const ticketId = window.location.href.split('/')[4].split('-')[1];
        delete projectData.id;
        projectData.tickets.splice(ticketId, 1);
        this.props.deleteTicket(projectIid, projectData);
    };

    handleDrop = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const formProps = {};
        const $this = this;

        for (let i = 0; i < event.target.files.length; i++) {
            let reader = new FileReader();
            reader.onload = function (output) {
                formProps.file = output.target.result;
                formProps.user = $this.props.user.id;
                formProps.uploadedAt = Moment(new Date()).format('DD.MM.YYYY HH:mm');

                if (Object.keys(formProps).length) {
                    const formData = this.props.project;
                    const id = formData.id;
                    const ticketId = window.location.href.split('/')[4].split('-')[1];
                    delete formData.id;
                    formData.tickets[ticketId].files.push(formProps);
                    this.props.updateTicket(id, formData);
                }
            }.bind(this);

            reader.readAsDataURL(event.target.files[i]);
        }
    };

    render = () => {
        const {handleSubmit, errors, message} = this.props;
        const {open} = this.state;

        if (!this.props.project && !this.props.user) {
            return null;
        } else {
            const project = this.props.project;
            const ticket = this.props.project.tickets[window.location.href.split('/')[4].split('-')[1]];
            const user = this.getUser(ticket.user);
            const isProjectOwner = this.props.project.users[0] === this.props.user.id;
            const isTicketOwner = ticket.originUser === this.props.user.id;
            const $this = this;
            const state = ['Offen', 'In Arbeit', 'To Review', 'In Review', 'Freigabe', 'Geschlossen'];
            const category = ['Keine Kategorie', 'Story', 'FE-Task', 'BE-Task'];
            const priority = ['Keine Priorität', 'Low', 'Medium', 'High', 'Blocker'];
            const divStyle = {
                width: '30px',
                height: '30px',
            };

            let logging = 0.0;
            for(let i=0; i < ticket.logging.length; i++) {
                logging += parseFloat(ticket.logging[i].time);
            }
            return (
                <div>
                    <p>Projekt: {project.name}</p>
                    <p>{project.prefix}-{ticket.id}</p>
                    <p>Name: {ticket.name}</p>
                    <p>Beschreibung: {ticket.description}</p>
                    <p>Status: {state[ticket.state]}</p>
                    <p>Kategorie: {category[ticket.category]}</p>
                    <p>Priorität: {priority[ticket.priority]}</p>
                    <p>Schätzung: {ticket.estimation} h</p>
                    <p>Protokollierung: {logging} h</p>
                    <p>Sprint: {ticket.sprint}</p>
                    <p>Bearbeiter: {user.firstName} {user.lastName}</p>
                    <img src={user.avatar} style={divStyle}/>
                    <button onClick={this.onOpenModal} className="button is-primary">Update Ticket</button>
                    {isProjectOwner || isTicketOwner ? <button onClick={() => this.deleteTicket} className="button is-primary">Delete Ticket</button> : ''}
                    <h2>Arbeit Protokollieren:</h2>
                    {_.map(_.range(ticket.logging.length), function (i) {
                        const user = $this.getUser(ticket.logging[i].user);
                        return <li className="log__item">
                            <p>{ticket.logging[i].date}: {user.firstName} {user.lastName} - {ticket.logging[i].time} h</p>
                        </li>
                    })}
                    <GenericForm
                        onSubmit={handleSubmit(this.handleFormSubmit3)}
                        //errors={errors}
                        //message={message}
                        formSpec={SingleTicket.formSpec3}
                        submitText="Protokollieren"
                    />
                    <h2>Files:</h2>
                    <ul className="files__list">
                        {_.map(_.range(ticket.files.length), function (i) {
                            return <li className="file__item">
                                <img src={ticket.files[i].file}/>
                                <span>{ticket.files[i].uploadedAt}</span>
                            </li>
                        })}
                    </ul>
                    <div className="uploadzone" onDrop={(e) => $this.handleDrop(e)} onClick={$this.chooseFile}>
                        <input type="file" id="imgupload" onChange={(e) => $this.handleDrop(e)}/>
                        Drop files here or click to choose
                    </div>
                    <h2>Comments:</h2>
                    <ul>
                        {_.map(_.range(ticket.comments.length), function (i) {
                            if (ticket.comments[i].user === user.id) {
                                const author = $this.getUser(ticket.comments[i].user);
                                return <li>
                                    <p>{author.firstName} {author.lastName} | {ticket.comments[i].updatedAt}</p>
                                    <form className={"form " + "comment__form"}
                                          onSubmit={handleSubmit($this.handleFormSubmit2)}
                                          onMouseEnter={() => $this.showSubmit(ticket.comments[i].id)}
                                          onMouseLeave={() => $this.hideSubmit(ticket.comments[i].id)}
                                    >
                                        <input type="text" name="title" defaultValue={ticket.comments[i].title}
                                               id={"title_" + ticket.comments[i].id}
                                               className="form-control" placeholder="Betreff"
                                        />
                                        <textarea name="message" defaultValue={ticket.comments[i].message}
                                                  id={"message_" + ticket.comments[i].id}
                                                  placeholder="Nachricht" className="form-control"
                                                  onChange={(evt) => $this.onTextChange(evt.target.value, evt.target.id)}
                                        />
                                        <button type="submit" id={"comment__" + ticket.comments[i].id}
                                                className="button is-primary">Update
                                        </button>
                                    </form>
                                </li>
                            } else {
                                return <li>
                                    <p>{ticket.comments[i].user} | {ticket.comments[i].updatedAt}</p>
                                    <p>Betreff: {ticket.comments[i].title}</p>
                                    <p>Nachricht: {ticket.comments[i].message}</p>
                                </li>
                            }
                        })}
                    </ul>
                    <GenericForm
                        onSubmit={handleSubmit(this.handleFormSubmit2)}
                        //errors={errors}
                        //message={message}
                        formSpec={SingleTicket.formSpec2}
                        submitText="Kommentieren"
                    />
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
        updateTicket: (id, formData) => {
            dispatch(editProject(id, formData));
        },
        deleteTicket: (id, formData) => {
            dispatch(editProject(id, formData));
        },
        updateUser: (id, formData) => {
            dispatch(editUser(id, formData));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(form(SingleTicket));