import React from 'react';

import Card from '../../shared/components/UIElements/Card';

import './LifeYear.css';

const LifeYear = (props) => {
  return (
    <li className="year-item">
      <Card className="year-item__content">
        <a href="/#">
          <div className="year-item__ordinal">
            <h2>{props.ordinal}</h2>
          </div>
          <div className="year-item__info">
            <h2>{props.year}</h2>
          </div>
        </a>
      </Card>
    </li>
  );
};

export default LifeYear;
