import { useState } from 'react';
import { X } from 'lucide-react';

interface SaveTemplateModalProps {
  defaultName: string;
  onSave: (templateName: string) => void;
  onClose: () => void;
}

export function SaveTemplateModal({ defaultName, onSave, onClose }: SaveTemplateModalProps) {
  const [templateName, setTemplateName] = useState(defaultName);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (templateName.trim()) {
      onSave(templateName.trim());
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Save as Template</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-accent rounded transition-colors"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Push Day A"
              className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-md
                       text-primary placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={!templateName.trim()}
            >
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
