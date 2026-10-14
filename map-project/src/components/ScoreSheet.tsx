import {useEffect} from 'react';

export default function ScoreSheet({ score, trigger }: { score: { score: number; distance: number; name: string }[]; trigger: boolean }) {
    
    useEffect(() => {
        if (trigger) {
            console.log('ScoreSheet triggered with score:', score);
        }
    }, [trigger, score]);
    
    return (
      <div style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        position: 'absolute',
        bottom: '10px',
        left: '200px',
        padding: '1rem',
        width: '400px',
        height: 'auto',
        overflow: 'no-scroll',
        transform: trigger ? `scaleX(-1)` : 'scaleX(1)',
        backgroundColor: '#ffeba1',
        borderRadius: '5px 12px 12px 5px',
        boxShadow: '0 4px 8px #0000000d,0 18px 40px #00000016',
        borderLeft: '5px solid #d7d0bf',
      }}>
        {score.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: '0.5rem',
            borderBottom: '1px solid #d7d0bf',
          }}>
            <span>{item.name}</span>
            <span>{item.score}</span>
          </div>
        ))}
      </div>)
    }