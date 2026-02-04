import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const AnalyticsTracker = () => {
    const location = useLocation();
    const [initialized, setInitialized] = useState(false);
    // Use the environment variable for the Measurement ID
    const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

    useEffect(() => {
        if (GA_MEASUREMENT_ID && !initialized) {
            ReactGA.initialize(GA_MEASUREMENT_ID);
            setInitialized(true);
        }
    }, [GA_MEASUREMENT_ID, initialized]);

    useEffect(() => {
        if (initialized) {
            ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
        }
    }, [location, initialized]);

    return null;
};

export default AnalyticsTracker;
