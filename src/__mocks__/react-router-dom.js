// Mock for react-router-dom
const reactRouterDom = jest.createMockFromModule('react-router-dom');

// Mock the Link component to render an anchor tag
reactRouterDom.Link = ({ to, children }) => {
  return children;
};

// Mock the useNavigate hook
reactRouterDom.useNavigate = () => jest.fn();

// Mock the BrowserRouter component to render its children
reactRouterDom.BrowserRouter = ({ children }) => children;

// Mock the Routes component to render its children
reactRouterDom.Routes = ({ children }) => children;

// Mock the Route component to render nothing
reactRouterDom.Route = () => null;

// Mock the Navigate component to render nothing
reactRouterDom.Navigate = () => null;

module.exports = reactRouterDom;
