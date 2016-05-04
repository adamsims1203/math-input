/**
 * An autogenerated component that renders the EQUAL_MULTI iconograpy in SVG.
 *
 * Generated with: https://gist.github.com/crm416/3c7abc88e520eaed72347af240b32590.
 */
const React = require('react');

const EqualMulti = React.createClass({
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
            <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="math_keypad_icon_equals_multi">
                    <g id="icon">
                        <g id="math_keypad_icon_equals">
                            <rect id="bounds" fillOpacity="0" fill="#FF0088" x="0" y="0" width="48" height="48"></rect>
                            <g id="icon" transform="translate(12.000000, 12.000000)">
                                <rect id="bounds" fillOpacity="0" fill="#FF0088" x="0" y="0" width="24" height="24"></rect>
                                <path d="M7.87415728,21.4856429 L17.8741573,3.48564293 C18.1423705,3.0028592 17.9684267,2.39405591 17.4856429,2.12584272 C17.0028592,1.85762954 16.3940559,2.03157334 16.1258427,2.51435707 L6.12584272,20.5143571 C5.85762954,20.9971408 6.03157334,21.6059441 6.51435707,21.8741573 C6.9971408,22.1423705 7.60594409,21.9684267 7.87415728,21.4856429 L7.87415728,21.4856429 Z" id="line" fill="#E3E5E6"></path>
                                <path d="M4,10 L21,10 C21.5522847,10 22,9.55228475 22,9 C22,8.44771525 21.5522847,8 21,8 L4,8 C3.44771525,8 3,8.44771525 3,9 C3,9.55228475 3.44771525,10 4,10 L4,10 Z" id="line" fill={this.props.primaryColor}></path>
                                <path d="M4,16 L21,16 C21.5522847,16 22,15.5522847 22,15 C22,14.4477153 21.5522847,14 21,14 L4,14 C3.44771525,14 3,14.4477153 3,15 C3,15.5522847 3.44771525,16 4,16 L4,16 Z" id="line" fill={this.props.primaryColor}></path>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </svg>;
    },
});

module.exports = EqualMulti;
