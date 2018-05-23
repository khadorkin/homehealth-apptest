import React, {Component} from 'react';
import {View, PanResponder} from 'react-native';
import {screenNames, setInActivityTimer} from '../../utils/constants';

const LockOnInActivity = (ScreenComponent) => (
		class CompositeClass extends Component {
			static navigatorButtons = ScreenComponent.navigatorButtons;
			constructor(props) {
				super(props);
				this.state = {
					//show: false
				};
				// this.onNavigatorEvent = this.onNavigatorEvent.bind(this);
				// this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
				this.resetTimer = this.resetTimer.bind(this);
				this.openLockScreenModal = this.openLockScreenModal.bind(this);
				this._panResponder = {};
				this.timer = 0;
			}

			componentWillMount() {
				this._panResponder = PanResponder.create({
					onStartShouldSetPanResponderCapture: () => { this.resetTimer(); return false; },
					onPanResponderTerminationRequest: () => true,
					onShouldBlockNativeResponder: () => false,
				});
				setInActivityTimer(this.openLockScreenModal);
			}

			openLockScreenModal() {
				this.props.navigator.showModal({
					screen: screenNames.passcodeVerificationScreen,
					backButtonHidden: true,
					passProps: {
						inactivity: true,
						onSuccessCallback: this.resetTimer
					},
					overrideBackPress: true,
					animationType: 'none'
				});
			}

			resetTimer() {
				setInActivityTimer(this.openLockScreenModal);
			}

			render() {
				return (
					<View style={{flex: 1}} {...this._panResponder.panHandlers}>
						<ScreenComponent
							{...this.props}
							onNavigatorEvent={this.onNavigatorEvent}
							resetTimer={this.resetTimer}
						/>
					</View>
				);
			}
		}
	);

export default LockOnInActivity;
