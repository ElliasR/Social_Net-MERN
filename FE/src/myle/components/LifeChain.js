import React from 'react';

import LifeYear from './LifeYear';

import './LifeChain.css';

const LifeChain = (props) => {
  const yob = 1900; //props.items.yob;
  const lifespan = 33; //props.items.lifespan;
  const years = [];
  function numberWithOrdinal(n) {
    var s = ['th', 'st', 'nd', 'rd'],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  let i;

  for (i = 0; i < lifespan + 1; i++) {
    years.push({ year: yob + i, ordinal: numberWithOrdinal(i) });
  }
  console.log(years);

  return (
    <ul className="chain-list">
      {years.map((y) => (
        <LifeYear key={y.ordinal} year={y.year} ordinal={y.ordinal} />
      ))}
    </ul>
  );
};

export default LifeChain;
