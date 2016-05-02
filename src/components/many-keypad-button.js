/**
 * A keypad button that displays an arbitrary number of symbols, with no
 * 'default' symbol.
 */

const React = require('react');

const EmptyKeypadButton = require('./empty-keypad-button');
const TouchableKeypadButton = require('./touchable-keypad-button');

const Keys = require('../data/keys');
const { keyTypes } = require('../consts');
const { keyIdPropType } = require('./prop-types');

const ManyKeypadButton = React.createClass({
    propTypes: {
        keys: React.PropTypes.arrayOf(keyIdPropType).isRequired,
    },

    render() {
        const { keys, ...rest } = this.props;

        // If we have no extra symbols, render an empty button. If we have just
        // one, render a standard button. Otherwise, capture them all in a
        // single button with no 'default' symbol.
        if (keys.length === 0) {
            return <EmptyKeypadButton {...rest} />;
        } else if (keys.length === 1) {
            return <TouchableKeypadButton keyConfig={keys[0]} {...rest} />;
        } else {
            const keyConfig = {
                id: Keys.MANY,
                type: keyTypes.MANY,
                childKeyIds: keys,
            };
            return <TouchableKeypadButton keyConfig={keyConfig} {...rest} />;
        }
    },
});

module.exports = ManyKeypadButton;
