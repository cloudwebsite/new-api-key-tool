import React, { useEffect, useState } from 'react';
import { Tabs } from '@douyinfe/semi-ui';
import Log from "./pages/Log";
import Pricing from "./pages/Pricing";
import './App.css';

const { TabPane } = Tabs;

const getPageFromHash = () => {
    if (window.location.hash === '#/pricing') {
        return 'pricing';
    }
    return 'logs';
};

function App() {
    const [activePage, setActivePage] = useState(getPageFromHash());

    useEffect(() => {
        const handleHashChange = () => {
            setActivePage(getPageFromHash());
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleTabChange = (key) => {
        setActivePage(key);
        window.location.hash = key === 'pricing' ? '/pricing' : '/';
    };

    return (
        <div className="App-body">
            <Tabs activeKey={activePage} onChange={handleTabChange} type="line">
                <TabPane tab="令牌查询" itemKey="logs">
                    <Log />
                </TabPane>
                <TabPane tab="模型定价" itemKey="pricing">
                    <Pricing />
                </TabPane>
            </Tabs>
        </div>
    );
}

export default App;
