/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console */

import {
	elementToElement as vtmElementToElement
} from '../../src/conversion/view-to-model-helpers';

import {
	elementToElement as mtvElementToElement
} from '../../src/conversion/model-to-view-helpers';

import ViewEditableElement from '../../src/view/editableelement';
import { getData } from '../../src/dev-utils/model';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

import './nestededitable.css';

class NestedEditable extends Plugin {
	init() {
		const editor = this.editor;
		const editing = editor.editing;
		const viewDocument = editing.view;
		const schema = editor.model.schema;

		schema.register( 'figure', {
			isObject: true
		} );
		schema.register( 'figcaption' );
		schema.extend( 'figure', { allowIn: '$root' } );
		schema.extend( 'figcaption', { allowIn: 'figure' } );
		schema.extend( '$text', {
			allowIn: [ 'figure', 'figcaption' ]
		} );

		editor.conversion.for( 'model' ).add( mtvElementToElement( {
			model: 'figure',
			view: {
				name: 'figure',
				attribute: {
					contenteditable: 'false'
				}
			}
		} ) );

		editor.conversion.for( 'view' ).add( vtmElementToElement( {
			model: 'figure',
			view: 'figure'
		} ) );

		editor.conversion.for( 'model' ).add( mtvElementToElement( {
			model: 'figcaption',
			view: () => {
				const element = new ViewEditableElement( 'figcaption', { contenteditable: 'true' } );
				element.document = viewDocument;

				element.on( 'change:isFocused', ( evt, property, is ) => {
					if ( is ) {
						element.addClass( 'focused' );
					} else {
						element.removeClass( 'focused' );
					}
				} );

				return element;
			}
		} ) );

		editor.conversion.for( 'view' ).add( vtmElementToElement( {
			model: 'figcaption',
			view: 'figcaption'
		} ) );
	}
}

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, NestedEditable, Undo ],
		toolbar: [ 'undo', 'redo' ]
	} )
	.then( editor => {
		editor.model.document.on( 'change', () => {
			printModelContents( editor );
		} );

		printModelContents( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const modelDiv = global.document.querySelector( '#model' );
function printModelContents( editor ) {
	modelDiv.innerText = getData( editor.model );
}
