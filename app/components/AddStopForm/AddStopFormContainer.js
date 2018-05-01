import React, {Component} from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-elements';
import t from 'tcomb-form-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {floDB, Place} from '../../utils/data/schema';
import styles from './styles';
import {Options} from './AddStopFormModel';

const Form = t.form.Form;

class AddStopFormContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: {
                address: null,
                remember: true,
                stopName: null
            },
            modelType: this.getType(),
        };
        this.onChangeAddressText = this.onChangeAddressText.bind(this);
        this.clearForm = this.clearForm.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.setForm = this.setForm.bind(this);
        this.onChange = this.onChange.bind(this);
        this.getType = this.getType.bind(this);
        this.onAddressSelect = this.onAddressSelect.bind(this);
        this.setAddressForm = this.setAddressForm.bind(this);

        this.options = new Options();
        this.options.OnPress = this.onAddressSelect;
        this.options.OnChangeAddressText = this.onChangeAddressText;
        this.options.RefName = this.setAddressForm;
    }

    onChange(value, path) {
        console.log('value:', value, 'path:', path);
        console.log('value.address: ', value.address);

        // Change type and options if address changed
        if (path.indexOf('address') > -1) {
            const type = this.getType(value.address);
            //const options = this.getOptions(value.address);
            this.setState({
                modelType: type
            });
        }

        this.setState({
            value
        });
    }

    onChangeAddressText(value) {
        console.log('Address Text Changed:', value);
        const val = Object.assign({}, this.state.value, {address: value});
        const type = this.getType(value);
        this.setState({
            value: val,
            modelType: type
        });
    }

    onAddressSelect(data, details) {
        // Todo: Build streetAddress from address components
        const streetAddress = details.formatted_address;
        // const geometry = details.geometry;
        //
        // if (geometry) {
        //     const location = geometry.location;
        //     if (location) {
        //         lat = location.lat;
        //         long = location.lng;
        //     }
        // }

        // Todo: Save Lat long and other parts of the address
        const value = Object.assign({}, this.state.value, {address: streetAddress});
        this.setState({value});
    }

    setForm(element) {
        this.addStopForm = element;
        return this.addStopForm;
    }

    setAddressForm(element) {
        this.addressForm = element;
        return this.addressForm;
    }

    getType(address) {
        if (address && address.length > 0) {
            return t.struct({
                address: t.String,
                remember: t.Boolean,
                stopName: t.String
            });
        } else {
            return t.struct({
                address: t.String
            });
        }
    }

    clearForm() {
        this.setState({
            value: {
                address: null,
                remember: null,
                stopName: null
            },
            modelType: this.getType()
        });
        this.addressForm.setAddressText('');
    }

    handleSubmit(e, onSubmit) {
        const value = this.addStopForm.getValue();

        if (value && this.state.value.remember) {
            const placeId = Math.random().toString();
            const addressId = Math.random().toString();

            try {
                floDB.write(() => {
                    const stop = floDB.create(Place.schema.name, {
                        placeID: placeId,
                        name: this.state.value.stopName
                    });

                    stop.address = {
                        addressID: addressId,
                        streetAddress: this.state.value.address
                    };
                });
                console.log('Save to DB successful');
            } catch (err) {
                console.log('Error on Stop addition: ', err);
                // Todo Don't fail silently, raise and alarm
            }
        }
        // const places = floDB.objects(Place.schema.name)
        // console.log('All places in DB:', places);

        this.clearForm();
        onSubmit();
    }

    render() {
        const {onSubmit} = this.props;
        return (
            <View style={styles.containerStyle}>
                <KeyboardAwareScrollView
                    style={styles.formScrollViewStyle}
                    keyboardShouldPersistTaps='handled'
                >
                    <Form
                        ref={this.setForm}
                        type={this.state.modelType}
                        value={this.state.value}
                        options={this.options.Options}
                        onChange={this.onChange}
                    />
                    <Button
                        disabled={!(this.state.value.address)}
                        buttonStyle={styles.buttonStyle}
                        title='Done'
                        onPress={(e) => this.handleSubmit(e, onSubmit)}
                    />
                </KeyboardAwareScrollView>
            </View>
        );
    }
}

export {AddStopFormContainer};