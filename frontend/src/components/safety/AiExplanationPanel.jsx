import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { aiApi } from '../../api/aiApi';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import { Textarea } from '../ui/Input';
import { Alert, ErrorState, Spinner } from '../ui/Feedback';
import { EvidenceCard } from './EvidenceCard';
import { errorMessage } from '../../lib/format';

const INSUFFICIENT = 'INSUFFICIENT_VERIFIED_EVIDENCE';

/**
 * The panel presents an explanation of verified findings. It never phrases
 * output as advice, a diagnosis, or a prescription.
 */
export function AiExplanationPanel({ open, onClose, finding, safetyCheckId }) {
  const [question, setQuestion] = useState('');
  const mutation = useMutation({
    mutationFn: (value) =>
      aiApi.explain({ question: value, findingId: finding ? finding.id : undefined, safetyCheckId }),
  });

  const result = mutation.data;
  const insufficient =
    result && typeof result.answer === 'string' && result.answer.includes(INSUFFICIENT);

  return (
    <Drawer open={open} onClose={onClose} title="Evidence-based explanation" width="w-full sm:w-[32rem]">
      <div className="space-y-4 p-4">
        <Alert tone="brand" icon={Sparkles} title="AI-generated explanation based on verified evidence.">
          The assistant can only summarise findings the safety engine already produced and evidence already stored. It
          does not diagnose, prescribe, or change medication.
        </Alert>

        {finding && (
          <div className="rounded-lg border border-line bg-slate-50 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Verified finding</p>
            <p className="mt-0.5 text-sm font-medium text-ink">{finding.title}</p>
            <p className="text-sm text-ink-muted">{finding.description}</p>
          </div>
        )}

        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (question.trim().length >= 5) mutation.mutate(question.trim());
          }}
        >
          <Textarea
            label="Question"
            required
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What does this interaction mean in plain language?"
            hint="Minimum 5 characters."
          />
          <Button type="submit" loading={mutation.isPending} icon={Sparkles} disabled={question.trim().length < 5}>
            Explain
          </Button>
        </form>

        {mutation.isPending && <Spinner label="Retrieving verified evidence…" />}

        {mutation.isError && (
          <ErrorState
            title="Explanation unavailable"
            description={errorMessage(mutation.error, 'The explanation service could not be reached.')}
          />
        )}

        {result && (
          <section className="space-y-3">
            {insufficient ? (
              <Alert tone="warning" title="Insufficient verified evidence available.">
                No stored evidence supports an explanation for this question.
              </Alert>
            ) : (
              <div className="rounded-lg border border-line bg-white px-3 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">AI explanation</p>
                <p className="mt-1 whitespace-pre-line text-sm text-ink">{result.answer}</p>
              </div>
            )}

            {result.grounding && result.grounding.evidence && result.grounding.evidence.length > 0 && (
              <div className="space-y-2">
                <p className="section-title">Sources</p>
                {result.grounding.evidence.map((item, index) => (
                  <EvidenceCard key={`${item.sourceName}-${index}`} evidence={item} />
                ))}
              </div>
            )}

            {result.disclaimer && <p className="text-xs text-ink-muted">{result.disclaimer}</p>}
          </section>
        )}
      </div>
    </Drawer>
  );
}
