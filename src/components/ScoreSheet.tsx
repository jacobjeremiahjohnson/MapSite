import { useEffect, useRef, useState } from 'react';
import { useScoreApi } from '../functions/postUserScore';
import { useTrigger } from '../functions/TriggerContext';

type ScoreItem = {
  score: number;
  distance: number;
  name: string;
};

export default function ScoreSheet({
  score,
  isLoading
}: {
  score: ScoreItem[];
  isLoading: boolean;
}) {

  const { trigger } = useTrigger();
  const [displayedText, setDisplayedText] = useState<string[]>([]);
  const { postScore } = useScoreApi();
  const hasPosted = useRef(false);

  useEffect(() => {

    if (!trigger) {
      hasPosted.current = false;   // reset so the next round can post again
      return;
    }
    if (hasPosted.current || score.length === 0) return;
    hasPosted.current = true;

    const uniqueItems = [...new Map(score.map((item) => [item.name, item])).values()];
    const total = uniqueItems.reduce((sum, item) => sum + item.score, 0);
    console.log("Score", total)
    postScore({ score: total })  
      .then((response) => console.log('Score posted successfully:', response))
      .catch((error) => console.error('Error posting score:', error));
  }, [trigger, score]);

  useEffect(() => {
    if (!trigger) {
      setDisplayedText([]);
      return;
    }

    // Remove duplicates based on name and calculate total score

    const uniqueItems = [...new Map(score.map((item) => [item.name, item])).values()];
    const total = uniqueItems.reduce((total, item) => total + item.score, 0);
    const lines = [
      ...uniqueItems.map((item) => `${item.name}          ${item.score}`),
      `Total      ${total}`,
    ];

    const fullText = lines.join('\n');
    let charIndex = 0;

    setDisplayedText([]);

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        charIndex++;

        const currentText = fullText.slice(0, charIndex);
        setDisplayedText(currentText.split('\n'));

        if (charIndex >= fullText.length) {
          clearInterval(interval);
        }
      }, 20); // Lower = faster typing

      intervalId = interval;
    }, 1000)

    let intervalId: ReturnType<typeof setInterval>;

    return () => {
      clearTimeout(timeout);
      clearInterval(intervalId);
    }

  }, [trigger, score]);

  if (isLoading) return (null);

  return (
      <div
        style={{
        fontSize: '1.5rem',
        fontFamily: "'Comic Sans MS', 'Comic Sans', cursive",
        fontWeight: 'bold',
        position: 'absolute',
        bottom: '10px',
        left: '50px',
        padding: '1rem',
        width: '400px',
        height: 'auto',
        overflow: 'hidden',
        transform: trigger ? 'scaleX(-1)' : 'scaleX(1)',
        backgroundColor: '#ffeba1',
        borderRadius: '5px 12px 12px 5px',
        boxShadow: '0 4px 8px #0000000d, 0 18px 40px #00000016',
        borderLeft: '5px solid #d7d0bf',
      }}
    >
      {displayedText.map((line, index) => {

        const isTotal = index === score.length;
        return(
        <div
          key={index}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            fontStyle: isTotal ? 'italic' : 'none',
            padding: '0.5rem',
            borderBottom: '1px solid #d7d0bf',
          }}
        >
          <span>{line.split(/\s{2,}/)[0]}</span>
          <span>{line.split(/\s{2,}/)[1] ?? ''}</span>
        </div>
      )})}
    </div>
  );
}