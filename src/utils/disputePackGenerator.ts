import { DisputePack, IssueBlock } from '@/types/disputePack';

export const generateDisputePack = (analysis: any): DisputePack => {
  const a = analysis.full_analysis || analysis;
  
  const issueBlocks: IssueBlock[] = [];
  
  // Determine NSA status
  const nsaReview = a.duplicate_findings?.nsa_review || a.nsa_review || {};
  const nsaStatus = nsaReview.applies === 'yes' ? 'yes' : nsaReview.applies === 'no' ? 'no' : 'unknown';
  
  // Process duplicate findings for blood services
  const duplicateFindings = a.duplicate_findings?.flags || [];
  const bloodDuplicates = duplicateFindings.filter((flag: any) => 
    flag.reason?.toLowerCase().includes('blood') || 
    flag.evidence?.codes?.some((c: any) => c.value?.toLowerCase().includes('blood'))
  );
  
  if (bloodDuplicates.length > 0) {
    const totalAmount = bloodDuplicates.reduce((sum: number, flag: any) => 
      sum + (flag.evidence?.prices?.reduce((s: number, p: number) => s + p, 0) || 0), 0
    );
    
    issueBlocks.push({
      issue_type: 'blood_services',
      title: 'Blood administration and components appear multiple times',
      amount: totalAmount,
      lines_in_question: bloodDuplicates.map((f: any) => f.reason || 'Blood service charge'),
      why_flagged: 'Multiple blood related aggregates in same stay. No codes or units. Could be split billing.',
      data_requested: ['CPT or HCPCS', 'Revenue codes', 'Product codes and units', 'MAR with dates and times'],
      dispute_paragraph: `Two or more blood related lines totaling $${totalAmount.toFixed(2)} appear during the same stay. Please provide CPT or HCPCS, revenue codes, blood product codes with units, administration dates and times, and the medication administration record. If these represent one episode split across categories, please remove the extra charge.`
    });
  }
  
  // Process pharmacy charges
  const pharmacyCharges = (a.charges || []).filter((c: any) => 
    c.description?.toLowerCase().includes('pharmacy') || 
    c.line_description?.toLowerCase().includes('pharmacy')
  );
  
  if (pharmacyCharges.length > 0) {
    const totalAmount = pharmacyCharges.reduce((sum: number, c: any) => 
      sum + (parseFloat(c.charge_amount || c.billed_amount || 0)), 0
    );
    
    issueBlocks.push({
      issue_type: 'pharmacy_itemization',
      title: 'Pharmacy aggregates need NDC detail',
      amount: totalAmount,
      lines_in_question: pharmacyCharges.map((c: any) => c.description || c.line_description),
      why_flagged: 'Aggregate lines lack NDC, dose, quantity, dates.',
      data_requested: ['NDC', 'Drug name', 'Dose', 'Quantity', 'Administration date'],
      dispute_paragraph: 'The pharmacy charges listed lack item details. Please provide NDC codes, drug names, doses, quantities, and dates, mapped to each pharmacy line.'
    });
  }
  
  // Check for missing itemization
  const missingCodes = (a.charges || []).filter((c: any) => !c.cpt_code || c.cpt_code === 'N/A');
  if (missingCodes.length > 0) {
    issueBlocks.push({
      issue_type: 'itemization',
      title: 'Global itemization request',
      amount: null,
      lines_in_question: ['Multiple aggregate lines across various categories'],
      why_flagged: 'Summary bill without CPT or HCPCS codes.',
      data_requested: ['CPT or HCPCS', 'Modifiers', 'Units', 'Revenue codes', 'Provider NPI or tax ID'],
      dispute_paragraph: `Many lines are aggregate categories without CPT or HCPCS codes. Please provide a complete itemized bill for ${a.date_of_service || 'the service dates'} with codes, modifiers, units, revenue codes, and provider NPI or tax ID.`
    });
  }
  
  // NSA request
  const hasER = (a.charges || []).some((c: any) => 
    c.description?.toLowerCase().includes('emergency') || 
    c.line_description?.toLowerCase().includes('emergency')
  );
  
  if (hasER || a.nsa_protected) {
    issueBlocks.push({
      issue_type: 'nsa_request',
      title: 'NSA protections and network status',
      amount: null,
      lines_in_question: ['Emergency services and provider network status'],
      why_flagged: 'ER charge present or NSA scenario detected. Network status unknown.',
      data_requested: ['Facility network status', 'Clinician network status', 'Notice and consent forms'],
      dispute_paragraph: `Please confirm network status for the facility and all clinicians for ${a.date_of_service || 'these dates'} and provide any notice and consent forms. If emergency care or out-of-network ancillary services occurred at an in-network facility, I will pay only in-network cost-sharing under the No Surprises Act.`
    });
  }
  
  // Build checklist
  const checklist: string[] = [];
  if (issueBlocks.some(b => b.issue_type === 'itemization')) {
    checklist.push('Complete itemized bill with CPT/HCPCS, modifiers, units, revenue codes');
  }
  if (issueBlocks.some(b => b.issue_type === 'pharmacy_itemization')) {
    checklist.push('Pharmacy NDC detail with doses and quantities');
  }
  if (issueBlocks.some(b => b.issue_type === 'blood_services')) {
    checklist.push('Blood product documentation and MAR with times');
  }
  if (!a.has_eob) {
    checklist.push('EOB from insurer with allowed amounts');
  }
  if (issueBlocks.some(b => b.issue_type === 'nsa_request')) {
    checklist.push('Network status and any consent forms');
  }
  
  return {
    report_id: `HBC-${a.hospital_name?.substring(0, 3).toUpperCase() || 'XXX'}-${new Date().getFullYear()}-${a.session_id?.substring(0, 4) || 'XXXX'}`,
    patient_name: a.patient_name || null,
    account_id: a.account_number || null,
    provider_name: a.hospital_name || 'Provider',
    service_dates: a.date_of_service || 'unknown',
    bill_total: parseFloat(a.total_bill_amount || a.total_charged || 0),
    current_balance: parseFloat(a.total_bill_amount || a.total_charged || 0),
    payer_name: a.insurance_company || null,
    eob_present: a.has_eob ? 'yes' : 'no',
    nsa_likely: nsaStatus,
    issue_blocks: issueBlocks,
    checklist,
    attachments_requested: [
      'EOB',
      'Itemized bill',
      'Operative report',
      'MAR',
      'Radiology report',
      'Network status',
      'Notice and consent forms'
    ]
  };
};

