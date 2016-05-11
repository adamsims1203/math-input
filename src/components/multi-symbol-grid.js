/**
 * A grid of symbols, rendered as text.
 */

const React = require('react');
const { StyleSheet } = require('aphrodite');

const { Text, View } = require('../fake-react-native-web');
const { row, column, centered, fullWidth } = require('./styles');
const { iconSizeHeightPx, iconSizeWidthPx } = require('./common-style');

const MultiSymbolGrid = React.createClass({
    propTypes: {
        focused: React.PropTypes.bool,
        unicodeSymbols: React.PropTypes.arrayOf(
            React.PropTypes.string
        ).isRequired,
    },

    render() {
        const { focused, unicodeSymbols } = this.props;

        const primaryIconStyle = [
            styles.iconFont,
            styles.primaryIcon,
            focused && styles.focused,
        ];
        const secondaryIconStyle = [
            styles.iconFont,
            styles.secondaryIcon,
            focused && styles.focused,
        ];

        return <View style={[
            column,
            styles.iconSize,
            styles.fourQuadrantGrid,
        ]}
        >
            <View style={row}>
                <View style={[centered, fullWidth]}>
                    <Text style={primaryIconStyle}>
                        {unicodeSymbols[0]}
                    </Text>
                </View>
                <View style={[centered, fullWidth]}>
                    <Text style={secondaryIconStyle}>
                        {unicodeSymbols[1]}
                    </Text>
                </View>
            </View>
            <View style={row}>
                <View style={[centered, fullWidth]}>
                    <Text style={secondaryIconStyle}>
                        {unicodeSymbols[2]}
                    </Text>
                </View>
                <View style={[centered, fullWidth]}>
                    <Text style={secondaryIconStyle}>
                        {unicodeSymbols[3]}
                    </Text>
                </View>
            </View>
        </View>;
    },
});

const fourQuadrantGridVerticalPaddingPx = 4;

const styles = StyleSheet.create({
    iconSize: {
        height: iconSizeHeightPx,
        width: iconSizeWidthPx,
    },
    fourQuadrantGrid: {
        paddingTop: fourQuadrantGridVerticalPaddingPx,
        paddingBottom: fourQuadrantGridVerticalPaddingPx,
    },

    iconFont: {
        fontFamily: 'Proxima Nova Semibold',
        fontStyle: 'italic',
        fontSize: 18,
    },
    // TODO(charlie): Share these constants with the SVG icons.
    primaryIcon: {
        color: '#3B3E40',
    },
    secondaryIcon: {
        color: '#3B3E40',
        opacity: 0.3,
    },

    focused: {
        color: '#FFF',
    },
});

module.exports = MultiSymbolGrid;
