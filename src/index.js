import React from 'react';
import ReactDOM from 'react-dom/client';
import { Layout } from '@douyinfe/semi-ui';
import App from './App';
import HeaderBar from './components/HeaderBar';
import reportWebVitals from './reportWebVitals';
import 'semantic-ui-css/semantic.min.css';
import './index.css';
import { ThemeProvider } from './context/Theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
const { Content, Footer, Header } = Layout;
const icpBeian = (process.env.REACT_APP_ICP_BEIAN || '').trim();
root.render(
  <ThemeProvider>
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <HeaderBar />
      </Header>
      <Layout>
        <Content style={{ 
          padding: '24px',
          '@media screen and (max-width: 768px)': {
            padding: '12px'
          }
        }}>
          <App />
        </Content>
      </Layout>
      {icpBeian && (
        <Footer style={{ textAlign: 'center', padding: '16px 24px' }}>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
            {icpBeian}
          </a>
        </Footer>
      )}
    </Layout>
  </ThemeProvider>
);

reportWebVitals();
