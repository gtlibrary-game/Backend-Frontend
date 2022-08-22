import React from 'react';
import { Link } from 'react-router-dom';
import './hero.styles.scss';

const Hero = () => {
  return (
    <section className="hero is-info is-large hero-image">
      <div className="hero-body">
      <div className="container">
          <h1 className="hero-title">
            Books reimagined for modern life.
          </h1>    
          <Link to='/books'>    
            <div className='shop-now-btn'>
              <button className='button is-black' id='shop-now'>
                Books
              </button>
            </div>   
          </Link>         
        </div>
      </div>
    </section>
  );
}

export default Hero;