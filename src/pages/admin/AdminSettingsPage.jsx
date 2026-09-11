import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, Bell, Save } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useNotifications } from '../../context/NotificationContext';

export default function AdminSettingsPage() {
  const { addToast } = useNotifications();

  const handleSave = () => {
    addToast({
      title: 'Settings Saved',
      message: 'Platform configuration updated successfully.',
      type: 'success',
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
          System Administration
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Platform Configuration & Clinical Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure rule engine sensitivity, automatic compendia sync schedules, and security retention.
        </p>
      </div>

      <Card title="Clinical Decision Support Engine Parameters" subtitle="Sensitivity and rule execution settings">
        <div className="space-y-4 text-xs">
          <Select
            label="Default CDS Engine Sensitivity"
            options={[
              { value: 'ALL', label: 'Strict - Flag Critical, Major, Moderate, and Minor' },
              { value: 'MAJOR_CRITICAL', label: 'Standard - Flag Critical and Major Only' },
            ]}
          />
          <Select
            label="RxNorm Normalization Threshold"
            options={[
              { value: '0.85', label: 'High Confidence (Score >= 0.85)' },
              { value: '0.70', label: 'Moderate Confidence (Score >= 0.70)' },
            ]}
          />
        </div>
      </Card>

      <Card title="Regulatory & Audit Retention" subtitle="HIPAA compliance parameters">
        <div className="space-y-4 text-xs">
          <Select
            label="Audit Log Retention Period"
            options={[
              { value: '7_YEARS', label: '7 Years (HIPAA Standard)' },
              { value: '10_YEARS', label: '10 Years (Extended Clinical Trial Standard)' },
            ]}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" size="md" onClick={handleSave} icon={Save} className="text-xs font-bold">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
