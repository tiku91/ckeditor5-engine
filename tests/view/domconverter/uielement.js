/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, HTMLElement */

import ViewUIElement from '../../../src/view/uielement';
import ViewContainer from '../../../src/view/containerelement';
import DomConverter from '../../../src/view/domconverter';

describe( 'DOMConverter UIElement integration', () => {
	let converter;

	function createUIElement( name ) {
		const element = new ViewUIElement( name );

		element.render = function( domDocument ) {
			const root = this.toDomElement( domDocument );
			root.innerHTML = '<p><span>foo</span> bar</p>';

			return root;
		};

		return element;
	}

	beforeEach( () => {
		converter = new DomConverter();
	} );

	describe( 'viewToDom()', () => {
		it( 'should create DOM element from UIElement', () => {
			const uiElement = new ViewUIElement( 'div' );
			const domElement = converter.viewToDom( uiElement, document );

			expect( domElement ).to.be.instanceOf( HTMLElement );
		} );

		it( 'should create DOM structure from UIElement', () => {
			const myElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( myElement, document );

			expect( domElement ).to.be.instanceOf( HTMLElement );
			expect( domElement.innerHTML ).to.equal( '<p><span>foo</span> bar</p>' );
		} );

		it( 'should create DOM structure that all is mapped to single UIElement', () => {
			const myElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( myElement, document, { bind: true } );
			const domParagraph = domElement.childNodes[ 0 ];

			expect( converter.mapDomToView( domElement ) ).to.equal( myElement );
			expect( converter.mapDomToView( domParagraph ) ).to.equal( myElement );
			expect( converter.mapDomToView( domParagraph.childNodes[ 0 ] ) ).to.equal( myElement );
		} );
	} );

	describe( 'domToView()', () => {
		it( 'should return UIElement itself', () => {
			const uiElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( uiElement, document, { bind: true } );

			expect( converter.domToView( domElement ) ).to.equal( uiElement );
		} );

		it( 'should return UIElement for nodes inside', () => {
			const uiElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( uiElement, document, { bind: true } );

			const domParagraph = domElement.childNodes[ 0 ];
			const domSpan = domParagraph.childNodes[ 0 ];

			expect( converter.domToView( domParagraph ) ).to.equal( uiElement );
			expect( converter.domToView( domSpan ) ).to.be.equal( uiElement );
			expect( converter.domToView( domParagraph.childNodes[ 0 ] ) ).equal( uiElement );
			expect( converter.domToView( domSpan.childNodes[ 0 ] ) ).equal( uiElement );
		} );
	} );

	describe( 'domPositionToView()', () => {
		it( 'should convert position inside UIElement to position before it', () => {
			const uiElement = createUIElement( 'h1' );
			const container = new ViewContainer( 'div', null, [ new ViewContainer( 'div' ), uiElement ] );
			const domContainer = converter.viewToDom( container, document, { bind: true } );

			const viewPosition = converter.domPositionToView( domContainer.childNodes[ 1 ], 0 );

			expect( viewPosition.parent ).to.equal( container );
			expect( viewPosition.offset ).to.equal( 1 );
		} );

		it( 'should convert position inside UIElement children to position before UIElement', () => {
			const uiElement = createUIElement( 'h1' );
			const container = new ViewContainer( 'div', null, [ new ViewContainer( 'div' ), uiElement ] );
			const domContainer = converter.viewToDom( container, document, { bind: true } );

			const viewPosition = converter.domPositionToView( domContainer.childNodes[ 1 ].childNodes[ 0 ], 1 );

			expect( viewPosition.parent ).to.equal( container );
			expect( viewPosition.offset ).to.equal( 1 );
		} );
	} );

	describe( 'mapDomToView()', () => {
		it( 'should return UIElement for DOM elements inside', () => {
			const myElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( myElement, document, { bind: true } );

			expect( converter.mapDomToView( domElement ) ).to.equal( myElement );

			const domParagraph = domElement.childNodes[ 0 ];
			expect( converter.mapDomToView( domParagraph ) ).to.equal( myElement );

			const domSpan = domParagraph.childNodes[ 0 ];
			expect( converter.mapDomToView( domSpan ) ).to.equal( myElement );
		} );
	} );

	describe( 'findCorrespondingViewText()', () => {
		it( 'should return UIElement for DOM text inside', () => {
			const myElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( myElement, document, { bind: true } );

			const domText = domElement.querySelector( 'span' ).childNodes[ 0 ];
			expect( converter.findCorrespondingViewText( domText ) ).to.equal( myElement );
		} );
	} );

	describe( 'getParentUIElement()', () => {
		it( 'should return UIElement for DOM children', () => {
			const uiElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( uiElement, document, { bind: true } );

			const domParagraph = domElement.childNodes[ 0 ];
			const domSpan = domParagraph.childNodes[ 0 ];

			expect( converter.getParentUIElement( domParagraph ) ).to.equal( uiElement );
			expect( converter.getParentUIElement( domSpan ) ).to.equal( uiElement );
		} );

		it( 'should return null for element itself', () => {
			const uiElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( uiElement, document, { bind: true } );

			expect( converter.getParentUIElement( domElement ) ).to.be.null;
		} );
	} );
} );
