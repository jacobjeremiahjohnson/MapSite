import './App.css';
import MapController from './components/MapController';

function App() {

  return (
    <div className="App">
      <div id="map-container">
        <div className="menu-title">Delaware Map</div>
        <MapController />
      </div>
    </div>
  )
}

export default App
