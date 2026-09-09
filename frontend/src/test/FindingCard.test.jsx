import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FindingCard } from '../components/safety/FindingCard';

const finding = {
  id: 'finding-1',
  severity: 'MAJOR',
  category: 'DRUG_DRUG',
  status: 'REVIEW_REQUIRED',
  title: 'Increased bleeding risk',
  description: 'Warfarin with ibuprofen increases bleeding risk.',
  clinicalEffect: 'Elevated INR and bleeding.',
  subjectDrugIds: ['drug-a', 'drug-b'],
  evidence: [],
};

describe('FindingCard', () => {
  it('states the severity in words, not colour alone', () => {
    render(<FindingCard finding={finding} />);
    expect(screen.getByText('Major')).toBeInTheDocument();
    expect(screen.getByText('Review required')).toBeInTheDocument();
  });

  it('names the affected medications when they are known', () => {
    render(<FindingCard finding={finding} drugNames={{ 'drug-a': 'Warfarin', 'drug-b': 'Ibuprofen' }} />);
    expect(screen.getByText(/Warfarin, Ibuprofen/)).toBeInTheDocument();
  });

  it('asks for an explanation of the existing finding only when requested', async () => {
    const onExplain = vi.fn();
    render(<FindingCard finding={finding} defaultOpen onExplain={onExplain} />);
    await userEvent.click(screen.getByRole('button', { name: /explain/i }));
    expect(onExplain).toHaveBeenCalledTimes(1);
  });
});
