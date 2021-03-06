import React, {Component} from 'react';
import RNSecureKeyStore from 'react-native-secure-key-store';
import firebase from 'react-native-firebase';
import VirtualKeyboard from 'react-native-virtual-keyboard';
import {StyleSheet, Text, View, Alert, AsyncStorage, Dimensions} from 'react-native';
import {screenNames, eventNames, parameterValues, PrimaryColor, PrimaryFontFamily} from '../utils/constants';

const passCodeScreenStates = {
    FIRST_ENTRY_SCREEN: 0,
    CONFIRM_SCREEN: 1
};

class SetPassCodeScreen extends Component {
    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            code: '',
            enteredPassCode: null,
            confirmationFailed: false
        };
        this.handlePassCodeInput = this.handlePassCodeInput.bind(this);
        this.setKey = this.setKey.bind(this);
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
    }

    onNavigatorEvent(event) {
        // STOP GAP solution. Will be removed when redux is used
        if (event.id === 'didAppear') {
            firebase.analytics().setCurrentScreen(screenNames.setPassCode, screenNames.setPassCode);
        }
    }

    setKey() {
        console.log('Trying to set the key ...');
        const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
        let randomString = '';
        const key = new Int8Array(64);
        for (let i = 0; i < key.length; i++) {
            const rnum = Math.floor(Math.random() * chars.length);
            randomString += chars.substring(rnum, rnum + 1);
        }

        RNSecureKeyStore.set('flokey', randomString)
            .then(async (res) => {
                console.log(res);
                this.props.navigator.resetTo({
                    screen: screenNames.settingUpScreen,
                    backButtonHidden: true,
                    passProps: {
                        startKey: randomString
                    },
                    navigatorStyle: {
                        navBarHidden: true,
                    },
                });
            }, (err) => {
                console.log(err);
                Alert.alert('Error', 'Unable to start the app');
            });
    }

    getScreenState = () => (
        this.state.enteredPassCode ? passCodeScreenStates.CONFIRM_SCREEN : passCodeScreenStates.FIRST_ENTRY_SCREEN
    )

    resetVirtualKeyboardTextState = () => {
        if (this.virtualKeyBoard) {
            this.virtualKeyBoard.resetText();
        }
    }

