import React from 'react';
import SuccessRateChart from '../components/SuccessRateChart';
import { ChartBarIcon, TrophyIcon, FireIcon } from '@heroicons/react/24/outline';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ChartBarIcon className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
          </div>
          <p className="text-muted-foreground">
            Track your coding progress and performance across different difficulty levels
          </p>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Success Rate */}
          <div>
            <SuccessRateChart />
          </div>

          {/* Global Success Rate for Comparison */}
          <div>
            <SuccessRateChart showGlobal={true} />
          </div>
        </div>

        {/* Additional Stats Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <TrophyIcon className="h-6 w-6 text-primary" />
            Performance Insights
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tips Card */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center gap-2 mb-3">
                <FireIcon className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-foreground">Tips to Improve</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Practice problems daily to build consistency</li>
                <li>• Focus on understanding patterns, not just solutions</li>
                <li>• Review failed attempts to learn from mistakes</li>
                <li>• Start with easier problems to build confidence</li>
              </ul>
            </div>

            {/* Success Rate Interpretation */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="font-semibold text-foreground mb-3">Success Rate Guide</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex justify-between">
                  <span>Excellent:</span>
                  <span className="text-green-600 dark:text-green-400">80%+</span>
                </div>
                <div className="flex justify-between">
                  <span>Good:</span>
                  <span className="text-blue-600 dark:text-blue-400">60-79%</span>
                </div>
                <div className="flex justify-between">
                  <span>Average:</span>
                  <span className="text-yellow-600 dark:text-yellow-400">40-59%</span>
                </div>
                <div className="flex justify-between">
                  <span>Needs Work:</span>
                  <span className="text-red-600 dark:text-red-400">&lt;40%</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="font-semibold text-foreground mb-3">Recommended Actions</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Based on your performance:</p>
                <ul className="space-y-1 mt-2">
                  <li>• Try more Easy problems if success rate is low</li>
                  <li>• Challenge yourself with Hard problems if doing well</li>
                  <li>• Focus on Medium problems for balanced growth</li>
                  <li>• Review solutions after each attempt</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;