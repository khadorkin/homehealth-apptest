import React, {Component} from 'react';
import moment from 'moment';
import {View, Image, ActivityIndicator, TouchableOpacity} from 'react-native';
import ImageOverlay from 'react-native-image-overlay';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from 'react-native-firebase';
import StyledText from '../../common/StyledText';
import {Images} from '../../../Images';
import {eventNames, noteMessageType, PrimaryColor, screenNames} from '../../../utils/constants';
import {ImageService} from '../../../data_services/ImageService';

class S3Image extends Component {
    constructor(props) {
        super(props);

        this.imageServiceInstance = ImageService.getInstance();
        this.imageUpdateHandler = this.imageUpdateHandler.bind(this);

        this.state = {
            localDataExists: ImageService.getInstance().doesLocalImageDataExistForBucketAndKey(this.props.imageS3Object.Bucket, this.props.imageS3Object.Key),
            loading: false,
            blur: false
        };
    }

    componentDidMount() {
        this.timeout = setTimeout(() => {
            if (this.propsHaveImage()) {
                this.imageListenerDestroyer = this.imageServiceInstance.getImageListener(
                    this.imageServiceInstance.getIDByBucketAndKey(this.props.imageS3Object.Bucket, this.props.imageS3Object.Key),
                    this.imageUpdateHandler
                );
            }
        }, 500);
    }

    componentWillUnmount() {
        if (this.timeout) clearTimeout(this.timeout);
        if (this.imageListenerDestroyer) {
            this.imageListenerDestroyer();
        }
    }

    propsHaveImage() {
        return this.props.imageS3Object && this.props.imageS3Object.Key && this.props.imageS3Object.Bucket;
    }

    imageUpdateHandler() {
        this.setState({
            localDataExists: this.imageServiceInstance.doesLocalImageDataExistForBucketAndKey(this.props.imageS3Object.Bucket, this.props.imageS3Object.Key)
        });
    }

    render() {
        let onPress;
        if (this.state.localDataExists) {
            onPress = () => {
                firebase.analytics().logEvent(eventNames.FULLSCREEN_IMAGE, {
                    VALUE: 1
                });
                this.props.navigator.showLightBox({
                    screen: screenNames.imageLightBox,
                    style: {
                        backgroundBlur: 'dark',
                        backgroundColor: '#00000070',
                        tapBackgroundToDismiss: true
                    },
                    passProps: {
                        imageS3Object: this.props.imageS3Object,
                    },
                });
            };
        } else {
            onPress = () => {
                if (!this.state.loading) {
                    firebase.analytics().logEvent(eventNames.DOWNLOAD_MISSING_IMAGE, {
                        VALUE: 1
                    });
                    if (this.props.imageType === 'base64') {
                        ImageService.getInstance().fetchAndSaveImageForBucketAndKey(this.props.imageS3Object.Bucket, this.props.imageS3Object.Key)
                            .then(() => {
                                this.setState({loading: false, localDataExists: true});
                            }).catch(error => {
                            console.log('error in loading full sized image', error);
                            this.setState({loading: false});
                        });
                        this.setState({loading: true});
                    }
                }
            };
        }

        let imageOverlay;
        if (!this.state.localDataExists) {
            if (!this.state.loading) {
                imageOverlay = (
                    <Icon
                        name="md-cloud-download"
                        style={{
                            fontSize: 50,
                            height: 50,
                            color: 'rgba(255,255,255,0.4)',
                        }}
                    />
                );
            } else {
                imageOverlay = <ActivityIndicator size="large" color="#ffffff" style={{marginVertical: 20}} />;
            }
        }

        return (
            <View
                style={{
                    borderRadius: 15,
                    height: 130,
                    width: 130,
                }}
            >
                <TouchableOpacity
                    style={{
                        borderRadius: 15,
                        height: 130,
                        width: 130,
                        flex: 1,
                    }}
                    onPress={onPress}
                >
                    <ImageOverlay
                        blurRadius={this.state.localDataExists ? undefined : 6}
                        containerStyle={{
                            borderRadius: 15,
                            flex: 1,
                            width: undefined,
                            height: undefined,
                            resizeMode: 'cover',
                        }}
                        source={{uri: this.props.thumbnailData}}
                    >
                        {imageOverlay}
                    </ImageOverlay>
                </TouchableOpacity>
            </View>
        );
    }
}

function noteBody(note, navigator) {
    const getTextElement = text => (
        <StyledText
            style={{
                fontSize: 11,
                color: '#202020'
            }}
        >
            {text}
        </StyledText>
    );

    if (note.messageType === noteMessageType.NEW_NOTE) {
        return (
            <StyledText
                style={{
                    fontSize: 11,
                    color: '#202020'
                }}
            >
                {getTextElement(note.data)}
            </StyledText>
        );
    } else if (note.messageType === noteMessageType.RICH_NEW_NOTE) {
        const noteDataJson = JSON.parse(note.data);
        let image;
        if (noteDataJson.imageS3Object) {
            image = (<S3Image
                imageType={noteDataJson.imageType}
                imageS3Object={noteDataJson.imageS3Object}
                thumbnailData={noteDataJson.thumbnailData}
                navigator={navigator}
            />);
        }

        return (
            <View>
                {image}
                {getTextElement(noteDataJson.text)}
            </View>
        );
    }
}

export function NoteBubble(note, navigator) {
    return (
        <View
            style={{
                flex: 1,
                opacity: note.synced === 'true' ? 1 : 0.6,
                flexDirection: 'row',
                marginVertical: 17.5,
            }}
            behavior='padding'
        >
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center'
                }}
            >
                <Image source={Images.notesIcon} />
            </View>
            <View
                style={{
                    flex: 5,
                    flexDirection: 'column'
                }}
            >
                <View
                    style={{
                        width: '90%',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: 10,
                    }}
                >
                    <StyledText
                        style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: PrimaryColor
                        }}
                    >
                        {`${note.user.lastName}, ${note.user.role}`}
                    </StyledText>
                    <StyledText
                        style={{
                            fontSize: 11,
                            color: '#b1b1b1'
                        }}
                    >
                        {moment(note.timetoken).format('hh:mm a')}
                    </StyledText>
                </View>
                <View>
                    {noteBody(note, navigator)}
                </View>
            </View>
        </View>
    );
}
