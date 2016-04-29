const React = require('react');
const { StyleSheet, css } = require('aphrodite');

const View = React.createClass({
    propTypes: {
        children: React.PropTypes.oneOfType([
            React.PropTypes.arrayOf(React.PropTypes.node),
            React.PropTypes.node,
        ]),
        numberOfLines: React.PropTypes.number,
        onClick: React.PropTypes.func,
        onTouchCancel: React.PropTypes.func,
        onTouchEnd: React.PropTypes.func,
        onTouchMove: React.PropTypes.func,
        onTouchStart: React.PropTypes.func,
        style: React.PropTypes.any,
    },

    render() {
        const className = Array.isArray(this.props.style)
            ? css(styles.initial, ...this.props.style)
            : css(styles.initial, this.props.style);

        return <div
            className={className}
            onClick={this.props.onClick}
            onTouchCancel={this.props.onTouchCancel}
            onTouchEnd={this.props.onTouchEnd}
            onTouchMove={this.props.onTouchMove}
            onTouchStart={this.props.onTouchStart}
        >
            {this.props.children}
        </div>;
    },
});

// https://github.com/necolas/react-native-web/blob/master/src/components/View/index.js
const styles = StyleSheet.create({
    initial: {
        alignItems: 'stretch',
        borderWidth: 0,
        borderStyle: 'solid',
        boxSizing: 'border-box',
        display: 'flex',
        flexBasis: 'auto',
        flexDirection: 'column',
        margin: 0,
        padding: 0,
        position: 'relative',
        // button and anchor reset
        backgroundColor: 'transparent',
        color: 'inherit',
        font: 'inherit',
        textAlign: 'inherit',
        textDecorationLine: 'none',
        // list reset
        listStyle: 'none',
        // fix flexbox bugs
        maxWidth: '100%',
        minHeight: 0,
        minWidth: 0,
    },
});

module.exports = View;
