
'use client';

import dynamic from 'next/dynamic';
import Loading from './loading';
import DashboardClientPage from './DashboardClientPage';

const DashboardPage = () => {
    return (
        <div className="h-full">
            <DashboardClientPage />
        </div>
    );
};

export default dynamic(() => Promise.resolve(DashboardPage), { ssr: false, loading: () => <Loading/> });
