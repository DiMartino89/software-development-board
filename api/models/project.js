const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//= ===============================
// project Schema
//= ===============================
const ProjectSchema = new Schema({
        name: {type: String, required: true},
        prefix: {type: String, required: true},
        description: {type: String},
        begin: {type: Date, default: Date.now, required: true},
        end: {type: Date, required: true},
        sprints: [],
        users: [],
        tickets: [],
        deactivated: {type: Boolean, default: false},
    },
    {
        timestamps: true,
        toObject: {
            virtuals: true,
        },
        toJSON: {
            virtuals: true,
        },
    });

ProjectSchema.virtual('fullName').get(function virtualFullName() {
    return `${this.name}`;
});

module.exports = mongoose.model('Project', ProjectSchema);
