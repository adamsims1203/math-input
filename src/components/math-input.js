/* eslint no-console: 0 */

const React = require('react');
const ReactDOM = require('react-dom');
const { StyleSheet } = require("aphrodite");

const actions = require('../actions');
const { View } = require('../fake-react-native-web');
const MathWrapper = require('../../test/test-math-wrapper');

const MathInput = React.createClass({
    componentDidMount() {
        const container = ReactDOM.findDOMNode(this);
        const span = document.createElement('span');
        container.appendChild(span);

        this.mathField = new MathWrapper(span);

        // pass this component's handleKey method to the store so it can call
        // it whenever the store gets an KeyPress action from the keypad
        actions.registerKeyHandler(key => this.mathField.pressKey(key));
    },

    render() {
        return <View style={styles.input} />;
    },
});

const styles = StyleSheet.create({
    input: {
        margin: 10,
        width: 300,
        fontSize: 28,
    },
});

module.exports = MathInput;