// Secure the entered passcode in the keystore
    handlePassCodeInput(passcode) {
        if (this.getScreenState() === passCodeScreenStates.FIRST_ENTRY_SCREEN) {
            this.setState({
                enteredPassCode: passcode,
                confirmationFailed: false
            });
            this.resetVirtualKeyboardTextState();
        } else if (this.getScreenState() === passCodeScreenStates.CONFIRM_SCREEN) {
            if (passcode === this.state.enteredPassCode) {
                this.savePassCode(passcode);
            } else {
                this.setState({
                    enteredPassCode: null,
                    confirmationFailed: true
                });
                this.resetVirtualKeyboardTextState();
            }
        }
    }


    onChangeCode(code) {
        this.setState({code});
        if (code.length === 4) {
            setTimeout(() => this.handlePassCodeInput(code));
        }
    }

    savePassCode = (passcode) => {
        // Save the passcode to keystore
        RNSecureKeyStore.set('passCode', passcode)
        .then((res) => {
            // Open VerifyPasscode Screen next time
            AsyncStorage.setItem('isFirstVisit', 'false');
            firebase.analytics().logEvent(eventNames.PASSCODE, {
                status: parameterValues.SUCCESS
            });

            this.setKey();
        }, (err) => {
            console.log(err);
            firebase.analytics().logEvent(eventNames.PASSCODE, {
                status: parameterValues.FAILURE
            });
            Alert.alert('Error', 'Unable to update passcode');
            return;
        });
    }

    // generateCodeDisplayArea() {
    //     const dotArray = [];
    //     for (let i = 0; i < 4; i++) {
    //         if (this.state.code.length > i) { dotArray.push(<Text style={{color: 'white', fontSize: 60, fontWeight: '500', marginHorizontal: 10}}>*</Text>); } else dotArray.push(<Text style={{color: 'rgba(255,255,255,0.3)', fontSize: 60, fontWeight: '500', marginHorizontal: 10}}>*</Text>);
    //     }
    //     return (
    //         <View
    //             style={{flexDirection: 'row'}}
    //         >
    //             <Text style={{color: this.state.code.length > 0 ? 'white' : 'rgba(255,255,255,0.3)', fontSize: 60, fontWeight: '500', marginHorizontal: 10}}>*</Text>
    //             <Text style={{color: this.state.code.length > 1 ? 'white' : 'rgba(255,255,255,0.3)', fontSize: 60, fontWeight: '500', marginHorizontal: 10}}>*</Text>
    //             <Text style={{color: this.state.code.length > 2 ? 'white' : 'rgba(255,255,255,0.3)', fontSize: 60, fontWeight: '500', marginHorizontal: 10}}>*</Text>
    //             <Text style={{color: this.state.code.length > 3 ? 'white' : 'rgba(255,255,255,0.3)', fontSize: 60, fontWeight: '500', marginHorizontal: 10}}>*</Text>
    //         </View>
    //     );
    // }

    render() {
        const {width, height} = Dimensions.get('window');
        const header = this.getScreenState() === passCodeScreenStates.FIRST_ENTRY_SCREEN ? 'Set a Passcode' : 'Confirm passcode';
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    backgroundColor: PrimaryColor
                }}
            >
                {/*<KeyboardAwareScrollView>*/}
                    <View>
                        <Text style={styles.headerSectionStyle}>
                            Let's secure the app
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.topSectionStyle}>
                            {header}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.middleSectionStyle}>
                            Note: Once set, the passcode cannot be changed
                        </Text>
                        {
                            this.state.confirmationFailed &&
                            <Text style={[styles.middleSectionStyle, {color: 'red'}]}>
                                * Passcodes did not match. Please try again.
                            </Text>
                        }
                    </View>
                    {/*<View>*/}
                        {/*<Image*/}
                            {/*style={styles.stretch}*/}
                            {/*source={Images.verificationCode}*/}
                        {/*/>*/}
                    {/*</View>*/}
                    {/*{this.generateCodeDisplayArea()}*/}

                    <View
                        style={{flexDirection: 'row'}}
                    >
                        <Text style={{color: this.state.code.length > 0 ? 'white' : 'rgba(255,255,255,0.3)', fontSize: 60, fontWeight: '500', marginHorizontal: 10}}>*</Text>
                        <Text style={{color: this.state.code.length > 1 ? 'white' : 'rgba(255,255,255,0.3)', fontSize: 60, fontWeight: '500', marginHorizontal: 10}}>*</Text>
                        <Text style={{color: this.state.code.length > 2 ? 'white' : 'rgba(255,255,255,0.3)', fontSize: 60, fontWeight: '500', marginHorizontal: 10}}>*</Text>
                        <Text style={{color: this.state.code.length > 3 ? 'white' : 'rgba(255,255,255,0.3)', fontSize: 60, fontWeight: '500', marginHorizontal: 10}}>*</Text>
                    </View>
                    <View style={{width, height: height * 0.5}}>
                        <VirtualKeyboard
                            ref={e => { this.virtualKeyBoard = e; }}
                            color='white'
                            pressMode='string'
                            onPress={(val) => this.onChangeCode(val)}
                            style={{
                                container: {
                                    flex: 1,
                                    flexDirection: 'column',
                                    // marginLeft: 0,
                                    // marginRight: 0,
                                },
                                row: {
                                    flex: 1
                                },
                                number: {
                                    fontFamily: PrimaryFontFamily,
                                    fontSize: 35,
                                }
                            }}
                        />
                    </View>
                {/*</KeyboardAwareScrollView>*/}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    headerSectionStyle: {
        color: 'white',
        fontFamily: PrimaryFontFamily,
        fontSize: 24,
        fontWeight: '500',
        textAlign: 'center',
        margin: 10,
        marginTop: 50,
    },
    topSectionStyle: {
        color: 'white',
        fontFamily: PrimaryFontFamily,
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
        marginBottom: 5,
    },
    middleSectionStyle: {
        color: 'white',
        fontFamily: PrimaryFontFamily,
        fontSize: 12,
        textAlign: 'center',
        margin: 10,
        marginBottom: 10,
        marginTop: 10,
    },
    stretch: {
        alignSelf: 'center',
        width: 150,
        height: 150,
        marginBottom: 10,
    }
});

export {SetPassCodeScreen};

