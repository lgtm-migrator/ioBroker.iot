import React from 'react';
import { withStyles } from '@mui/styles';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import GenericApp from '@iobroker/adapter-react-v5/GenericApp';
import Loader from '@iobroker/adapter-react-v5/Components/Loader'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import I18n from '@iobroker/adapter-react-v5/i18n';
import TabOptions from './Tabs/Options';
import TabExtended from './Tabs/Extended';
import TabServices from './Tabs/Services';
import TabEnums from './Tabs/Enums';
import TabAlexaSmartNames from './Tabs/AlexaSmartNames';
import TabAlisaSmartNames from './Tabs/AlisaSmartNames';
import TabGoogleSmartNames from './Tabs/GoogleSmartNames';

const styles = theme => ({
    root: {},
    tabContent: {
        padding: 10,
        height: 'calc(100% - 64px - 48px - 20px)',
        overflow: 'auto',
    },
    tabContentIFrame: {
        padding: 10,
        height: 'calc(100% - 64px - 48px - 20px - 38px)',
        overflow: 'auto',
    },
    selected: {
        color: theme.palette.mode === 'dark' ? undefined : '#FFF !important',
    },
    indicator: {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.main : '#FFF',
    }
});

class App extends GenericApp {
    constructor(props) {
        const extendedProps = {...props};
        extendedProps.encryptedFields = ['pass'];
        extendedProps.translations = {
            en: require('./i18n/en'),
            de: require('./i18n/de'),
            ru: require('./i18n/ru'),
            pt: require('./i18n/pt'),
            nl: require('./i18n/nl'),
            fr: require('./i18n/fr'),
            it: require('./i18n/it'),
            es: require('./i18n/es'),
            pl: require('./i18n/pl'),
            uk: require('./i18n/uk'),
            'zh-cn': require('./i18n/zh-cn'),
        };

        extendedProps.sentryDSN = window.sentryDSN;

        super(props, extendedProps);
    }

    onConnectionReady() {
        this.socket.getState(`${this.adapterName}.${this.instance}.info.ackTempPassword`)
            .then(state => {
                if (!state || !state.val) {
                    this.setState({showAckTempPasswordDialog: true});
                }
            });
    }

    getSelectedTab() {
        const tab = this.state.selectedTab;
        if (!tab || tab === 'options') {
            return 0;
        } else
        if (tab === 'enums') {
            return 1;
        } else
        if (tab === 'alexa') {
            return 2;
        } else
        if (tab === 'google') {
            const offset = (this.state.native.amazonAlexa ? 1 : 0);
            return 2 + offset;
        } else
        if (tab === 'alisa') {
            const offset = (this.state.native.amazonAlexa ? 1 : 0) + (this.state.native.googleHome ? 1 : 0);
            return 2 + offset;
        } else
        if (tab === 'extended') {
            const offset = (this.state.native.amazonAlexa ? 1 : 0) + (this.state.native.googleHome ? 1 : 0) + (this.state.native.yandexAlisa ? 1 : 0);
            return 2 + offset;
        } else
        if (tab === 'services') {
            const offset = (this.state.native.amazonAlexa ? 1 : 0) + (this.state.native.googleHome ? 1 : 0) + (this.state.native.yandexAlisa ? 1 : 0);
            return 3 + offset;
        }
    }

    renderAckTempPasswordDialog() {
        if (!this.state.showAckTempPasswordDialog) {
            return null;
        } else {
            return <Dialog
                open={true}
                onClose={() => this.setState({showAckTempPasswordDialog: false}, () => setTimeout(() => this.setState({showAckTempPasswordDialog: true}), 1000))}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{I18n.t('Information: The skill linking process was changed!')}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {I18n.t('The linking process has been changed for a few months.')}
                        {I18n.t('Now there is no temporary password that will be sent by email.')}<br/><br/>
                        <b>{I18n.t('The password is equal with ioBroker.pro and with password that was entered here in the settings!')}</b>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="grey"
                        variant="contained"
                        onClick={() => this.setState({showAckTempPasswordDialog: false}, () => setTimeout(() => this.setState({showAckTempPasswordDialog: true}), 1000))} autoFocus>
                        {I18n.t('Not understood')}
                    </Button>
                    <Button variant="contained" onClick={() =>
                        this.socket.setState(`${this.adapterName}.${this.instance}.info.ackTempPassword`, {val: true, ack: true})
                            .then(() =>
                                this.setState({showAckTempPasswordDialog: false}))
                    } color="primary" autoFocus>
                        {I18n.t('Roger that')}
                    </Button>
                </DialogActions>
            </Dialog>;
        }
    }

