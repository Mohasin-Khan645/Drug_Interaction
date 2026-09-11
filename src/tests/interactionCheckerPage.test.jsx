import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InteractionCheckerPage from '../pages/interactions/InteractionCheckerPage';
import SafetyCheckPage from '../pages/safety/SafetyCheckPage';
import { NotificationProvider } from '../context/NotificationContext';
import { AuthProvider } from '../context/AuthContext';

describe('InteractionCheckerPage & SafetyCheckPage UI Rendering', () => {
  const createTestQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

  it('renders InteractionCheckerPage without blank screen or runtime exceptions', () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <MemoryRouter>
              <InteractionCheckerPage />
            </MemoryRouter>
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    );

    // Verify key titles and UI components render
    expect(screen.getByText(/Multi-Medication Safety & Interaction Checker/i)).toBeInTheDocument();
    expect(screen.getByText(/Medication Selection & Formulary Matrix/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search medication to add/i)).toBeInTheDocument();
  });

  it('renders SafetyCheckPage successfully as a clinical alias', () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <MemoryRouter>
              <SafetyCheckPage />
            </MemoryRouter>
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Multi-Medication Safety & Interaction Checker/i)).toBeInTheDocument();
  });
});

