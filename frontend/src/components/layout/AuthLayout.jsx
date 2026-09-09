import { Outlet } from 'react-router-dom';
import { BookOpen, ShieldCheck, Stethoscope } from 'lucide-react';
import { Logo } from './Logo';
import { DISCLAIMER } from '../../lib/constants';

const PILLARS = [
  { icon: ShieldCheck, title: 'Deterministic safety rules', text: 'Curated clinical rules decide every finding — never a language model.' },
  { icon: BookOpen, title: 'Traceable evidence', text: 'Each finding links to the source, version and review date behind it.' },
  { icon: Stethoscope, title: 'Clinician in the loop', text: 'Pharmacists and doctors review, annotate and sign off findings.' },
];

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <section className="hidden w-1/2 flex-col justify-between bg-brand-900 px-10 py-12 text-white lg:flex">
        <Logo className="[&_span:first-child]:bg-white/10 [&_span_span]:text-white" />
        <div>
          <h1 className="max-w-md text-3xl font-semibold leading-tight">
            Medication safety intelligence for clinical teams
          </h1>
          <p className="mt-3 max-w-md text-sm text-brand-100">
            Interaction, allergy, duplication and patient-factor screening with evidence you can cite.
          </p>
          <ul className="mt-8 space-y-5">
            {PILLARS.map((pillar) => (
              <li key={pillar.title} className="flex gap-3">
                <pillar.icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-200" />
                <div>
                  <p className="text-sm font-medium">{pillar.title}</p>
                  <p className="text-sm text-brand-100">{pillar.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="max-w-md text-xs text-brand-200">{DISCLAIMER}</p>
      </section>

      <section className="flex w-full flex-col items-center justify-center px-4 py-10 sm:px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <Outlet />
        </div>
      </section>
    </div>
  );
}
