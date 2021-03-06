import {Navigation} from 'react-native-navigation';
import {screenNames} from '../utils/constants';
import AddPatientScreenContainer from './AddPatientScreenContainer';
import PatientDetailScreenContainer from '../components/PatientScreen/PatientDetailScreen/PatientDetailScreenContainer';
import PatientListScreenContainer from './PatientListScreenContainer';
import AddNoteScreenContainer from './AddNoteScreenContainer';
import HomeScreenContainer from '../components/HomeScreen/HomeScreenContainer';
// import VisitListScreenContainer from '../components/VisitListScreen/visitListScreenContainer';
import {AddVisitsScreenContainer} from '../components/AddVisitsScreen/AddVisitsScreenContainer';
import AddStopScreenContainer from './AddStopScreenContainer';
// import VisitMapScreenController from '../components/VisitMapScreen/VisitMapScreenController';
import {ScreenWithCalendarComponent} from '../components/common/screenWithCalendarComponent';
import StopListScreenContainer from './StopListScreenContainer';
import AddOrRescheduleVisitsLightBox from '../components/AddVisitsScreen/AddOrRescheduleVisitsLightBox';
// import {todayMomentInUTCMidnight} from '../utils/utils';
// import {CreateAndSaveDummies, floDB, Visit, VisitOrder} from '../utils/data/schema';
import {MoreScreen} from '../components/MoreScreen/MoreScreen';
import {LegalScreen} from '../components/LegalScreen';
import LockOnInactivity from '../components/common/LockOnInactivity';
import {VisitDayViewScreen} from '../components/VisitDayViewScreen';
import MilesLogScreenContainer from '../components/Miles/MilesLogScreenContainer';
import {AddTaskComponent} from '../components/HomeScreen/AddTaskComponent';
import {NotificationScreen} from '../components/NotificationScreen/NotificationScreen';
import OnlinePatientLightBox from '../components/PatientListScreen/OnlinePatientLightBox';
import {PatientScreenContainer} from '../components/PatientScreen/PatientScreenContainer';
import {ImageLightBox} from '../components/PatientScreen/NotesView/ImageLightBox';

const RegisterScreens = (store, Provider) => {
    // if (floDB.objects(Visit.schema.name).length === 0) {
    //     CreateAndSaveDummies();
    //     CreateAndSaveDummies();
    //     CreateAndSaveDummies();
    //     CreateAndSaveDummies();
    //     CreateAndSaveDummies();
    //     CreateAndSaveDummies();
    //     CreateAndSaveDummies();
    //     CreateAndSaveDummies();
    //     CreateAndSaveDummies();
    //     CreateAndSaveDummies();
    //     CreateAndSaveDummies();
    //     CreateAndSaveDummies();
    //     CreateAndSaveDummies();
    //     CreateAndSaveDummies();
    //     CreateAndSaveDummies();
    //
    //     const visitOrder = floDB.objectForPrimaryKey(VisitOrder, todayMomentInUTCMidnight().valueOf());
    //     floDB.write(() => {
    //         visitOrder.visitList = floDB.objects(Visit);
    //     });
    // }
    console.disableYellowBox = true;

    Navigation.registerComponent(screenNames.addPatient, () => LockOnInactivity(AddPatientScreenContainer));
    Navigation.registerComponent(screenNames.addNote, () => LockOnInactivity(AddNoteScreenContainer));
    Navigation.registerComponent(screenNames.patientDetails, () => LockOnInactivity(PatientDetailScreenContainer));
    Navigation.registerComponent(screenNames.patient, () => LockOnInactivity(PatientScreenContainer));
    Navigation.registerComponent(screenNames.patientList, () => LockOnInactivity(PatientListScreenContainer));
    Navigation.registerComponent(screenNames.homeScreen, () => LockOnInactivity(HomeScreenContainer), store, Provider);
    Navigation.registerComponent(screenNames.notificationScreen, () => LockOnInactivity(NotificationScreen));
    Navigation.registerComponent(screenNames.moreScreen, () => LockOnInactivity(MoreScreen));
    Navigation.registerComponent(screenNames.legal, () => LockOnInactivity(LegalScreen));
    // Navigation.registerComponent(screenNames.visitListScreen, () => LockOnInactivity(VisitListScreenContainer), store, Provider);
    // Navigation.registerComponent(screenNames.visitMapScreen, () => LockOnInactivity(VisitMapScreenController), store, Provider);
    Navigation.registerComponent(screenNames.visitDayViewScreen, () => LockOnInactivity(VisitDayViewScreen), store, Provider);
    Navigation.registerComponent(screenNames.addVisitScreen, () => LockOnInactivity(ScreenWithCalendarComponent(AddVisitsScreenContainer)));
    Navigation.registerComponent(screenNames.addStop, () => LockOnInactivity(AddStopScreenContainer));
    Navigation.registerComponent(screenNames.stopList, () => LockOnInactivity(StopListScreenContainer), store, Provider);
    Navigation.registerComponent(screenNames.addOrRescheduleVisitsLightBox, () => LockOnInactivity(AddOrRescheduleVisitsLightBox));
    Navigation.registerComponent(screenNames.imageLightBox, () => LockOnInactivity(ImageLightBox));
    Navigation.registerComponent(screenNames.onlinePatientLightBox, () => LockOnInactivity(OnlinePatientLightBox));
    Navigation.registerComponent(screenNames.addTaskComponent, () => LockOnInactivity(AddTaskComponent));
    Navigation.registerComponent(screenNames.milesLogScreen, () => LockOnInactivity(MilesLogScreenContainer));
};

export {RegisterScreens};
