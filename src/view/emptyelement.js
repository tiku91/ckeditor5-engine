/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/emptyelement
 */

import Element from './element.js';
import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * EmptyElement class. It is used to represent elements that cannot contain any child nodes.
 */
export default class EmptyElement extends Element {
	/**
	 * Creates new instance of EmptyElement.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-emptyelement-cannot-add` when third parameter is passed,
	 * to inform that usage of EmptyElement is incorrect (adding child nodes to EmptyElement is forbidden).
	 *
	 * @param {String} name Node name.
	 * @param {Object|Iterable} [attributes] Collection of attributes.
	 */
	constructor( name, attributes ) {
		super( name, attributes );

		if ( arguments.length > 2 ) {
			throwCannotAdd();
		}
	}

	/**
	 * Clones provided element. Overrides {@link module:engine/view/element~Element#clone} method, as it's forbidden to pass child
	 * nodes to EmptyElement's constructor.
	 *
	 * @returns {envine.view.EmptyElement} Clone of this element.
	 */
	clone() {
		const cloned = new this.constructor( this.name, this._attrs );

		// Classes and styles are cloned separately - this solution is faster than adding them back to attributes and
		// parse once again in constructor.
		cloned._classes = new Set( this._classes );
		cloned._styles = new Map( this._styles );

		return cloned;
	}

	/**
	 * Overrides {@link module:engine/view/element~Element#appendChildren} method.
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-emptyelement-cannot-add` to prevent adding any child nodes
	 * to EmptyElement.
	 */
	appendChildren() {
		throwCannotAdd();
	}

	/**
	 * Overrides {@link module:engine/view/element~Element#insertChildren} method.
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-emptyelement-cannot-add` to prevent adding any child nodes
	 * to EmptyElement.
	 */
	insertChildren() {
		throwCannotAdd();
	}

	/**
	 * Returns `null` because block filler is not needed.
	 *
	 * @returns {null}
	 */
	getFillerOffset() {
		return null;
	}
}

function throwCannotAdd() {
	/**
	 * Cannot add children to {@link module:engine/view/emptyelement~EmptyElement}.
	 *
	 * @error view-emptyelement-cannot-add
	 */
	throw new CKEditorError( 'view-emptyelement-cannot-add: Cannot add child nodes to EmptyElement instance.' );
}