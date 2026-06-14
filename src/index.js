import React from 'react';
import ReactDOM from 'react-dom/client';
import { Layout } from '@douyinfe/semi-ui';
import App from './App';
import HeaderBar from './components/HeaderBar';
import reportWebVitals from './reportWebVitals';
import 'semantic-ui-css/semantic.min.css';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
const { Content, Footer, Header } = Layout;
const icpBeian = (process.env.REACT_APP_ICP_BEIAN || '').trim();
root.render(
  <Layout style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fbff, #f3f7ff 45%, #eef4ff)' }}>
    <Header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(148, 163, 184, 0.16)' }}>
      <HeaderBar />
    </Header>
    <Layout style={{ background: 'transparent' }}>
      <Content style={{ padding: '24px' }}>
        <App />
      </Content>
    </Layout>
    {icpBeian && (
      <Footer style={{ textAlign: 'center', padding: '16px 24px', background: 'transparent' }}>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
          {icpBeian}
        </a>
      </Footer>
    )}
  </Layout>
);

reportWebVitals();
