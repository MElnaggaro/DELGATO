export type TopupMethodKind = 'card' | 'vcash' | 'instapay';

export type TopupMethod = {
  id: string;
  kind: TopupMethodKind;
  label: string;
  /** True for the user's default top-up source. */
  def?: boolean;
};

export const TOPUP_METHODS: TopupMethod[] = [
  { id: 'visa-4232', kind: 'card', label: 'فيزا •••• ٤٢٣٢', def: true },
  { id: 'vcash', kind: 'vcash', label: 'فودافون كاش' },
  { id: 'instapay', kind: 'instapay', label: 'إنستاباي' },
];

export const TOPUP_PRESETS = [50, 100, 200, 500] as const;
