'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { API_URL } from '@/lib/api-config';

interface QualityMeasure {
  id: string;
  facility_id: string;
  measure_name: string;
  measure_value: number;
  comparison: string;
  reporting_period: string;
}

export default function QualityMeasuresPage() {
  const { user, token } = useAuth();
  const [measures, setMeasures] = useState<QualityMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQualityMeasures();
  }, [token]);

  const fetchQualityMeasures = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/quality-measures`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMeasures(data.measures || []);
      } else if (response.status === 404) {
        setMeasures([]);
      } else {
        setError('Failed to load quality measures');
      }
    } catch (err) {
      setError('Failed to load quality measures');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please log in to access quality measures.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Quality Measures</h1>
        <p className="text-lg text-gray-600 mt-3">Review SNF QRP (Skilled Nursing Facility Quality Reporting Program) quality measures and performance comparisons</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">About Quality Measures</h3>
        <p className="text-gray-700 text-sm">
          Quality Measures are based on MDS (Minimum Data Set) resident assessments and reported through the SNF Quality Reporting Program (SNF QRP). These measures indicate the percentage of residents experiencing certain outcomes or receiving specific care processes.
        </p>
      </div>

      {/* Quality Measures Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">CMS Quality Measures</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading quality measures...</p>
          </div>
        ) : measures.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No quality measures data available. Quality measure data is reported quarterly to CMS and will appear here once available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Facility</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Measure Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Value</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Comparison</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Period</th>
                </tr>
              </thead>
              <tbody>
                {measures.map((measure, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700 font-medium">{measure.facility_id}</td>
                    <td className="px-6 py-4 text-gray-700">{measure.measure_name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                        {measure.measure_value}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        measure.comparison === 'Better'
                          ? 'bg-green-100 text-green-700'
                          : measure.comparison === 'Worse'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {measure.comparison}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">{measure.reporting_period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
