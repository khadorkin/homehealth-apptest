import {User} from '../User';

export const UserSchemaV1 = {
    name: User.getSchemaName(),
    primaryKey: 'id',
    properties: {
        id: 'string',
        firstName: 'string',
        lastName: 'Address',
        primaryContact: 'string?',
        role: 'string'
    }
};
