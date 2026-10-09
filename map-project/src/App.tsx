import { useEffect, useState } from 'react';
import MapController from './components/MapController';

function App() {

  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    const body = document.body;
    const originalStyle = body.getAttribute('style');
    const root = document.getElementById('root');
    const originalRootStyle = root?.getAttribute('style');

    Object.assign(body.style, {
      fontFamily: "'CartoonFont', sans-serif",
      margin: '0',
      padding: '2% 8%',
      backgroundImage: `url("${new URL('./assets/abstract-white-painted-wall-texture.jpg', import.meta.url)}")`,
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'repeat',
      backgroundPosition: 'top left',
      backgroundSize: '800px',
    });
    if (root) root.style.position = 'relative';

    let loadedFont: FontFace | undefined;
    let cancelled = false;
    const font = new FontFace(
      'CartoonFont',
      `url("${new URL('./assets/fonts/From Cartoon Blocks.ttf', import.meta.url)}")`,
      { weight: 'normal', style: 'normal' },
    );

    font.load()
      .then((loaded) => {
        if (cancelled) return;
        loadedFont = loaded;
        document.fonts.add(loaded);
      })
      .catch((error: unknown) => {
        console.error('Unable to load the CartoonFont font.', error);
      });

    return () => {
      cancelled = true;
      if (loadedFont) document.fonts.delete(loadedFont);
      if (originalStyle === null) {
        body.removeAttribute('style');
      } else {
        body.setAttribute('style', originalStyle);
      }
      if (root) {
        if (originalRootStyle === null) {
          root.removeAttribute('style');
        } else if (originalRootStyle !== undefined) {
          root.setAttribute('style', originalRootStyle);
        }
      }
    };
  }, []);

  return (
    <div style={{
      backgroundImage: `url("${new URL('./assets/white-texture_1160-786.avif', import.meta.url)}")`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      filter: 'drop-shadow(0 0 5px rgba(99, 99, 99, 0.2))',
      minHeight: '100%',
      padding: '2%',
      clipPath: 'polygon(0 0, 100% 0, 100% 93.5%, 87% 100%, 0 100%)',
      perspective: '1000px',
      transformStyle: 'preserve-3d',
      transform: trigger ? 'rotateY(180deg)' : 'none',
      transition: 'transform 0.2s ease',
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'hidden',
      }}>
        <div style={{
          fontSize: '6rem',
          visibility: !trigger ? 'visible' : 'hidden',
          fontWeight: 'bold',
          width: '100%',
          textAlign: 'center',
        }}>Delaware Map</div>
        <MapController trigger={trigger} setTrigger={setTrigger} />
      </div>
    </div>
  )
}

export default App
