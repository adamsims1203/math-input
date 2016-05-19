/* globals i18n */

const React = require('react');
const ReactDOM = require('react-dom');
const { css, StyleSheet } = require("aphrodite");

const { setKeyHandler } = require('../../actions');
const { View } = require('../../fake-react-native-web');
const CursorHandle = require('./cursor-handle');
const SelectionRect = require('./selection-rect');
const MathWrapper = require('./math-wrapper');
const scrollIntoView = require('./scroll-into-view');
const {
    cursorHandleRadiusPx,
    cursorHandleDistanceMultiplier,
 } = require('../common-style');
const { keypadElementPropType } = require('../prop-types');

const defaultSelectionRect = {
    visible: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
};

const unionRects = (rects) =>
    rects.reduce((previous, current) => {
        return {
            top: Math.min(previous.top, current.top),
            right: Math.max(previous.right, current.right),
            bottom: Math.max(previous.bottom, current.bottom),
            left: Math.min(previous.left, current.left),
        };
    }, {
        top: Infinity,
        right: -Infinity,
        bottom: -Infinity,
        left: Infinity,
    });

const MathInput = React.createClass({
    propTypes: {
        // The React element node associated with the keypad that will send
        // key-press events to this input. If provided, this can be used to:
        //   (1) Avoid blurring the input, on user interaction with the keypad.
        //   (2) Scroll the input into view, if it would otherwise be obscured
        //       by the keypad on focus.
        keypadElement: keypadElementPropType,
        onBlur: React.PropTypes.func,
        onChange: React.PropTypes.func.isRequired,

        /**
         * A callback that's triggered whenever the cursor moves as a result of
         * a non-key press (i.e., through direct user interaction).
         *
         * The callback takes, as argument, a cursor object consisting of a
         * cursor context.
         */
        onCursorMove: React.PropTypes.func,

        onFocus: React.PropTypes.func,
        value: React.PropTypes.string,
    },

    getDefaultProps() {
        return {
            value: "",
        };
    },

    getInitialState() {
        return {
            focused: false,
            handle: {
                animateIntoPosition: false,
                visible: false,
                x: 0,
                y: 0,
            },
            selectionRect: defaultSelectionRect,
        };
    },

    componentDidMount() {
        this.mathField = new MathWrapper(this._mathContainer, {
            onCursorMove: this.props.onCursorMove,
        });

        // NOTE(charlie): MathQuill binds this handler to manage its
        // drag-to-select behavior. For reasons that I can't explain, the event
        // itself gets triggered even if you tap slightly outside of the
        // bound container (maybe 5px outside of any boundary). As a result, the
        // cursor appears when tapping at those locations, even though the input
        // itself doesn't receive any touch start or mouse down event and, as
        // such, doesn't focus itself. This makes for a confusing UX, as the
        // cursor appears, but the keypad does not and the input otherwise
        // treats itself as unfocused. Thankfully, we don't need this behavior--
        // we manage all of the cursor interactions ourselves--so we can safely
        // unbind the handler.
        this.mathField.mathField.__controller.container.unbind(
            'mousedown.mathquill'
        );

        this.mathField.setContent(this.props.value);

        this._container = ReactDOM.findDOMNode(this);

        this._root = this._container.querySelector('.mq-root-block');
        this._root.style.border = `solid ${paddingWidthPx}px white`;
        this._root.style.fontSize = `${fontSizePt}pt`;

        // Record the initial scroll displacement on touch start. This allows
        // us to detect whether a touch event was a scroll and only blur the
        // input on non-scrolls--blurring the input on scroll makes for a
        // frustrating user experience.
        this.touchStartInitialScroll = null;
        this.recordTouchStartOutside = (evt) => {
            if (this.state.focused) {
                // Only blur if the touch is both outside of the input, and
                // outside of the keypad (if it has been provided).
                if (!this._container.contains(evt.target)) {
                    const maybeKeypadNode = this.props.keypadElement &&
                        ReactDOM.findDOMNode(this.props.keypadElement);
                    const touchStartInKeypad = maybeKeypadNode &&
                        maybeKeypadNode.contains(evt.target);

                    if (!touchStartInKeypad) {
                        this.touchStartInitialScroll = document.body.scrollTop;
                    }
                }
            }
        };

        this.blurOnTouchEndOutside = (evt) => {
            // If the user didn't scroll, blur the input. This won't work
            // properly in the case that the user scrolls, but returns to the
            // original scroll position, but that seems exceptionally unlikely.
            if (this.state.focused &&
                    this.touchStartInitialScroll === document.body.scrollTop) {
                this.blur();
            }
            this.touchStartInitialScroll = null;
        };

        window.addEventListener('touchstart', this.recordTouchStartOutside);
        window.addEventListener('touchend', this.blurOnTouchEndOutside);
        window.addEventListener('touchcancel', this.blurOnTouchEndOutside);
    },

    componentDidUpdate() {
        if (this.mathField.getContent() !== this.props.value) {
            this.mathField.setContent(this.props.value);
        }
    },

    componentWillUnmount() {
        window.removeEventListener('touchstart', this.recordTouchStartOutside);
        window.removeEventListener('touchend', this.blurOnTouchEndOutside);
        window.removeEventListener('touchcancel', this.blurOnTouchEndOutside);
    },

    rectForSelection(selection) {
        if (!selection) {
            return defaultSelectionRect;
        }

        const selectionRoot = this._container.querySelector('.mq-selection');
        const bounds = unionRects(
            // Grab all the DOMNodes within the selection and calculate the
            // union of all of their bounding boxes.
            [...selectionRoot.querySelectorAll('*')].map(
                elem => elem.getBoundingClientRect()
            )
        );

        const mathContainerBounds =
            this._mathContainer.getBoundingClientRect();

        const borderWidth = borderWidthPx;
        const padding = paddingWidthPx;

        return {
            visible: true,
            x: bounds.left - mathContainerBounds.left - borderWidth - padding,
            y: bounds.top - mathContainerBounds.top - borderWidth - padding,
            width: bounds.right - bounds.left + 2 * padding,
            height: bounds.bottom - bounds.top + 2 * padding,
        };
    },

    _updateCursorHandle(animateIntoPosition) {
        const containerBounds = this._container.getBoundingClientRect();
        const cursor = this._container.querySelector('.mq-cursor');
        const cursorBounds = cursor.getBoundingClientRect();

        const cursorWidth = 2;
        const gapBelowCursor = 2;

        this.setState({
            handle: {
                visible: true,
                animateIntoPosition,
                // We subtract containerBounds' left/top to correct for the
                // position of the container within the page.
                x: cursorBounds.left + cursorWidth / 2 - containerBounds.left,
                y: cursorBounds.bottom + gapBelowCursor - containerBounds.top,
            },
            selectionRect: defaultSelectionRect,
        });
    },

    _hideCursorHandle() {
        this.setState({
            handle: {
                visible: false,
                x: 0,
                y: 0,
            },
        });
    },

    /**
     * Set the position of the cursor and update the cursor handle if the
     * text field isn't empty.
     *
     * @param {number} x
     * @param {number} y
     */
    _setCursorLocation(x, y) {
        this.mathField.setCursorPosition(x, y);
        this.mathField.getCursor().show();
    },

    blur() {
        this.mathField.getCursor().hide();
        this.props.onBlur && this.props.onBlur();
        this.setState({ focused: false, handle: { visible: false } });
    },

    focus() {
        // Pass this component's handleKey method to the store so it can call
        // it whenever the store gets a keypress action from the keypad.
        setKeyHandler(key => {
            const cursor = this.mathField.pressKey(key);

            // Trigger an `onChange` if the value in the input changed, and hide
            // the cursor handle and update the selection rect whenever the user
            // types a key. If the value changed as a result of a keypress, we
            // need to be careful not to call `setState` until after `onChange`
            // has resolved.
            const hideCursorAndUpdateSelectionRect = () => {
                this.setState({
                    handle: {
                        visible: false,
                    },
                    selectionRect: this.rectForSelection(cursor.selection),
                });
            };
            const value = this.mathField.getContent();
            if (this.props.value !== value) {
                this.props.onChange(value, hideCursorAndUpdateSelectionRect);
            } else {
                hideCursorAndUpdateSelectionRect();
            }

            return cursor;
        });

        this.mathField.getCursor().show();
        this.props.onFocus && this.props.onFocus();
        this.setState({ focused: true }, () => {
            // NOTE(charlie): We use `setTimeout` to allow for a layout pass to
            // occur. Otherwise, the keypad is measured incorrectly. Ideally,
            // we'd use requestAnimationFrame here, but it's unsupported on
            // Android Browser 4.3.
            setTimeout(() => {
                if (this.isMounted()) {
                    const maybeKeypadNode = this.props.keypadElement &&
                        ReactDOM.findDOMNode(this.props.keypadElement);
                    scrollIntoView(this._container, maybeKeypadNode);
                }
            });
        });
    },

    /**
     * Move the cursor beside the hitNode.  MathQuill uses the x, y coordinates
     * to decide which side of the hitNode the cursor should be on.
     *
     * @param {DOMNode} hitNode
     * @param {number} x
     * @param {number} y
     */
    _moveCursorToNode(hitNode, x, y) {
        this.mathField.setCursorPosition(x, y, hitNode);
    },

    /**
     * Tries to determine which DOM node to place the cursor next to based on
     * where the user drags the cursor handle.  If it finds a node it will
     * place the cursor next to it, update the handle to be under the cursor,
     * and return true.  If it doesn't find a node, it returns false.
     *
     * It searches for nodes by doing it tests at the following points:
     *
     *   (x - dx, y), (x, y), (x + dx, y)
     *
     * If it doesn't find any nodes from the rendered math it will update y
     * by adding dy.
     *
     * The algorithm ends its search when y goes outside the bounds of
     * containerBounds.
     *
     * @param {ClientRect} containerBounds - bounds of the container node
     * @param {number} x  - initial x coordinate
     * @param {number} y  - initial y coordinate
     * @param {number} dx - horizontal spacing between elementFromPoint calls
     * @param {number} dy - vertical spacing between elementFromPoint calls,
     *                      sign determines direction.
     * @returns {boolean} - true if a node was hit, false otherwise.
     */
    _findHitNode(containerBounds, x, y, dx, dy) {
        while (y >= containerBounds.top && y <= containerBounds.bottom) {
            y += dy;

            const points = [
                [x - dx, y],
                [x, y],
                [x + dx, y],
            ];

            const elements = points
                .map(point => document.elementFromPoint(...point))
                // We exclude the root container itself and any nodes marked
                // as non-leaf which are fractions, parens, and roots.  The
                // children of those nodes are included in the list because
                // those are the items we care about placing the cursor next
                // to.
                //
                // MathQuill's mq-non-leaf is not applied to all non-leaf nodes
                // so the naming is a bit confusing.  Although fractions are
                // included, neither mq-numerator nor mq-denominator nodes are
                // and neither are subscripts or superscripts.
                .filter(element => element && this._root.contains(element) &&
                        !element.classList.contains('mq-root-block') &&
                        !element.classList.contains('mq-non-leaf'));

            let hitNode = null;

            // Contains only DOMNodes without child elements.  These should
            // contain some amount of text though.
            const leafElements = [];

            // Contains only DOMNodes with child elements.
            const nonLeafElements = [];

            let max = 0;
            const counts = {};
            const elementsById = {};

            for (const element of elements) {
                const id = element.getAttribute('mathquill-command-id');
                if (id != null) {
                    leafElements.push(element);

                    counts[id] = (counts[id] || 0) + 1;
                    elementsById[id] = element;
                } else {
                    nonLeafElements.push(element);
                }
            }

            // When determining which DOMNode to place the cursor beside, we
            // prefer leaf nodes.  Hitting a leaf node is a good sign that the
            // cursor is really close to some piece of math that has been
            // rendered because leaf nodes contain text.  Non-leaf nodes may
            // contain a lot of whitespace so the cursor may be further away
            // from actual text within the expression.
            //
            // Since we're doing three hit tests per loop it's possible that
            // we hit multiple leaf nodes at the same time.  In this case we
            // we prefer the DOMNode with the most hits.
            // TODO(kevinb) consider preferring nodes hit by [x, y].
            for (const [id, count] of Object.entries(counts)) {
                if (count > max) {
                    max = count;
                    hitNode = elementsById[id];
                }
            }

            // It's possible that two non-leaf nodes are right beside each
            // other.  We don't bother counting the number of hits for each,
            // b/c this seems like an unlikely situation.  Also, ignoring the
            // hit count in the situation should not have serious effects on
            // the overall accuracy of the algorithm.
            if (hitNode == null && nonLeafElements.length > 0) {
                hitNode = nonLeafElements[0];
            }

            if (hitNode !== null) {
                this._moveCursorToNode(hitNode, x, y);
                return true;
            }
        }

        return false;
    },

    /**
     * Inserts the cursor at the DOM node closest to the given coordinates,
     * based on hit-tests conducted using #_findHitNode.
     *
     * @param {number} x  - x coordinate
     * @param {number} y  - y coordinate
     */
    _insertCursorAtClosestNode(x, y) {
        const cursor = this.mathField.getCursor();

        // Pre-emptively check if the input has any child nodes; if not, the
        // input is empty, so we throw the cursor at the start.
        if (!this._root.hasChildNodes()) {
            cursor.insAtLeftEnd(this.mathField.mathField.__controller.root);
            return;
        }

        // TODO(charlie): Avoid re-computing this. It should be cached at the
        // start of a touch event.
        const containerBounds = this._container.getBoundingClientRect();

        if (y > containerBounds.bottom) {
            y = containerBounds.bottom;
        } else if (y < containerBounds.top) {
            y = containerBounds.top + 10;
        }

        let dx;
        let dy;

        // Vertical spacing between hit tests
        // dy is negative because we're moving upwards.
        dy = -8;

        // Horizontal spacing between hit tests
        // Note: This value depends on the font size.  If the gap is too small
        // we end up placing the cursor at the end of the expression when we
        // shouldn't.
        dx = 5;

        if (this._findHitNode(containerBounds, x, y, dx, dy)) {
            return;
        }

        // If we haven't found anything start from the top.
        y = containerBounds.top;

        // dy is positive b/c we're going downwards.
        dy = 8;

        if (this._findHitNode(containerBounds, x, y, dx, dy)) {
            return;
        }

        const firstChildBounds = this._root.firstChild.getBoundingClientRect();
        const lastChildBounds = this._root.lastChild.getBoundingClientRect();

        const left = firstChildBounds.left;
        const right = lastChildBounds.right;

        // We've exhausted all of the options. We're likely either to the right
        // or left of all of the math, so we place the cursor at the end to
        // which it's closest.
        if (Math.abs(x - right) < Math.abs(x - left)) {
            cursor.insAtRightEnd(this.mathField.mathField.__controller.root);
        } else {
            cursor.insAtLeftEnd(this.mathField.mathField.__controller.root);
        }
    },

    handleTouchStart(e) {
        e.preventDefault();

        // Hide the cursor handle on touch start, if the handle itself isn't
        // handling the touch event.
        this._hideCursorHandle();

        // Set the handle-less cursor's location.
        const touch = e.changedTouches[0];
        this._insertCursorAtClosestNode(touch.pageX, touch.pageY);

        this.focus();
    },

    handleTouchMove(e) {
        // Update the handle-less cursor's location on move.
        const touch = e.changedTouches[0];
        this._insertCursorAtClosestNode(touch.pageX, touch.pageY);
    },

    handleTouchEnd(e) {
        // And on touch-end, reveal the cursor, unless the input is empty.
        if (this.mathField.getContent() !== "") {
            this._updateCursorHandle();
        }
    },

    /**
     * When a touch starts in the cursor handle, we track it so as to avoid
     * handling any touch events ourself.
     *
     * @param {TouchEvent} e - the raw touch event from the browser
     */
    onCursorHandleTouchStart(e) {
        // NOTE(charlie): The cursor handle is a child of this view, so whenever
        // it receives a touch event, that event would also typically be bubbled
        // up to our own handlers. However, we want the cursor to handle its own
        // touch events, and for this view to only handle touch events that
        // don't affect the cursor. As such, we `stopPropagation` on any touch
        // events that are being handled by the cursor, so as to avoid handling
        // them in our own touch handlers.
        e.stopPropagation();
    },

    /**
     * When the user moves the cursor handle update the position of the cursor
     * and the handle.
     *
     * @param {TouchEvent} e - the raw touch event from the browser
     */
    onCursorHandleTouchMove(e) {
        e.stopPropagation();

        // TODO(kevinb) cache this in the touchstart of the CursorHandle
        const containerBounds = this._container.getBoundingClientRect();

        const x = e.changedTouches[0].pageX;
        const y = e.changedTouches[0].pageY;

        // We subtract the containerBounds left/top to correct for the
        // MathInput's position on the page.  We subtract scrollTop/Left to
        // correct for any scrolling that's occurred.  On top of all that, we
        // subtract an additional 2 x {height of the cursor} so that the bottom
        // of the cursor tracks the user's finger, to make it visible under
        // their touch.
        this.setState({
            handle: {
                animateIntoPosition: false,
                visible: true,
                // TODO(charlie): Use clientX and clientY to avoid the need for
                // scroll offsets. This likely also means that the cursor
                // detection doesn't work when scrolled, since we're not
                // offsetting those values.
                x: x - containerBounds.left - document.body.scrollLeft,
                y: y - 2 * cursorHandleRadiusPx * cursorHandleDistanceMultiplier
                     - containerBounds.top - document.body.scrollTop,
            },
        });

        // Use a y-coordinate that's just above where the user is actually
        // touching because they're dragging the handle which is a little
        // below where the cursor actually is.
        const distanceAboveFingerToTrySelecting = 22;
        const adjustedY = y - distanceAboveFingerToTrySelecting;

        this._insertCursorAtClosestNode(x, adjustedY);
    },

    /**
     * When the user releases the cursor handle, animate it back into place.
     *
     * @param {TouchEvent} e - the raw touch event from the browser
     */
    onCursorHandleTouchEnd(e) {
        e.stopPropagation();

        this._updateCursorHandle(true);
    },

    /**
     * If the gesture is cancelled mid-drag, simply hide it.
     *
     * @param {TouchEvent} e - the raw touch event from the browser
     */
    onCursorHandleTouchCancel(e) {
        e.stopPropagation();

        this._updateCursorHandle(true);
    },

    render() {
        const { focused, handle, selectionRect } = this.state;

        return <View
            style={styles.input}
            onTouchStart={this.handleTouchStart}
            onTouchMove={this.handleTouchMove}
            onTouchEnd={this.handleTouchEnd}
            role={'textbox'}
            ariaLabel={i18n._('Math input box')}
        >
            {/* NOTE(charlie): This is used purely to namespace the styles in
                overrides.css. */}
            <div className='keypad-input'>
                <div
                    ref={(node) => {
                        this._mathContainer = ReactDOM.findDOMNode(node);
                    }}
                    className={css(styles.innerContainer)}
                >
                    {focused && selectionRect.visible &&
                        <SelectionRect {...selectionRect}/>}
                </div>
            </div>
            {focused && handle.visible && <CursorHandle
                {...handle}
                onTouchStart={this.onCursorHandleTouchStart}
                onTouchMove={this.onCursorHandleTouchMove}
                onTouchEnd={this.onCursorHandleTouchEnd}
                onTouchCancel={this.onCursorHandleTouchCancel}
            />}
        </View>;
    },
});

const fontSizePt = 18;
const minSizePx = 34;
const paddingWidthPx = 2;   // around _mathContainer and the selection rect
const borderWidthPx = 1;    // black border around _mathContainer

const styles = StyleSheet.create({
    input: {
        position: 'relative',
        display: 'inline-block',
        verticalAlign: 'middle',
    },

    innerContainer: {
        backgroundColor: 'white',
        display: 'flex',
        minWidth: minSizePx,
        minHeight: minSizePx,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: borderWidthPx,
        borderStyle: 'solid',
        borderColor: '#BABEC2',
        borderRadius: 4,
    },
});

module.exports = MathInput;
