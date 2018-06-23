import { isValidElement } from 'react';

/**
 * @todo Hàm check type component dạng class
*/
const isClassComponent = component => (
	typeof component === 'function' && 
	!!component.prototype.isReactComponent
);

/**
 * @todo Hàm check type component dạng function
*/
const isFunctionComponent = component => (
	typeof component === 'function' && 
	String(component).includes('return React.createElement')
);

/**
 * @todo Hàm check type component react
*/
const isReactComponent = component => (
	isClassComponent(component) || 
	isFunctionComponent(component)
);

/**
 * @todo Hàm check type element ( component đã render )
*/
const isElement = element => (
	isValidElement( element )
);

const isDOMTypeElement = element => (
	isElement(element) && 
	typeof element.type === 'string'
);

const isCompositeTypeElement = element => (
	isElement(element) && 
	typeof element.type === 'function'
);

export {
	isClassComponent,
	isFunctionComponent,
	isReactComponent,
	isElement,
	isDOMTypeElement,
	isCompositeTypeElement
};

/**
// CLASS BASED COMPONENT
class Foo extends React.Component {
  render(){
      return <h1>Hello</h1>;
  }
}

const foo = <Foo />;

//FUNCTIONAL COMPONENT
function Bar (props) { return <h1>World</h1> }
const bar = <Bar />;

// REACT ELEMENT
const header = <h1>Title</h1>;

// CHECK
isReactComponent(Foo); // true
isClassComponent(Foo); // true
isFunctionComponent(Foo); // false
isElement(Foo); // false

isReactComponent(<Foo />) // false
isElement(<Foo />) // true
isDOMTypeElement(<Foo />) // false
isCompositeTypeElement(<Foo />) // true

isReactComponent(Bar); // true
isClassComponent(Bar); // false
isFunctionComponent(Bar); // true
isElement(Bar); // false

isReactComponent(<Bar />) // false
isElement(<Bar />) // true
isDOMTypeElement(<Bar />) // false
isCompositeTypeElement(<Bar />) // true

isReactComponent(header); // false
isElement(header); // true
isDOMTypeElement(header) // true
isCompositeTypeElement(header) // false
*/