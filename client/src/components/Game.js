import React, { useState, useEffect } from 'react';
import './Game.css';

const emotions = ['😀', '😂', '😍', '🤔', '😢', '😠', '😎', '🥳'];

const Game = ({ onScoreUpdate }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const shuffledEmotions = [...emotions, ...emotions].sort(() => Math.random() - 0.5);
    setCards(shuffledEmotions.map((emotion, index) => ({ id: index, emotion })));
  }, []);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].emotion === cards[second].emotion) {
        setSolved([...solved, first, second]);
        const newScore = score + 1;
        setScore(newScore);
        if (onScoreUpdate) onScoreUpdate(newScore);
      }
      setTimeout(() => setFlipped([]), 1000);
    }
  }, [flipped, cards, solved, score, onScoreUpdate]);

  useEffect(() => {
    if (cards.length > 0 && solved.length === cards.length) {
      setTimeout(() => {
        const shuffledEmotions = [...emotions, ...emotions].sort(() => Math.random() - 0.5);
        setCards(shuffledEmotions.map((emotion, index) => ({ id: index, emotion })));
        setFlipped([]);
        setSolved([]);
      }, 1500);
    }
  }, [solved, cards]);

  const handleClick = id => {
    if (flipped.length < 2 && !flipped.includes(id) && !solved.includes(id)) {
      setFlipped([...flipped, id]);
    }
  };

  return (
    <div className="game-card card">
      <h3>Memory Match</h3>
      <p>Match the pairs of emotions!</p>
      <div className="game-grid">
        {cards.map(card => (
          <div
            key={card.id}
            className={`memory-card ${flipped.includes(card.id) || solved.includes(card.id) ? 'flipped' : ''}`}
            onClick={() => handleClick(card.id)}
          >
            <div className="card-inner">
              <div className="card-front"></div>
              <div className="card-back">{card.emotion}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="score">Score: {score}</div>
    </div>
  );
};

export default Game;