export interface IssueBlock {
  issue_type: 'itemization' | 'duplicate' | 'panel_unbundling' | 'lab_repeat' | 'pharmacy_itemization' | 
    'blood_services' | 'imaging_component' | 'room_day' | 'er_level' | 'anesthesia_time' | 
    'pricing_high' | 'nsa_request' | 'other';
  title: string;
  amount: number | null;
  lines_in_question: string[];
  why_flagged: string;
  data_requested: string[];
  dispute_paragraph: string;
}

export interface DisputePack {
  report_id: string;
  patient_name: string | null;
  account_id: string | null;
  provider_name: string;
  service_dates: string;
  bill_total: number;
  current_balance: number;
  payer_name: string | null;
  eob_present: 'yes' | 'no';
  nsa_likely: 'yes' | 'no' | 'unknown';
  issue_blocks: IssueBlock[];
  checklist: string[];
  attachments_requested: string[];
}
