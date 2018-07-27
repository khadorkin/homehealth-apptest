import {User} from '../utils/data/schema';
import {getItem} from '../utils/InMemoryStore';
import {getUserProps} from '../utils/API/UserAPI';

export class UserDataService {
    static userDataService;

    static initialiseService(floDB, store) {
        UserDataService.userDataService = new UserDataService(floDB, store);
    }

    constructor(floDB, store) {
        this.floDB = floDB;
        this.store = store;
    }

    static getCurrentUserProps() {
        return getItem('myUserDetails');
    }

    static getInstance() {
        if (!UserDataService.userDataService) {
            throw new Error('User Data service called without being initialised');
        }
        return UserDataService.userDataService;
    }

    static fetchUserProps(id) {
        return getUserProps(id).then(userPropsJson => {
            const userID = userPropsJson.userID;
            const firstName = userPropsJson.firstName;
            const lastName = userPropsJson.lastName;
            const primaryContact = userPropsJson.primaryContact;
            const role = userPropsJson.roles[0].role;
            const org = userPropsJson.roles[0].org;

            console.log('fetched userprops');
            console.log({
                userID,
                firstName,
                lastName,
                primaryContact,
                role,
                org
            });

            return {
                userID,
                firstName,
                lastName,
                primaryContact,
                role,
                org
            };
        }).catch((error) => {
            console.log('error in fetchUserProps');
            console.log(error);
            throw {name: 'MissingNecessaryInternetConnection'};
        });
    }

    fetchAndSaveUserToRealmIfMissing(id) {
        const user = this.getUserByID(id);
        console.log('fetch and save user of missing');
        console.log(user);
        if (user) {
            return new Promise((resolve) => resolve(user));
        }

        return UserDataService.fetchUserProps(id).then(userJson => {
            console.log('entereted then block');
            return this.saveUserToRealm(userJson);
        }).catch(error => {
            console.log('error in fetch and save user');
            console.log(error);
            throw error;
        });
    }

    saveUserToRealm(user) {
        let userObject;
        console.log('save to realm');
        this.floDB.write(() => {
            userObject = this.floDB.create(User, user, true);
        });
        console.log('save to realm');
        console.log(userObject);
        return userObject;
    }

    getUserByID(userID) {
        return this.floDB.objectForPrimaryKey(User, userID);
    }
}
