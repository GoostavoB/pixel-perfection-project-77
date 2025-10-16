import { DisputePack, IssueBlock } from '@/types/disputePack';

export const generateDisputePack = (analysis: any): DisputePack => {
  console.log('🔍 Generating dispute pack from analysis:', analysis);
  
  const a = analysis.full_analysis || analysis;
  console.log('📋 Processing analysis data:', { 
    hospital_name: a.hospital_name,
    provider_name: a.provider_name, 
    facility_name: a.facility_name,
    date_of_service: a.date_of_service,
    service_date: a.service_date,
    total_bill_amount: a.total_bill_amount,
    total_charged: a.total_charged,
    charges: a.charges?.length,
    line_items: a.line_items?.length,
    cpt_codes: a.cpt_codes?.length,
    tags: a.tags
  });
  
  const issueBlocks: IssueBlock[] = [];
  
  // Extract provider name from multiple possible fields
  const providerName = a.hospital_name || a.provider_name || a.facility_name || a.provider || 'Provider';
  
  // Extract service dates from multiple possible fields
  const serviceDates = a.date_of_service || a.service_date || a.dates || a.service_dates || 'unknown';
  
  // Extract bill total from multiple possible fields
  const billTotal = parseFloat(a.total_bill_amount || a.total_charged || a.bill_total || a.total_amount || a.billed_amount || 0);
  
  // Extract charges/line items from multiple possible locations
  const charges = a.charges || a.line_items || a.cpt_codes || [];
  console.log('💰 Extracted charges:', charges);
  
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
  const pharmacyCharges = charges.filter((c: any) => {
    const desc = (c.description || c.line_description || c.service_description || '').toLowerCase();
    return desc.includes('pharmacy') || desc.includes('medication') || desc.includes('drug');
  });
  
  if (pharmacyCharges.length > 0) {
    const totalAmount = pharmacyCharges.reduce((sum: number, c: any) => 
      sum + (parseFloat(c.charge_amount || c.billed_amount || c.amount || c.price || 0)), 0
    );
    
    issueBlocks.push({
      issue_type: 'pharmacy_itemization',
      title: 'Pharmacy aggregates need NDC detail',
      amount: totalAmount,
      lines_in_question: pharmacyCharges.map((c: any) => 
        c.description || c.line_description || c.service_description || 'Pharmacy charge'
      ),
      why_flagged: 'Aggregate lines lack NDC, dose, quantity, dates.',
      data_requested: ['NDC', 'Drug name', 'Dose', 'Quantity', 'Administration date'],
      dispute_paragraph: `The pharmacy charges totaling $${totalAmount.toFixed(2)} lack item details. Please provide NDC codes, drug names, doses, quantities, and dates, mapped to each pharmacy line.`
    });
  }
  
  // Check for missing itemization - check tags first, then charges
  const tags = Array.isArray(a.tags) ? a.tags : [];
  const needsItemization = tags.some((t: any) => {
    const tagStr = typeof t === 'string' ? t : t?.tag || t?.name || '';
    return tagStr.toLowerCase().includes('itemization');
  });
  
  const missingCodes = charges.filter((c: any) => !c.cpt_code || c.cpt_code === 'N/A' || c.cpt_code === '');
  
  if (needsItemization || missingCodes.length > 0) {
    const missingAmount = missingCodes.reduce((sum: number, c: any) => 
      sum + (parseFloat(c.charge_amount || c.billed_amount || c.amount || c.price || 0)), 0
    );
    
    const lineDescriptions = missingCodes.length > 0 
      ? missingCodes.slice(0, 5).map((c: any) => 
          c.description || c.line_description || c.service_description || 'Unlabeled charge'
        )
      : ['Multiple aggregate lines across various categories'];
    
    issueBlocks.push({
      issue_type: 'itemization',
      title: 'Complete itemization required',
      amount: missingAmount > 0 ? missingAmount : null,
      lines_in_question: lineDescriptions,
      why_flagged: 'Summary bill without CPT or HCPCS codes.',
      data_requested: ['CPT or HCPCS', 'Modifiers', 'Units', 'Revenue codes', 'Provider NPI or tax ID'],
      dispute_paragraph: `This bill contains ${missingCodes.length > 0 ? missingCodes.length : 'multiple'} aggregate line items without CPT or HCPCS codes${missingAmount > 0 ? ` totaling $${missingAmount.toFixed(2)}` : ''}. Please provide a complete itemized bill for ${serviceDates} with CPT/HCPCS codes, modifiers, units, revenue codes, and provider NPI or tax ID for each line item.`
    });
  }
  
  // NSA request - check for emergency room charges
  const hasER = charges.some((c: any) => {
    const desc = (c.description || c.line_description || c.service_description || '').toLowerCase();
    return desc.includes('emergency') || desc.includes('er ') || desc.includes('ed ');
  });
  
  if (hasER || a.nsa_protected || nsaStatus === 'yes') {
    issueBlocks.push({
      issue_type: 'nsa_request',
      title: 'No Surprises Act protections and network status',
      amount: null,
      lines_in_question: hasER ? ['Emergency room services'] : ['Out-of-network services'],
      why_flagged: hasER ? 'Emergency care detected. Network status unknown.' : 'Potential NSA scenario detected.',
      data_requested: ['Facility network status', 'Clinician network status', 'Notice and consent forms'],
      dispute_paragraph: `Please confirm the network status of the facility and all treating clinicians for services on ${serviceDates}. Provide any notice and consent forms that were signed. Under the No Surprises Act, if this was emergency care or involved out-of-network ancillary providers at an in-network facility, I am only responsible for in-network cost-sharing amounts.`
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
  
  const reportId = `HBC-${providerName.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${(a.session_id || a.id || 'XXXX').substring(0, 4)}`;
  
  console.log('✅ Generated dispute pack:', {
    report_id: reportId,
    provider_name: providerName,
    service_dates: serviceDates,
    bill_total: billTotal,
    issue_blocks_count: issueBlocks.length,
    issue_types: issueBlocks.map(b => b.issue_type)
  });
  
  return {
    report_id: reportId,
    patient_name: a.patient_name || a.name || null,
    account_id: a.account_number || a.account_id || null,
    provider_name: providerName,
    service_dates: serviceDates,
    bill_total: billTotal,
    current_balance: billTotal,
    payer_name: a.insurance_company || a.payer_name || a.insurer || null,
    eob_present: a.has_eob || a.eob_present ? 'yes' : 'no',
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
