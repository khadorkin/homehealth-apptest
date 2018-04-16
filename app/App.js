import {Navigation} from 'react-native-navigation';
import {RegisterScreens} from './screens';

RegisterScreens();

const navigatorStyle = {
        navBarBackgroundColor: '#45ceb1',
        navBarTextColor: '#ffffff',
        navBarButtonColor: '#666666',
        tabBarBackgroundColor: '#45ceb1',
}

Navigation.startTabBasedApp({
    tabs: [
        // {
        //     label: 'two',
        //     icon: require('../resources/ic_fiber_pin_2x.png'),
        //     screen: 'VisitsList'
        // },
        {
            title: 'Visits',
            label: 'two',
            icon: require('../resources/ic_fiber_pin_2x.png'),
            screen: 'Visit2',
            navigatorStyle: navigatorStyle
        },
        {
            title: 'Add new patient',
            label: 'add',
            icon: require('../resources/ic_location_on_black_24dp.png'),
            screen: 'AddPatient',
            navigatorStyle: navigatorStyle
        },
        {
            title: 'Patient Details',
            label: 'details',
            icon: require('../resources/ic_location_on_black_24dp.png'),
            screen: 'PatientDetails',
            navigatorStyle: navigatorStyle
        },
        {
            title: 'Patients',
            label: 'patientList',
            icon: require('../resources/ic_location_on_black_24dp.png'),
            screen: 'PatientList',
            navigatorStyle: navigatorStyle
        }
    ]
});
