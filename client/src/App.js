import { Container } from 'react-bootstrap';
import { BrowserRouter, Switch } from 'react-router-dom';
import { AuthProvider } from './context/auth';
import { MessageProvider } from './context/message';
import AppolloProvider from './AppolloProvider';
import Home from './pages/home/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DynamicRoute from './utils/DynamicRoute';
import './App.scss';

function App() {
  return (
    <AppolloProvider>
      <AuthProvider>
        <MessageProvider>
          <BrowserRouter>
            <Container className="pt-5">
              <Switch>
                <DynamicRoute exact path="/" component={Home} authenticated />
                <DynamicRoute path="/login" component={Login} guest />
                <DynamicRoute path="/register" component={Register} guest />
              </Switch>
            </Container>
          </BrowserRouter>
        </MessageProvider>
      </AuthProvider>
    </AppolloProvider>
  );
}

export default App;
