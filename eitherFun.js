/**
 * ES6 versions of Either monad used in FP in JS
 * Author: Luis Atencio
 */ 

class Either {
	constructor(value) {
		this._value = value;
	}
	
	get value() {
		return this._value;
	}
	
	static left(a) {
		return new Left(a);
	}
	
	static right(a) {
		return new Right(a);
	}
	
	static fromNullable(val) {
		return val !== null && val !== undefined ? Either.right(val) : Either.left(val);
	}
	
	static of(a){
		return Either.right(a);
	}
};

class Left extends Either {
	
	map(_) {		
		return this; // noop
	}
	
	get value() {
		throw new TypeError(["Can't extract the value of a Left(a)."]);
	}
	
	getOrElse(other) {
		return other;
	}
	
	orElse(f) {
		return f(this._value);
	}
	
	chain(f) {
		return this;
	}

	getOrElseThrow(a) {
		throw new Error(a);
	}
	
	filter(f) {
		return this;
	}
	
	get isRight() {
		return false;
	}

	get isLeft() {
		return true;
	}

	toString() {
		return `Either.Left(${this._value})`;
	}
};

class Right extends Either {
	
	map(f) {		
		return Either.of(f(this._value));
	}
	
	getOrElse(other) {
		return this._value;
	}
	
	orElse() {
		return this;
	}
	
	chain(f) {		
		return f(this._value);
	}
	
	getOrElseThrow(_) {
		return this._value;
	}
	
	filter(f) {		
		return Either.fromNullable(f(this._value) ? this._value : null);
	}

	get isRight() {
		return true;
	}

	get isLeft() {
		return false;
	}
	
	toString() {
		return `Either.Right(${this._value})`;
	}
};

class Maybe {
  static just(a) {
     return new Just(a);
  }
  static nothing() {
     return new Nothing();
  }
  static fromNullable(a) { 
     return a !== null && a !== undefined ? Maybe.just(a) : Maybe.nothing();
  }
  static of(a) {
     return Maybe.just(a);
  }
  get isNothing() {
     return false;
  }  
  get isJust() {
     return false;
  }
}
class Just extends Maybe {
   constructor(value) {
      super();
      this._value = value;
   }
   get value() {
      return this._value;
   }   
   map(f) { 
      return Maybe.of(f(this.value));
   }
   chain(f) {		
		return f(this._value);
	 }
   getOrElse() {
      return this.value;
   }
   filter(f) {
   	console.log(Maybe.fromNullable(f(this.value)))
      return Maybe.fromNullable(f(this.value) ? this.value : null);
   } 
   get isJust() {
     return true;
   }
   get isNothing() {
      return false;
   }
   toString () {
     return `Maybe.Just(${this.value})`;
   } 
   tap(f) {
	   f(this)
	   return this
   }  
}
class Nothing extends Maybe {
   map(f) {
    return this; 
   }
   get value()  {
     throw new TypeError(["this is a type error"]);
   }
   chain() {		
		return this;
	 }
   getOrElse(other) {
     return other;
   }  
   filter() {
     return this;
   }
   get isJust() {
     return false;
   }
   get isNothing() {
      return true;
   }
   tap(f) {
	   f(this)
	   return this
   }
   toString() { 
    return 'Maybe.Nothing';
  }
}
//jim:: a -> Either(a)
const jim = (thing) => {
  if (thing) {
  	return Either.of(thing)
  }
  return Either.left(`Sorry, No thing:${thing}`) 
}
//complexThing :: a -> Either(a)
const ed  = ct => Either.fromNullable(ct).map(x=>x*x)

const t = [1,2,3,4,null,undefined]
console.log(t
	          //.filter(x=>ed(x).isRight)
	          .map(y=>ed(y)
	          	.chain(z=>jim("yo, " + z))
	          	.getOrElse("Not In Range"))
	          )

//jim2:: a -> Maybe(a)

const jim2 = thing => Maybe.fromNullable(thing)
const sq = ct => Maybe.fromNullable(ct).map(x=>x*x)
const v = t.map(x=>sq(x))
 	         .filter(y=>y.isJust)
 	         .map(z=>z.chain(s=>sq(s)))

console.log(v.map(x=>x.getOrElse("Failure!")))

console.log(t.map(x=> Maybe.fromNullable(x)))