export const generateBillingEmail = (pack: DisputePack, patientPhone?: string, patientEmail?: string): string => {
  const subject = `Request for itemized review and corrections for account ${pack.account_id || '[account_id]'}`;
  
  const body = `Hello Billing Team,

I am requesting an itemized review for account ${pack.account_id || '[account_id]'}, service dates ${pack.service_dates}, provider ${pack.provider_name}. Please send an itemized bill with CPT or HCPCS for each line, modifiers, units, revenue codes, and provider NPI or tax ID. For medications, include NDC codes, doses, quantities, and dates. For blood services, include product codes, units transfused, administration dates and times, and the medication administration record.

Below are specific items that require correction or documentation:

${pack.issue_blocks.map(block => block.dispute_paragraph).join('\n\n')}

Please confirm receipt and the expected turnaround time.

Thank you,
${pack.patient_name || '[Your Name]'}
${patientPhone ? `Phone: ${patientPhone}` : ''}
${patientEmail ? `Email: ${patientEmail}` : ''}`;

  return `Subject: ${subject}\n\n${body}`;
};

export const generateInsuranceEmail = (pack: DisputePack): string => {
  const subject = `Request for EOB and review of potential charges for account ${pack.account_id || '[account_id]'}`;
  
  const body = `Hello,

Please share the EOB for account ${pack.account_id || '[account_id]'}, service dates ${pack.service_dates}. I also request a review of the items listed below for potential duplicates, unbundling, or pricing errors. If any lines were denied as duplicate, please state the denial codes.

${pack.issue_blocks.map(block => `• ${block.title}: ${block.amount ? `$${block.amount.toFixed(2)}` : 'Review needed'}`).join('\n')}

Thank you.`;

  return `Subject: ${subject}\n\n${body}`;
};
