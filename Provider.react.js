import React from 'react';
import PropTypes from 'prop-types';
import LocaleContext from './Context';
import {getHostName} from 'virtual-tour-viewer/src/utils/UIHelper';

async function isLocalHost() {
    let hostname = !window.origin ? window.location.origin : window.origin;
    return hostname.includes('localhost');
}

async function getLabelsFromHavrApi(locale) {
    let taxonomyName = 'spaces';
    // defaulting to en-US in case locale isn't present
    locale = locale ? locale : 'en-US';
    let tardisResponse;
    if (await isLocalHost()) {
        tardisResponse = await fetch(
            `http://localhost:8080/havr-api/v2/taxonomies/${taxonomyName}/${locale}`
        );
        // if the viewer is running locally without havr-api, hit svc-stage instead
        if (!tardisResponse.status !== '200') {
            tardisResponse = await fetch(
                `https://svc-stage.homeaway.com/havr-api/v2/taxonomies/${taxonomyName}/${locale}`
            );
        }
    } else {
        tardisResponse = await fetch(`${getHostName()}/v2/taxonomies/${taxonomyName}/${locale}`);
    }
    return await tardisResponse.json();
}

async function getTranslations(locale) {
    let response = await fetch(`static_assets/translations/${locale}.json`);
    if (response.status !== 200) {
        response = await fetch('static_assets/translations/en_US.json');
    }
    const data = await response.json();
    // replacing the spaceLabels with the tardisResponse
    let tardisResponseBody = await getLabelsFromHavrApi(locale);
    if (tardisResponseBody) {
        data['cams/virtual-tours'].spaceLabels = tardisResponseBody;
    }
    return data['cams/virtual-tours'];
}

class LocaleProvider extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            messages: {},
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let nextState = prevState;
        if (!nextState.localePromise || nextProps.locale !== prevState.locale) {
            nextState.locale = nextProps.locale;
            nextState.localePromise = getTranslations(nextState.locale);
        }
        return nextState;
    }

    componentDidMount(): void {
        if (this.state.localePromise) {
            this.state.localePromise.then((messages) => {
                this.setState({
                    ...this.state,
                    messages,
                    loaded: true,
                });
            });
        }
    }

    _getter = (table, key) => {
        if (table in this.state.messages && key in this.state.messages[table]) {
            return this.state.messages[table][key];
        }

        return `${table}:${key}`;
    };

    render() {
        return (
            <LocaleContext.Provider value={this._getter}>
                {this.state.loaded ? this.props.children : null}
            </LocaleContext.Provider>
        );
    }
}

LocaleProvider.propTypes = {
    locale: PropTypes.string,
    children: PropTypes.node.isRequired,
};

export default LocaleProvider;