    render() {
        if (!this.state.loaded) {
            return <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <Loader theme={this.state.themeType} />
                </ThemeProvider>
            </StyledEngineProvider>;
        }

        return <StyledEngineProvider injectFirst>
            <ThemeProvider theme={this.state.theme}>
                <div className="App" style={{background: this.state.theme.palette.background.default, color: this.state.theme.palette.text.primary}}>
                    <AppBar position="static">
                        <Tabs
                            value={this.getSelectedTab()}
                            onChange={(e, index) => this.selectTab(e.target.dataset.name, index)}
                            scrollButtons="auto"
                            classes={{ indicator: this.props.classes.indicator }}
                        >
                            <Tab classes={{ selected: this.props.classes.selected }} label={I18n.t('Options')} data-name="options" />
                            <Tab classes={{ selected: this.props.classes.selected }} label={I18n.t('Smart enums')} data-name="enums" />
                            {this.state.native.amazonAlexa && <Tab classes={{ selected: this.props.classes.selected }} selected={this.state.selectedTab === 'alexa'} label={I18n.t('Alexa devices')} data-name="alexa" />}
                            {this.state.native.googleHome && <Tab classes={{ selected: this.props.classes.selected }} selected={this.state.selectedTab === 'google'} label={I18n.t('Google devices')} data-name="google" />}
                            {this.state.native.yandexAlisa && <Tab classes={{ selected: this.props.classes.selected }} selected={this.state.selectedTab === 'alisa'} label={I18n.t('Alisa devices')} data-name="alisa" />}
                            <Tab classes={{ selected: this.props.classes.selected }} label={I18n.t('Extended options')} data-name="extended" />
                            <Tab classes={{ selected: this.props.classes.selected }} label={I18n.t('Services and IFTTT')} data-name="services" />
                        </Tabs>
                    </AppBar>

                    <div className={this.isIFrame ? this.props.classes.tabContentIFrame : this.props.classes.tabContent}>
                        {(this.state.selectedTab === 'options' || !this.state.selectedTab) && <TabOptions
                            key="options"
                            common={this.common}
                            socket={this.socket}
                            native={this.state.native}
                            onError={text => this.setState({errorText: (text || text === 0) && typeof text !== 'string' ? text.toString() : text})}
                            onLoad={native => this.onLoadConfig(native)}
                            instance={this.instance}
                            adapterName={this.adapterName}
                            changed={this.state.changed}
                            onChange={(attr, value, cb) => this.updateNativeValue(attr, value, cb)}
                        />}
                        {this.state.selectedTab === 'enums' && <TabEnums
                            key="enums"
                            common={this.common}
                            socket={this.socket}
                            native={this.state.native}
                            onError={text => this.setState({errorText: (text || text === 0) && typeof text !== 'string' ? text.toString() : text})}
                            instance={this.instance}
                            adapterName={this.adapterName}
                        />}
                        {this.state.selectedTab === 'alexa' && <TabAlexaSmartNames
                            key="alexa"
                            themeType={this.state.themeType}
                            common={this.common}
                            socket={this.socket}
                            native={this.state.native}
                            onError={text => this.setState({errorText: (text || text === 0) && typeof text !== 'string' ? text.toString() : text})}
                            adapterName={this.adapterName}
                            instance={this.instance}
                        />}
                            {this.state.selectedTab === 'google' && <TabGoogleSmartNames
                            key="google"
                            themeType={this.state.themeType}
                            common={this.common}
                            socket={this.socket}
                            native={this.state.native}
                            onError={text => this.setState({errorText: (text || text === 0) && typeof text !== 'string' ? text.toString() : text})}
                            adapterName={this.adapterName}
                            instance={this.instance}
                        />}
                        {this.state.selectedTab === 'alisa' && <TabAlisaSmartNames
                            key="alisa"
                            themeType={this.state.themeType}
                            common={this.common}
                            socket={this.socket}
                            native={this.state.native}
                            onError={text => this.setState({errorText: (text || text === 0) && typeof text !== 'string' ? text.toString() : text})}
                            adapterName={this.adapterName}
                            instance={this.instance}
                        />}
                        {this.state.selectedTab === 'extended' && <TabExtended
                            key="extended"
                            common={this.common}
                            socket={this.socket}
                            native={this.state.native}
                            onError={text => this.setState({errorText: (text || text === 0) && typeof text !== 'string' ? text.toString() : text})}
                            instance={this.instance}
                            adapterName={this.adapterName}
                            onChange={(attr, value) => this.updateNativeValue(attr, value)}
                        />}
                        {this.state.selectedTab === 'services' && <TabServices
                            key="services"
                            common={this.common}
                            socket={this.socket}
                            native={this.state.native}
                            onError={text => this.setState({errorText: (text || text === 0) && typeof text !== 'string' ? text.toString() : text})}
                            instance={this.instance}
                            adapterName={this.adapterName}
                            onShowError={error => this.showError(error)}
                            onChange={(attr, value) => this.updateNativeValue(attr, value)}
                        />}
                    </div>
                    {this.renderError()}
                    {this.renderSaveCloseButtons()}
                    {this.renderAckTempPasswordDialog()}
                </div>
            </ThemeProvider>
        </StyledEngineProvider>;
    }
}

export default withStyles(styles)(App);
