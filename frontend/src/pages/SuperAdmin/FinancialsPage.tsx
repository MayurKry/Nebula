const FinancialsPage = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Financials</h1>
                <p className="text-gray-400 mt-1">Cost monitoring and protection</p>
            </div>

            {/* Placeholder */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 text-lg">
                    Financial monitoring dashboard coming soon
                </p>
                <p className="text-gray-500 text-sm mt-2">
                    This will include cost visibility, daily/monthly thresholds, and emergency controls
                </p>
            </div>
        </div>
    );
};

export default FinancialsPage;
