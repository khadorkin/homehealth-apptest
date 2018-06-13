import moment from 'moment';
import {Patient} from '../utils/data/schema';
import {PatientActions} from '../redux/Actions';
import {arrayToMap, arrayToObjectByKey, filterResultObjectByListMembership} from '../utils/collectionUtils';
import {addressDataService} from './AddressDataService';
import {parsePhoneNumber} from '../utils/lib';
import {visitDataService} from './VisitDataService';

import * as PatientAPI from '../utils/PatientAPI';

class PatientDataService {
    static getFlatPatient(patient) {
        return {
            patientID: patient.patientID,
            name: patient.name,
            addressID: patient.address.addressID,
            primaryContact: patient.primaryContact,
            emergencyContact: patient.emergencyContact,
            notes: patient.notes,
            //TODO this will need work if more than one episode per patient
            visits: patient.episodes[0].visits.map(visit => visit.visitID),
            archived: patient.archived
        };
    }

    static getFlatPatientMap(patients) {
        return arrayToObjectByKey(patients.map(patient => PatientDataService.getFlatPatient(patient)), 'patientID');
    }

    constructor(floDB, store) {
        this.floDB = floDB;
        this.store = store;
    }

    getPatientByID(patientID) {
        return this.floDB.objectForPrimaryKey(Patient, patientID);
    }

    createNewPatient(patient, isLocallyOwned = true) {
        // Todo: Add proper ID generators
        // Create a patient, create & add an address, and create & add an episode
        const patientId = patient.id ? patient.id : Math.random().toString();
        const episodeId = Math.random().toString();
        const addressId = Math.random().toString();

        let newPatient = null;
        this.floDB.write(() => {
            // Add the patient
            newPatient = this.floDB.create(Patient.schema.name, {
                patientID: patientId,
                name: patient.name ? patient.name.toString().trim() : '',
                primaryContact: patient.primaryContact ? parsePhoneNumber(patient.primaryContact.toString().trim()) : '',
                emergencyContact: patient.emergencyContact ? parsePhoneNumber(patient.emergencyContact.toString().trim()) : '',
                notes: patient.notes ? patient.notes.toString().trim() : '',
                timestamp: patient.createdOn ? moment(patient.createdOn).valueOf() : moment().utc().valueOf(),
            });

            if (isLocallyOwned) { addressDataService.addAddressToTransaction(newPatient, patient.address, patient.address.id); } else addressDataService.addAddressToTransaction(newPatient, patient, addressId);

            // Todo: Add an episode, Move this to its own Data Service
            newPatient.episodes.push({
                episodeID: episodeId,
                diagnosis: []
            });
        });
        if (newPatient) {
            this.addPatientsToRedux([newPatient]);
        }
    }

    editExistingPatient(patientId, patient) {
        let patientObj = null;
        this.floDB.write(() => {
            patientObj = this.floDB.objectForPrimaryKey(Patient.schema.name, patientId);

            // Edit the corresponding address info
            addressDataService.addAddressToTransaction(patientObj, patient, patient.addressID);

            // Edit the patient info
            this.floDB.create(Patient.schema.name, {
                patientID: patient.patientID,
                name: patient.name ? patient.name.toString().trim() : '',
                primaryContact: patient.primaryContact ? parsePhoneNumber(patient.primaryContact.toString().trim()) : '',
                emergencyContact: patient.emergencyContact ? parsePhoneNumber(patient.emergencyContact.toString().trim()) : '',
                notes: patient.notes ? patient.notes.toString().trim() : '',
                timestamp: 0,                                   // Todo: Add a timestmap
            }, true);
        });
        if (patientObj) {
            this.updatePatientsInRedux([patientObj]);
        }
    }

    archivePatient(patientId) {
        console.log('Archiving Patient from realm');
        let patient = null;
        let obj = null;
        this.floDB.write(() => {
            patient = this.floDB.objectForPrimaryKey(Patient.schema.name, patientId);
            patient.archived = true;
            obj = visitDataService.deleteVisits(patient);
        });
        if (patient) {
            this.archivePatientsInRedux([patientId]);
        }
        if (obj && obj.visits) {
            visitDataService.deleteVisitsFromRedux(obj.visits);
        }
        if (obj && obj.visitOrders) {
            for (let i = 0; i < obj.visitOrders.length; i++) {
                visitDataService.updateVisitOrderToReduxIfLive(obj.visitOrders[i].visitList, obj.visitOrders[i].midnightEpoch);
            }
        }
        console.log('Patient archived. His visits Deleted');
    }

    updatePatientListFromServer() {
        return PatientAPI.getPatientIDList()
            .then(json => {
                console.log('here');
                console.log(json);

                const serverPatientIDs = json.patients;
                const existingPatients = this.floDB.objects(Patient).filtered('isLocallyOwned = false');
                const intersectingPatients = filterResultObjectByListMembership(existingPatients, 'patientID', serverPatientIDs);

                const intersectingPatientsByID = arrayToMap(filterResultObjectByListMembership(intersectingPatients, 'patientID', serverPatientIDs), 'patientID');

                const deletedPatients = [];
                existingPatients.forEach(patient => {
                    if (!intersectingPatientsByID.has(patient.patientID)) {
                        deletedPatients.push(patient);
                        //TODO batch process it
                        // this.archivePatient(patient.patientID);
                    }
                });

                const newPatientIDs = [];
                serverPatientIDs.forEach(patientID => {
                    if (!intersectingPatientsByID.has(patientID)) {
                        newPatientIDs.push(patientID);
                        //TODO batch it
                    }
                });

                return {
                    deletedPatients,
                    newPatientIDs
                };
        })
        .then(({deletedPatients, newPatientIDs}) => {
            console.log('here2');
            return this._fetchAndSavePatientsByID(newPatientIDs);
        });
    }

    _fetchAndSavePatientsByID(newPatientIDs) {
        return PatientAPI.getPatientsByID(newPatientIDs)
            .then(json => {
                console.log('here5');

                const successfulObjects = json.success;
                for (const patientID in successfulObjects) {
                    this.createNewPatient(successfulObjects[patientID], false);
                }
                return successfulObjects.length;
            });
    }

    updatePatientsInRedux(patients) {
        this.store.dispatch({
            type: PatientActions.EDIT_PATIENTS,
            patientMap: PatientDataService.getFlatPatientMap(patients)
        });
        addressDataService.updateAddressesInRedux(patients.map(patient => patient.address));
    }

    addPatientsToRedux(patients) {
        this.store.dispatch({
            type: PatientActions.ADD_PATIENTS,
            patientMap: PatientDataService.getFlatPatientMap(patients)
        });
        addressDataService.addAddressesToRedux(patients.map(patient => patient.address));
    }

    archivePatientsInRedux(patients) {
        console.log('Archiving patient in Redux');
        this.store.dispatch({
            type: PatientActions.ARCHIVE_PATIENTS,
            patientList: patients
        });
    }
}

export let patientDataService;

export function initialiseService(floDB, store) {
    patientDataService = new PatientDataService(floDB, store);
}
