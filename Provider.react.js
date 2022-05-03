import React from 'react';
import PropTypes from 'prop-types';
import LocaleContext from './Context';

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
