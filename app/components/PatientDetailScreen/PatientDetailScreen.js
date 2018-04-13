import React from 'react';
import { View } from 'react-native';
// import { Button } from 'react-native-elements';
import { PatientDetailCard } from '../PatientDetailCard';

const PatientDetailScreen = (props) => {
    const { patientDetail } = props;
    return (
        <View>
            <PatientDetailCard
                data={patientDetail}
            />
        </View>
    );
};

export { PatientDetailScreen };