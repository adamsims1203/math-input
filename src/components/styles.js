/**
 * Common styles shared across components.
 */

const { StyleSheet } = require('aphrodite');

module.exports = StyleSheet.create({
    keypad: {
        position: 'fixed',
        bottom: 0,
        width: '100%',
        borderTop: '1px solid rgba(0, 0, 0, 0.2)',
    },
    row: {
        flexDirection: 'row',
    },
    column: {
        flexDirection: 'column',
    },
    oneColumn: {
        flexGrow: 1,
    },
    twoColumn: {
        flexGrow: 2,
    },
    fullWidth: {
        width: '100%',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
