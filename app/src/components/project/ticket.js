import React, {Component} from 'react';
import {connect} from "react-redux";
import TextInput from "../form-fields/text-input";
import PropTypes from "prop-types";
import {reduxForm} from 'redux-form';
import GenericForm from '../form-fields/generic-form';
import {getProject, editProject} from '../../redux/modules/project';
import Modal from 'react-responsive-modal';
import Select from 'react-select';
import 'react-responsive-modal/lib/react-responsive-modal.css';
import Textarea from "../form-fields/text-area";
import StandardSelect from "../form-fields/select";
import {editUser, getUsers} from "../../redux/modules/user";
import Moment from "moment/moment";
import ProgressBar from 'react-progressbar.js';

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
            open2: false,
            currentTicket: null,
            progress: 0,
            image: '',
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
            minValue: 0.25,
            stepValue: 0.25,
            component: TextInput
        },
    ];

    createOptions() {
        if (!this.props.project) {
            return null;
        } else {
            const options = [];
            for (let i = 0; i < this.props.project.users.length; i++) {
                const user = this.getUser(this.props.project.users[i]);
                const option = {
                    value: i + 1,
                    label: user.firstName + ' ' + user.lastName,
                    id: user.id,
                    className: 'user-option'
                };
                options.push(option);
            }
            const defaultOption = {value: 0, label: 'Kein Bearbeiter', className: 'user-option'};
            options.unshift(defaultOption);
            return options;
        }
    };

    componentDidMount() {
        this.props.loadProject();
        this.props.loadUsers();
    };

    getUser = id => {
        return this.props.users[id];
    };

    onOpenModal = () => {
        const projectData = this.props.project;
        const ticketId = window.location.href.split('/')[4].split('-')[1];
        for (let i = 0; i < SingleTicket.formSpec.length; i++) {
            Object.keys(SingleTicket.formSpec[i]).forEach(function (fKey) {
                if (fKey === 'name') {
                    Object.keys(projectData.tickets[ticketId]).forEach(function (pKey) {
                        if (pKey === SingleTicket.formSpec[i][fKey]) {
                            if (pKey === 'category' || pKey === 'priority') {
                                SingleTicket.formSpec[i]['defaultValue'] = parseInt(projectData.tickets[ticketId][pKey]);
                            } else {
                                SingleTicket.formSpec[i]['defaultValue'] = projectData.tickets[ticketId][pKey];
                            }
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

    onOpenImageModal = (path) => {
        this.setState({image: path});
        this.setState({open2: true});
    };

    onCloseImageModal = () => {
        this.setState({open2: false});
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

    onUserChange = (tId, obj) => {
        const projectData = this.props.project;

        // Setup Data for old User
        const oldUserData = projectData.tickets[tId].user;
        if (Object.keys(oldUserData).length !== 0) {
            const oldUserId = oldUserData.id;
            for (let i = 0; i < oldUserData.tickets.length; i++) {
                if (oldUserData.tickets[i].project === this.props.project.id && oldUserData.tickets[i].ticket === tId) {
                    oldUserData.tickets.splice(i, 1);
                }
            }
            this.props.updateUser(oldUserId, oldUserData);
        }

        // Setup Data for new User
        const newUserData = this.props.project.users[obj.value - 1];
        const newUserId = newUserData.id;
        const ticket = {project: this.props.project.id, ticket: tId};
        newUserData.tickets.push(ticket);
        this.props.updateUser(newUserId, newUserData);

        // Setup Data for Ticket
        const id = window.location.href.split('/')[4];
        delete projectData.id;
        projectData.tickets[tId].user = obj.value === 0 ? {} : this.props.project.users[obj.value - 1];
        this.props.updateTicket(id, projectData);
    };

    onTextChange = (val, id) => {
        document.getElementById(id).value = val;
    };

    chooseFile = () => {
        document.getElementById('imgupload').click();
    };

    deleteTicket = (id) => {
        const projectData = this.props.project;
        const projectId = projectData.id;
        delete projectData.id;
        projectData.tickets.splice(id, 1);
        this.props.deleteTicket(projectId, projectData);
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
        const {open2} = this.state;

        if (!this.props.project && !this.props.user) {
            return null;
        } else {
            const project = this.props.project;
            const ticket = this.props.project.tickets[window.location.href.split('/')[4].split('-')[1]];
            let user = {};
            if (ticket.user !== '') {
                user = this.getUser(ticket.user);
            }
            const originUser = this.getUser(ticket.originUser);
            const isTicketOwner = ticket.originUser === this.props.user.id;
            const isOpen = ticket.state === 0;
            const isActive = ticket.state > 0 && ticket.state < 5;
            const isClosed = ticket.state === 5;
            const $this = this;
            const state = ['Offen', 'In Arbeit', 'To Review', 'In Review', 'Freigabe', 'Geschlossen'];
            const category = ['Keine Kategorie', 'Story', 'FE-Task', 'BE-Task'];
            const priority = ['Keine Priorität', 'Low', 'Medium', 'High', 'Blocker'];
            let logging = 0.0;
            for (let i = 0; i < ticket.logging.length; i++) {
                logging += parseFloat(ticket.logging[i].time);
            }
            this.state.progress = ((logging * 100) / parseFloat(ticket.estimation)) / 100;
            const Line = ProgressBar.Line;
            const options = this.createOptions();

            function getCurrOption(idKey, arr) {
                for (let i = 0; i < options.length; i++) {
                    if (options[i].id === idKey) {
                        return i;
                    }
                }
            }

            return (
                <div>
                    <div className="ticket__container">
                        <div className="ticket__header">
                            <h2>{project.name} | {project.prefix}-{ticket.id}</h2>
                            {isOpen ? <span className="is-open">{state[ticket.state]}</span> : ''}
                            {isActive ? <span className="is-active">{state[ticket.state]}</span> : ''}
                            {isClosed ? <span className="not-active">{state[ticket.state]}</span> : ''}
                            {isTicketOwner ?
                                <button onClick={() => this.deleteTicket(ticket.id)}
                                        className="button is-primary">Delete
                                    Ticket</button> : ''}
                            <button onClick={this.onOpenModal} className="button is-primary">Update
                                Ticket
                            </button>
                        </div>
                        <div className="ticket__info-container">
                            <div className="ticket__info-1">
                                <label>Name:</label>
                                <hr></hr>
                                <p>{ticket.name}</p>
                                <label>Beschreibung:</label>
                                <hr></hr>
                                <p>{ticket.description}</p>
                                <label>Zeitmanagement:</label>
                                <hr></hr>
                                <p>Schätzung: {ticket.estimation} h</p>
                                <p>Protokolliert: {logging} h</p>
                                <Line
                                    progress={this.state.progress}
                                    options={{
                                        strokeWidth: 4,
                                        color: '#16DD00',
                                        trailColor: '#EEE',
                                    }}
                                    initialAnimate={true}
                                    containerStyle={{
                                        width: '200px',
                                        height: '20px'
                                    }}
                                    containerClassName={'.progressbar'}/>
                                <p>{this.state.progress * 100} %</p>
                                <ul>
                                    {_.map(_.range(ticket.logging.length), function (i) {
                                        const user = $this.getUser(ticket.logging[i].user);
                                        return <li className="log__item">
                                            <p>{ticket.logging[i].date}: {user.firstName} {user.lastName} - {ticket.logging[i].time} h</p>
                                        </li>
                                    })}
                                </ul>
                                <GenericForm
                                    onSubmit={handleSubmit(this.handleFormSubmit3)}
                                    //errors={errors}
                                    //message={message}
                                    formSpec={SingleTicket.formSpec3}
                                    submitText="Protokollieren"
                                />
                                <label>Dateien:</label>
                                <hr></hr>
                                <ul className="files__list">
                                    {_.map(_.range(ticket.files.length), function (i) {
                                        return <li className="file__item">
                                            <img src={ticket.files[i].file} onClick={() => $this.onOpenImageModal(ticket.files[i].file)}/>
                                            <span>{ticket.files[i].uploadedAt}</span>
                                        </li>
                                    })}
                                </ul>
                                <div className="uploadzone" onDrop={(e) => $this.handleDrop(e)}
                                     onClick={$this.chooseFile}>
                                    <input type="file" id="imgupload" onChange={(e) => $this.handleDrop(e)}/>
                                    Drop files here or click to choose
                                </div>
                                <label>Kommentare:</label>
                                <hr></hr>
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
                                                    <input type="text" name="title"
                                                           defaultValue={ticket.comments[i].title}
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
                            </div>
                            <div className="ticket__info-2">
                                <label>Nutzer:</label>
                                <hr></hr>
                                <span>Ersteller</span>
                                <p><img src={originUser.avatar}
                                        className="user-avatar"/> {originUser.firstName} {originUser.lastName}</p>
                                <span>Bearbeiter</span>
                                <Select
                                    id="user-select"
                                    options={options}
                                    name="selected-user"
                                    value={options[Object.keys(user).length !== 0 ? getCurrOption(user.id) : 0]}
                                    onChange={(e) => $this.onUserChange(ticket.id, e)}
                                    searchable={true}
                                />
                                <label>Priorität:</label>
                                <hr></hr>
                                <p>{ticket.priority === "1" ? <span><i className="material-icons p-1"
                                                                       title="Low">arrow_downward</i> {priority[ticket.priority]}</span> : ''}</p>
                                <p>{ticket.priority === "2" ? <span><i className="material-icons p-2"
                                                                       title="Medium">radio_button_unchecked</i> {priority[ticket.priority]}</span> : ''}</p>
                                <p>{ticket.priority === "3" ? <span><i className="material-icons p-3"
                                                                       title="High">priority_high</i> {priority[ticket.priority]}</span> : ''}</p>
                                <p>{ticket.priority === "4" ? <span><i className="material-icons p-4"
                                                                       title="Blocker">do_not_disturb_alt</i> {priority[ticket.priority]}</span> : ''}</p>
                                <label>Kategorie:</label>
                                <hr></hr>
                                <p>{ticket.category === "1" ? <span><i className="material-icons"
                                                                       title="Story">speaker_notes</i> {category[parseInt(ticket.category)]}</span> : ''}</p>
                                <p>{ticket.category === "2" ? <span><i className="material-icons"
                                                                       title="FE-Task">web</i> {category[parseInt(ticket.category)]}</span> : ''}</p>
                                <p>{ticket.category === "3" ? <span><i className="material-icons"
                                                                       title="BE-Task">developer_board</i> {category[parseInt(ticket.category)]}</span> : ''}</p>
                                <label>Aktuell in Sprint:</label>
                                <hr></hr>
                                <p>{ticket.sprint >= 0 ? project.sprints[ticket.sprint].name : 'Kein Sprint'}</p>
                            </div>
                        </div>
                    </div>
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
                    <Modal open={open2} onClose={this.onCloseImageModal} classNames={{'modal': 'image-modal'}} little>
                        <img src={this.state.image} />
                    </Modal>
                </div>
            );
        }
    }
}

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