import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SeverityBadge from '../components/common/SeverityBadge';

describe('SeverityBadge Visual & Accessible Hierarchy', () => {
  it('renders Critical severity with distinct text label and accessible role', () => {
    render(<SeverityBadge severity="CRITICAL" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Critical');
    expect(badge).toHaveAttribute('aria-label', 'Severity Level: Critical Concern');
    expect(badge.className).toContain('text-red-800');
  });

  it('renders Major severity with orange styling and text cue', () => {
    render(<SeverityBadge severity="MAJOR" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Major');
    expect(badge).toHaveAttribute('aria-label', 'Severity Level: Major Concern');
    expect(badge.className).toContain('text-orange-800');
  });

  it('renders Moderate severity with amber styling', () => {
    render(<SeverityBadge severity="MODERATE" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Moderate');
    expect(badge).toHaveAttribute('aria-label', 'Severity Level: Moderate Precaution');
  });

  it('renders Informational severity with neutral styling', () => {
    render(<SeverityBadge severity="INFORMATIONAL" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Informational');
    expect(badge).toHaveAttribute('aria-label', 'Severity Level: Informational Notice');
  });
});
