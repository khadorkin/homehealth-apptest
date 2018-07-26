import {BaseMessagingService} from './BaseMessagingService';
import {VisitService} from '../../VisitServices/VisitService';
import {UserDataService} from '../../UserDataService';
import {EpisodeDataService} from '../../EpisodeDataService';
import {pushNewVisitsToServer, pushVisitDeleteByID, pushVisitUpdateToServer} from '../../../utils/API/VisitAPI';

export class VisitMessagingService extends BaseMessagingService {
    onMessage(messageObject) {
        const {message, channel} = messageObject;
        return new Promise((resolve, reject) => {
            console.log('onMessage called');
            console.log(message);
            const {actionType, visitID, userID} = message;
            if (userID === UserDataService.getCurrentUserProps().userID) {
                console.log('message for my own visit, ignoring');
                resolve();
                return;
            }
            //TODO if userID is equal to my own, skip this message
            switch (actionType) {
                case 'CREATE' :
                    Promise.all([
                        UserDataService.getInstance().fetchAndSaveUserToRealmIfMissing(userID),
                        VisitService.getInstance().fetchAndSaveVisitsByID([visitID])
                    ]).then(() => resolve())
                    .catch(error => reject(error));
                    break;
                case 'DELETE' :
                    try {
                        VisitService.getInstance().deleteVisitByID(visitID);
                    } catch (e) {
                        reject(e);
                    }
                    resolve();
                    break;
                case 'UPDATE' :
                    VisitService.getInstance().fetchAndSaveVisitsByID([visitID], true)
                        .then(() => resolve())
                        .catch(error => reject(error));
                    break;
                default:
                    console.log(`unrecognised message: ${message}`);
                    reject();
            }
        });
    }

    // onBulkMessage(messageObjects) {
    //     for (const messageObject of messageObjects) {
    //         const {message} = messageObject;
    //         const {actionType, visitID} = message;
    //         switch (actionType) {
    //             case 'CREATE' :
    //                 VisitService.getInstance().fetchAndSaveVisitsByID([visitID])
    //                     .then(() => resolve())
    //                     .catch(error => reject(error));
    //                 break;
    //             case 'DELETE' :
    //                 try {
    //                     VisitService.getInstance().deleteVisitByID(visitID);
    //                 } catch (e) {
    //                     reject(e);
    //                 }
    //                 resolve();
    //                 break;
    //             case 'UPDATE' :
    //                 VisitService.getInstance().fetchAndSaveEditedVisitsByID([visitID])
    //                     .then(() => resolve())
    //                     .catch(error => reject(error));
    //                 break;
    //             default:
    //                 // throw new Error('Unrecognised action type in assigned patient message');
    //                 console.log(`unrecognised message: ${message}`);
    //                 reject();
    //         }
    //     }
    // }

    initialiseWorkers() {
        this.taskQueue.addWorker('publishVisitMessage', this._publishVisitMessage.bind(this));
        this.taskQueue.addWorker('publishToServer', this._publishToServer.bind(this));
    }

    async _publishVisitMessage(jobID, payload) {
        await this.pubnub.publish({
            channel: `${payload.episodeID}_visits`,
            message: {
                actionType: payload.actionType,
                visitID: payload.visitID,
                userID: payload.userID,
                pn_apns: {
                    aps: {
                        'content-available': 1
                    },
                }
            }
        }).catch(error => {
            console.log('error publishing');
            throw new Error(`could not publish message ${error}`);
        });
    }

    async _publishToServer(jobID, payload) {
        console.log(`publish job here${payload}`);
        const {action, visit} = payload;
        let serverResponse;
        try {
            switch (action) {
                case 'CREATE':
                    console.log(JSON.stringify({visits: [visit]}));
                    serverResponse = await pushNewVisitsToServer([visit]);
                    break;
                case 'UPDATE':
                    serverResponse = await pushVisitUpdateToServer(visit);
                    break;
                case 'DELETE':
                    serverResponse = await pushVisitDeleteByID(visit.visitID);
                    break;
                default:
                    console.log(`invalid task: ${payload}`);
                    break;
            }
        } catch (e) {
            console.log('error in making server call');
            console.log(payload);
            console.log(e);
            throw e;
        }

        //TODO check server response is ok
        console.log('publishVisitMessage');
        this.taskQueue.createJob('publishVisitMessage', {
            visitID: visit.visitID,
            episodeID: visit.episodeID,
            actionType: action,
            userID: UserDataService.getCurrentUserProps().userID
        });
    }

    _getFlatVisitPayload(visit) {
        return {
            visitID: visit.visitID,
            episodeID: visit.getEpisode().episodeID,
            midnightEpochOfVisit: visit.midnightEpochOfVisit,
            isDone: visit.isDone,
            plannedStartTime: visit.plannedStartTime ? visit.plannedStartTime.toISOString() : undefined
        };
    }

    publishVisitCreate(visit) {
        this.taskQueue.createJob('publishToServer', {
            action: 'CREATE',
            visit: this._getFlatVisitPayload(visit)
        });
    }

    publishVisitUpdate(visit) {
        this.taskQueue.createJob('publishToServer', {
            action: 'UPDATE',
            visit: this._getFlatVisitPayload(visit)
        });
    }

    publishVisitDelete(visit) {
        this.taskQueue.createJob('publishToServer', {
            action: 'DELETE',
            visit: this._getFlatVisitPayload(visit)
        });
    }

    subscribeToEpisodes(episodes) {
        const channelObjects = episodes.map(episode => ({
            name: `${episode.episodeID}_visits`,
            //TODO this should be more sophisticated
            lastMessageTimestamp: '0',
            handler: this.constructor.name,
        }));
        this._subscribeToChannelsByObject(channelObjects);
    }

    unsubscribeToEpisodes(episodes) {
        const channelObjects = episodes.map(episode => ({
            name: `${episode.episodeID}_visits`,
            //TODO this should be more sophisticated
            lastMessageTimestamp: '0',
            handler: this.constructor.name,
        }));
        this._unsubscribeFromChannelsByObject(channelObjects);
    }

    async _bootstrapChannels() {
        const episodes = EpisodeDataService.getInstance().getAllSyncedEpisodes();
        episodes.map(episode =>
            episode.visits.forEach(visit => this.publishVisitCreate(visit))
        );

        this.subscribeToEpisodes(episodes);
    }
}
