import { useCallback, useEffect, useState } from 'react';

const useBrowserTab = () => {
    const [isTabActive, setIsTabActive] = useState(document.visibilityState === 'visible');

    const handleVisibilityChange = useCallback(() => {
        setIsTabActive(document.visibilityState === 'visible');
    }, []);

    useEffect(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [handleVisibilityChange]);

    return isTabActive;
};

export default useBrowserTab;
