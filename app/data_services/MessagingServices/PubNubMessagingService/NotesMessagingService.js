import {NetInfo} from 'react-native';
import firebase from 'react-native-firebase';
import moment from 'moment';
import {BaseMessagingService} from './BaseMessagingService';
import {UserDataService} from '../../UserDataService';
import {EpisodeDataService} from '../../EpisodeDataService';
import {NoteDataService} from '../../NotesDataService';
import {screenNames} from '../../../utils/constants';

//TODO
export class NotesMessagingService extends BaseMessagingService {
    static identifier = 'NotesMessagingService';

    getName() {
        return NotesMessagingService.identifier;
    }

    onMessage(messageObject) {
        const {message, channel, timetoken} = messageObject;
        return new Promise((resolve, reject) => {
            console.log('onMessage called');
            const episodeID = channel.split('_')[1];
            const {messageType, userID, messageID, dataJson} = message;
            // if (userID === UserDataService.getCurrentUserProps().userID) {
            //     console.log('on message called for a message published by myself, ignoring');
            //     resolve();
            //     return;
            // }

            switch (messageType) {
                case 'NEW_NOTE' :
                    this.processNewNoteMessage(messageObject);
                    resolve();
                    // reject(error);
                    break;
                case 'NOTIFICATION':
                    resolve();
                    break;
                default:
                    console.log(`NotesMessagingService: unrecognised message: ${message}`);
                    reject();
            }
        });
    }

    processNewNoteMessage(messageObject) {
        const noteObject = this.getNoteObjectFromMessage(messageObject.message, messageObject.timestamp, true);
        console.log('trying to save note object');
        console.log(messageObject);
        NoteDataService.getInstance().saveNoteObject(noteObject);
        console.log('saving finished');
    }

    getNoteObjectFromMessage(message, timetoken, synced) {
        const episode = EpisodeDataService.getInstance().getEpisodeByID(message.episodeID);
        const user = UserDataService.getInstance().getUserByID(message.userID);

        if (!episode || !user) {
            throw new Error('Episode or user missing for note message');
        }
        return {
            messageID: message.messageID,
            episode,
            messageType: message.messageType,
            user,
            superID: message.superID,
            data: message.data,

            timetoken: moment(timetoken / 10000).toDate(),
            synced: synced.toString(),
        };
    }

    initialiseWorkers() {
        this.taskQueue.addWorker('publishNotesMessage', this._publishNotesMessage.bind(this), {
            concurrency: 3,
            onFailed: (id, payload) => {
                console.log(`Publish Notes message Job "job-name-here" with id ${id} had an attempt end in failure. Payload: ${payload}`);
            }
        });
    }

    async _publishNotesMessage(jobID, payload) {
        await this.pubnub.publish({
            channel: `episode_${payload.episodeID}_notes`,
            message: payload,
        }).then(result => {
            // console.log('publish note result');
            //console.log(payload);
            //console.log(result);
        }).catch(error => {
            console.log('error publishing note message on pubnub');
            console.log(error);
            throw new Error(`could not publish message ${error}`);
        });
    }

    _createPublishNotesMessageJob(payload) {
        this.taskQueue.createJob('publishNotesMessage', {
            messageID: payload.messageID,
            episodeID: payload.episodeID,
            messageType: payload.messageType,
            userID: payload.userID,
            superID: payload.superID,
            data: payload.data,

            pn_apns: payload.makePeersRefresh ?
                {
                    aps: {
                        'content-available': 1
                    },
                } : undefined,
            pn_gcm: payload.makePeersRefresh ?
                {
                    data: {
                        content_available: true,
                        notificationBody: payload.notificationBody,
                        sound: 'default',
                        navigateTo: screenNames.patientDetailsScreen,
                        episodeID: payload.episodeID
                    },
                } : undefined,
        }, {
            attempts: 5
        });

        this.taskQueue.createJob('publishNotesMessage', {
            messageType: 'NOTIFICATION',
            pn_apns: {
                aps: {
                    alert: {
                        body: payload.notificationBody,
                    },
                    sound: 'default',
                },
                payload: {
                    episodeID: payload.episodeID,
                    navigateTo: screenNames.patientDetailsScreen
                }
            }
        }, {
            attempts: 5
        });
    }

    publishNewNote(note) {
        this._createPublishNotesMessageJob({
            messageID: note.messageID,
            episodeID: note.episode.episodeID,
            messageType: note.messageType,
            userID: note.user.userID,
            superID: note.superID,
            data: note.data,
            makePeersRefresh: true,

            notificationBody: `New note added for ${note.episode.patient[0].abbName}`
        });
    }

    subscribeToEpisodeNotes(episodes, suppressNotificationFromHistory = false) {
        const channelObjects = episodes.map(episode => ({
            name: `episode_${episode.episodeID}_notes`,
            //TODO this should be more sophisticated
            lastMessageTimestamp: '0',
            handler: NotesMessagingService.identifier,
        }));
        this._subscribeToChannelsByObject(channelObjects, suppressNotificationFromHistory);
    }

    unsubscribeToEpisodeNotes(episodes) {
        const channelObjects = episodes.map(episode => ({
            name: `episode_${episode.episodeID}_notes`,
            //TODO this should be more sophisticated
            lastMessageTimestamp: '0',
            handler: NotesMessagingService.identifier,
        }));
        this._unsubscribeFromChannelsByObject(channelObjects);
    }

    async _bootstrapChannels() {
        const episodes = EpisodeDataService.getInstance().getAllSyncedEpisodes();
        console.log('bootstrapping note channels');
        this.subscribeToEpisodeNotes(episodes, true);
    }
}
