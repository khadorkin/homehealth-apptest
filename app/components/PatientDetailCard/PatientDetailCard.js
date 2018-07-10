import React from 'react';
import firebase from 'react-native-firebase';
import {View, ScrollView, Image, Linking, Platform} from 'react-native';
import {Text, Button, Divider} from 'react-native-elements';
import moment from 'moment';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';
import styles from './styles';
import {styles as componentStyles} from '../common/styles';

import {PatientDetailMapComponent} from './PatientDetailMapComponent';
import {Diagnosis} from '../common/Diagnosis';
import {PrimaryColor, eventNames, parameterValues} from '../../utils/constants';
import {Images} from '../../Images';
import StyledText from '../common/StyledText';
import ViewMore from '../common/ViewMore';

const renderViewMore = (e, onPressAddNotes) => {
    return (
        <Text style={{...styles.fontStyle, fontSize: 14, color: PrimaryColor}} onPress={onPressAddNotes}>Show Notes</Text>
    );
};

const getVisitsView = function (visitSectionData) {
    if (visitSectionData && visitSectionData.length > 0) {
        if (visitSectionData.length > 1) {
            return (
                <View style={componentStyles.listContainer}>
                    <StyledText style={{...styles.fontStyle, ...styles.visitStyle, opacity: 0.7}}>
                        {visitSectionData[0]}
                    </StyledText>
                    <StyledText style={{...styles.fontStyle, ...styles.visitStyle}}>
                        {visitSectionData[1]}
                    </StyledText>
                </View>
            );
        } else {
            return (
                <View style={componentStyles.listContainer}>
                    <StyledText style={{...styles.fontStyle, ...styles.visitStyle, width: '70%'}}>
                        {visitSectionData[0]}
                    </StyledText>
                </View>
            );
        }
    }
    return (
        <View style={{height: 16}} />
    );
};

const getEmergencyContactText = (contactName, contactRelation) => {
    if (contactRelation === null || contactRelation === '') return contactName;
    if (contactName === null || contactName === '') return contactRelation;
    return contactName + ' (' + contactRelation + ')';
};

