/**
 * An autogenerated component that renders the LEQ iconograpy in SVG.
 *
 * Generated with: https://gist.github.com/crm416/3c7abc88e520eaed72347af240b32590.
 */
const React = require('react');

const Leq = React.createClass({
    propTypes: {
        primaryColor: React.PropTypes.string,
        secondaryColor: React.PropTypes.string,
    },

    getDefaultProps() {
        return {
            primaryColor: '#3B3E40',
            secondaryColor: '#BABEC2',
        };
    },

    render() {
        return <svg width="48px" height="48px" viewBox="0 0 48 48" version="1.1">
            <g id="Math-Input" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="[Assets]-Math-Input" transform="translate(-1068.000000, -766.000000)">
                    <g id="math_keypad_icon_less_than_not" transform="translate(1068.000000, 766.000000)">
                        <g id="icon">
                            <g id="math_keypad_icon_less_than">
                                <rect id="bounds" fillOpacity="0" fill="#FF0088" x="0" y="0" width="48" height="48"></rect>
                                <g id="icon" transform="translate(12.000000, 12.000000)">
                                    <rect id="bounds" fillOpacity="0" fill="#FF0088" x="0" y="0" width="24" height="24"></rect>
                                    <path d="M4,21 L20,21" id="line" stroke={this.props.primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <polyline id="bracket" stroke={this.props.primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="20 18 4 12 20 6"></polyline>
                                </g>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </svg>;
    },
});

module.exports = Leq;
