import { useRef, useState } from 'react';
import { FileImage, UploadCloud, X } from 'lucide-react';
import { cx } from '../../lib/format';
import { Button } from './Button';

export function FileUploader({
  onSelect,
  file,
  accept = 'image/png,image/jpeg,image/webp',
  maxSizeMb = 10,
  description,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (candidate) => {
    if (!candidate) return;
    const allowed = accept.split(',').map((type) => type.trim());
    if (!allowed.includes(candidate.type)) {
      setError('That file type is not supported.');
      return;
    }
    if (candidate.size > maxSizeMb * 1024 * 1024) {
      setError(`Files must be ${maxSizeMb} MB or smaller.`);
      return;
    }
    setError(null);
    onSelect(candidate);
  };

  return (
    <div>
      <div
        className={cx(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          dragging ? 'border-brand-500 bg-brand-50' : 'border-line bg-slate-50'
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files && event.dataTransfer.files[0]);
        }}
      >
        <UploadCloud aria-hidden="true" className="mb-3 h-8 w-8 text-brand-600" />
        <p className="text-sm font-medium text-ink">Drag and drop a prescription image</p>
        <p className="mt-1 text-xs text-ink-muted">{description || `PNG, JPEG or WebP · up to ${maxSizeMb} MB`}</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => inputRef.current.click()}>
          Choose file
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          aria-label="Prescription image"
          onChange={(event) => handleFile(event.target.files && event.target.files[0])}
        />
      </div>

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      {file && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-line bg-white px-3 py-2">
          <span className="flex min-w-0 items-center gap-2 text-sm text-ink">
            <FileImage aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-600" />
            <span className="truncate">{file.name}</span>
            <span className="shrink-0 text-xs text-ink-muted">{(file.size / 1024).toFixed(0)} KB</span>
          </span>
          <button type="button" onClick={() => onSelect(null)} aria-label="Remove selected file" className="text-ink-subtle hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
