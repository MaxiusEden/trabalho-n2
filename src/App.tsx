import { BrowserRouter as Router } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { AppRouter } from './routers/app.routers';

function App() {
  return (
    <Router>
      <div className="d-flex vh-100 bg-body">
        <Sidebar />
        <div className="d-flex flex-column flex-grow-1 overflow-auto">
          <main className="p-3">
            <AppRouter />
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
