/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/operation/operation',
	'ckeditorerror'
], ( Operation, CKEditorError ) => {
	/**
	 * Operation to change nodes' attribute. Using this class you can add, remove or change value of the attribute.
	 *
	 * @class document.operation.ChangeOperation
	 */
	class ChangeOperation extends Operation {
		/**
		 * Creates a change operation.
		 *
		 * If only the new attribute is set, then it will be inserted. Note that in all nodes in ranges there must be
		 * no attributes with the same key as the new attribute.
		 *
		 * If only the old attribute is set, then it will be removed. Note that this attribute must be present in all nodes in
		 * ranges.
		 *
		 * If both new and old attributes are set, then the operation will change the attribute value. Note that both new and
		 * old attributes have to have the same key and the old attribute must be present in all nodes in ranges.
		 *
		 * @param {document.Range} range Range on which the operation should be applied.
		 * @param {document.Attribute|null} oldAttr Attribute to be removed. If `null`, then the operation just inserts a new attribute.
		 * @param {document.Attribute|null} newAttr Attribute to be added. If `null`, then the operation just removes the attribute.
		 * @param {Number} baseVersion {@link document.Document#version} on which the operation can be applied.
		 * @constructor
		 */
		constructor( range, oldAttr, newAttr, baseVersion ) {
			super( baseVersion );

			/**
			 * Range on which operation should be applied.
			 *
			 * @readonly
			 * @type {document.Range}
			 */
			this.range = range;

			/**
			 * Old attribute to change. Set to `null` if operation inserts a new attribute.
			 *
			 * @readonly
			 * @type {document.Attribute|null}
			 */
			this.oldAttr = oldAttr;

			/**
			 * New attribute. Set to `null` if operation removes the attribute.
			 *
			 * @readonly
			 * @type {document.Attribute|null}
			 */
			this.newAttr = newAttr;
		}

		_execute() {
			const oldAttr = this.oldAttr;
			const newAttr = this.newAttr;
			let value;

			if ( oldAttr !== null && newAttr !== null && oldAttr.key != newAttr.key ) {
				/**
				 * Old and new attributes should have the same keys.
				 *
				 * @error operation-change-different-keys
				 * @param {document.Attribute} oldAttr
				 * @param {document.Attribute} newAttr
				 */
				throw new CKEditorError(
					'operation-change-different-keys: Old and new attributes should have the same keys.',
					{ oldAttr: oldAttr, newAttr: newAttr } );
			}

			// Remove or change.
			if ( oldAttr !== null && newAttr === null ) {
				for ( value of this.range ) {
					value.node.removeAttr( oldAttr.key );
				}
			}

			// Insert or change.
			if ( newAttr !== null ) {
				for ( value of this.range ) {
					value.node.setAttr( newAttr );
				}
			}
		}

		getReversed() {
			return new ChangeOperation( this.range, this.newAttr, this.oldAttr, this.baseVersion + 1 );
		}

		clone() {
			return new ChangeOperation( this.range.clone(), this.oldAttr, this.newAttr, this.baseVersion );
		}

		/**
		 * Checks whether this operation has conflicting attributes with given {@link document.operation.ChangeOperation}.
		 * This happens when both operations changes an attribute with the same key and they either set different
		 * values for this attribute or one of them removes it while the other one sets it.
		 *
		 * @param {document.operation.ChangeOperation} otherOperation Operation to check against.
		 * @returns {boolean} True if operations have conflicting attributes.
		 */
		conflictsAttributesWith( otherOperation ) {
			// Keeping in mind that newAttr or oldAttr might be null.
			// We will retrieve the key from whichever parameter is set.
			const thisKey = ( this.newAttr || this.oldAttr ).key;
			const otherKey = ( otherOperation.newAttr || otherOperation.oldAttr ).key;

			if ( thisKey != otherKey ) {
				// Different keys - not conflicting.
				return false;
			}

			// Check if they set different value or one of them removes the attribute.
			return ( this.newAttr === null && otherOperation.newAttr !== null ) ||
				( this.newAttr !== null && otherOperation.newAttr === null ) ||
				( !this.newAttr.isEqual( otherOperation.newAttr ) );
		}
	}

	return ChangeOperation;
} );