const PatientDetailCard = (props) => {
    const {patientDetail, nextVisit, lastVisit, onPressAddVisit, onPressAddNotes, showCallout, setMarkerRef} = props;
    //Handle name with navigator props
    const {
        primaryContact,
        emergencyContactNumber,
        emergencyContactName,
        emergencyContactRelation,
        dateOfBirth,
        diagnosis,
        notes,
        address
    } = patientDetail;

    const emergencyContactText = getEmergencyContactText (emergencyContactName, emergencyContactRelation)
    let coordinates = null;
    if (address) {
        if (address.coordinates &&
            address.coordinates.latitude !== null &&
            address.coordinates.longitude !== null) {
            coordinates = address.coordinates;
        }
    }

    let lastVisitTimestamp = null;
    let nextVisitTimestamp = null;
    const visitSectionData = [];
    if (lastVisit) {
        lastVisitTimestamp = moment.utc(lastVisit.midnightEpochOfVisit);
        visitSectionData.push(`Last visited by You On "${lastVisitTimestamp.format('YYYY-MMM-DD')}"`);
    }
    if (nextVisit) {
        nextVisitTimestamp = moment.utc(nextVisit.midnightEpochOfVisit);
        visitSectionData.push(`Next visit scheduled On "${nextVisitTimestamp.format('YYYY-MMM-DD')}"`);
    }
    if (visitSectionData.length === 0) {
        visitSectionData.push('No visits scheduled for You.');
    }

    return (
        <View style={styles.parentContainerStyle}>
            {coordinates &&
            <PatientDetailMapComponent
                patientCoordinates={coordinates}
                patientAddress={address.formattedAddress}
                onRegionChangeComplete={showCallout}
                setMarkerRef={setMarkerRef}
            />
            }

            <ScrollView>
                <View style={styles.containerStyle}>
                    <Image source={Images.elliotLugo} />
                    <View style={{marginLeft: 14}}>
                        <StyledText style={{...styles.headerStyle, ...styles.fontStyle}}>
                            Primary Contact
                        </StyledText>
                        <StyledText style={{...styles.fontStyle, fontSize: 12, color: '#999999'}}>
                            {primaryContact}
                        </StyledText>
                    </View>
                    <Button
                        title="Call"
                        textStyle={{
                            ...styles.fontStyle,
                            color: PrimaryColor
                        }}
                        buttonStyle={styles.callButtonStyle}
                        containerViewStyle={{
                            width: '20%',
                            position: 'absolute',
                            right: 0
                        }}
                        onPress={() => {
                            if (primaryContact) {
                                firebase.analytics().logEvent(eventNames.PATIENT_ACTIONS, {
                                    'type': parameterValues.CALL
                                });
                                if (Platform.OS === 'android') {
                                    Linking.openURL(`tel: ${primaryContact}`);
                                } else {
                                    RNImmediatePhoneCall.immediatePhoneCall(primaryContact);
                                }
                            }
                        }}
                    />
                </View>

                <Divider style={styles.dividerStyle} />

                { dateOfBirth &&
                <View style={styles.containerStyle}>
                    <Image source={Images.birthday} />
                    <View style={{marginLeft: 14}}>
                        <StyledText style={{...styles.fontStyle, ...styles.headerStyle}}>
                            Birthday
                        </StyledText>
                        <StyledText style={{...styles.fontStyle, fontSize: 13, color: '#999999'}}>
                            {moment(dateOfBirth).format('DD MMM YYYY')}
                        </StyledText>
                    </View>
                </View>
                }

                {dateOfBirth &&
                    <Divider style={styles.dividerStyle} />
                }

                <View style={[styles.containerStyle, {opacity: 0.3}]}>
                    <Image source={Images.diagnosis} />
                    <View style={{marginLeft: 14}}>
                        <StyledText style={{...styles.fontStyle, ...styles.headerStyle}}>
                            Diagnosis
                        </StyledText>
                        <Diagnosis diagnosis />
                    </View>
                </View>

                <Divider style={styles.dividerStyle} />

                {emergencyContactNumber !== '' && emergencyContactNumber &&
                <View style={styles.containerStyle}>
                    <Image source={Images.emergencyIcon} />
                    <View style={{marginLeft: 14}}>
                        <StyledText style={{...styles.fontStyle, ...styles.headerStyle}}>
                            Emergency Contact Details
                        </StyledText>
                        <StyledText style={{...styles.fontStyle, fontSize: 13, color: '#999999'}}>
                            {emergencyContactNumber}
                        </StyledText>
                        {emergencyContactText && emergencyContactText.length > 0 &&
                        <StyledText style={{...styles.fontStyle, fontSize: 13, color: '#999999'}}>
                            {emergencyContactText}
                        </StyledText>
                        }
                    </View>
                    {/*<Button*/}
                        {/*title="Call"*/}
                        {/*textStyle={{*/}
                            {/*...styles.fontStyle,*/}
                            {/*color: PrimaryColor*/}
                        {/*}}*/}
                        {/*buttonStyle={styles.callButtonStyle}*/}
                        {/*containerViewStyle={{*/}
                            {/*width: '20%',*/}
                            {/*position: 'absolute',*/}
                            {/*right: 0*/}
                        {/*}}*/}
                        {/*onPress={() => {*/}
                            {/*if (emergencyContactNumber) {*/}
                                {/*if (Platform.OS === 'android') {*/}
                                    {/*Linking.openURL(`tel: ${emergencyContactNumber}`);*/}
                                {/*} else {*/}
                                    {/*RNImmediatePhoneCall.immediatePhoneCall(emergencyContactNumber);*/}
                                {/*}*/}
                            {/*}*/}
                        {/*}}*/}
                    {/*/>*/}
                </View>
                }

                {emergencyContactNumber !== '' && emergencyContactNumber &&
                <Divider style={styles.dividerStyle} />
                }
                
                <View style={styles.containerStyle}>
                    <Image source={Images.visits} />
                    <View style={{marginLeft: 14}}>
                        <StyledText style={{...styles.fontStyle, ...styles.headerStyle}}>
                            Visits
                        </StyledText>
                        {getVisitsView(visitSectionData)}
                    </View>
                </View>

                <Divider style={styles.dividerStyle} />

                <View style={styles.containerStyle}>
                    <Image
                        source={Images.notes}
                    />
                    <View style={{marginLeft: 14, marginRight: 16}}>
                        <StyledText style={{...styles.fontStyle, ...styles.headerStyle}}>
                            Notes
                        </StyledText>
                        <ViewMore
                            textStyle={{...styles.fontStyle, ...styles.noteStyle}}
                            numberOfLines={2}
                            renderViewMore={(e) => renderViewMore(e, onPressAddNotes)}
                        >
                            {notes || 'You have not added any note for this patient.'}
                        </ViewMore>
                    </View>
                </View>

                <Divider style={styles.dividerStyle} />
            </ScrollView>

            <Divider style={styles.dividerStyle} />

            <Button
                containerViewStyle={{marginLeft: 0, marginRight: 0}}
                buttonStyle={styles.buttonStyle}
                title='Add Visit'
                onPress={onPressAddVisit}
                textStyle={{
                    ...styles.fontStyle,
                    color: 'white',
                    fontSize: 16
                }}
            />
        </View>
    );
};

export {PatientDetailCard};
