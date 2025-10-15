# No Surprises Act (NSA) Knowledge Base

## What the NSA is

A U.S. federal law in effect since 2022 that stops most surprise balance bills for:

* Emergency care, including most post-stabilization
* Non-emergency care by out-of-network clinicians at in-network facilities when the patient did not get valid notice and consent
* Out-of-network air ambulance services

Cost sharing must be as if in-network. Disputes over payment go to a federal Independent Dispute Resolution process between plans and providers. Patients are kept out of that fight.

## Core Legal Citations

* **45 CFR 149.110**: Emergency services protections and in-network cost sharing
* **45 CFR 149.420**: Non-emergency services at in-network facilities and the limits on notice-and-consent
* **45 CFR 149.430**: Required patient disclosures about balance-billing protections
* **45 CFR 149.440**: Air ambulance protections
* **45 CFR 149.510-149.520**: Federal IDR process
* **45 CFR 149.610**: Good Faith Estimates (GFE) for uninsured or self-pay
* **45 CFR 149.620**: Patient-Provider Dispute Resolution (PPDR) when the bill exceeds the GFE by at least $400

## What is NEVER Allowed to be Balance Billed

Flag these as violations if billed above in-network cost sharing:

### Emergency Services (45 CFR 149.110)
* Any emergency services before stabilization
* Post-stabilization services until all notice-and-consent requirements are satisfied and transfer is safe (45 CFR 149.110(c)(2)(ii))

### Ancillary Services at In-Network Facilities (45 CFR 149.420(b))
Patients CANNOT waive protections for these:
* Anesthesiology
* Pathology
* Radiology
* Emergency medicine
* Neonatology
* Assistant surgeons
* Hospitalists
* Intensivists
* Diagnostic services (including radiology and lab)
* Any service where no in-network clinician is available at the facility

### Air Ambulance (45 CFR 149.440)
* Out-of-network air ambulance services

## When Balance Billing Can Be Legal

* Patient knowingly received non-emergency out-of-network services at an in-network facility after valid notice and written consent using the HHS standard form, delivered on time (45 CFR 149.420(c))
* Patient chose a fully out-of-network facility for non-emergency care
* Ground ambulance services (NSA does not cover them - state protections vary)

## Notice and Consent Requirements (45 CFR 149.420(c))

For non-ancillary services at in-network facilities:
* Must use HHS standard form
* Timing:
  - At least 72 hours before appointment if scheduled 72+ hours in advance
  - No later than 3 hours in advance for same-day scheduling
* Must include separate cost estimate
* Must be signed by patient

## Good Faith Estimate (GFE) Requirements (45 CFR 149.610)

For uninsured or self-pay patients:
* Provide within 3 business days of scheduling or request
* Include all co-providers
* Reflect discounts
* Reissue if scope changes

## Patient-Provider Dispute Resolution (PPDR) (45 CFR 149.620)

* Eligible when bill from any listed provider or facility is at least $400 more than that entity's GFE total
* Patient can trigger PPDR within 120 days of the first bill

## Ground Ambulance Gap

* NSA does not cover ground ambulances
* Some states have protections - check state law

## Detection Rules

### Rule 1: Emergency Balance Bill
**Trigger**: Setting is emergency OR post-stabilization AND any charge exceeds in-network cost sharing
**Citation**: 45 CFR 149.110
**Severity**: Violation
**Explanation Template**: "Emergency services must be billed at in-network cost sharing. This charge of $[amount] exceeds the in-network rate of $[in-network-amount] by $[difference]. Balance billing for emergency care is prohibited under federal law."

### Rule 2: Invalid Post-Stabilization Consent
**Trigger**: Setting is post-stabilization AND no valid consent OR ancillary service
**Citation**: 45 CFR 149.110(c)(2)(ii)
**Severity**: Violation
**Explanation Template**: "Post-stabilization services remain protected unless valid notice and consent are obtained. No valid consent was documented for this $[amount] charge."

### Rule 3: Ancillary Service at In-Network Facility
**Trigger**: Facility is in-network AND provider is out-of-network AND specialty is ancillary
**Citation**: 45 CFR 149.420(b)
**Severity**: Violation
**Explanation Template**: "This $[amount] charge is for [specialty] services by an out-of-network provider at an in-network facility. Federal law prohibits balance billing for ancillary services (anesthesiology, radiology, pathology, emergency medicine, neonatology, assistant surgeons, hospitalists, intensivists, and diagnostic services). Patients cannot waive these protections."

### Rule 4: Defective Notice and Consent
**Trigger**: Non-ancillary OON provider at in-network facility AND (no consent OR wrong form OR wrong timing OR no separate estimate)
**Citation**: 45 CFR 149.420(c)
**Severity**: Violation
**Explanation Template**: "Out-of-network services at in-network facilities require HHS standard notice and consent with proper timing (72 hours advance for scheduled appointments, 3 hours for same-day) and a separate cost estimate. This $[amount] charge lacks valid consent documentation."

### Rule 5: Air Ambulance
**Trigger**: Service type is air ambulance
**Citation**: 45 CFR 149.440
**Severity**: Violation
**Explanation Template**: "Air ambulance services are federally protected. This $[amount] charge must use in-network cost sharing and balance billing is prohibited."

### Rule 6: Ground Ambulance (Informational)
**Trigger**: Service type is ground ambulance
**Citation**: GAP - Not covered by federal NSA
**Severity**: Info
**Explanation Template**: "Ground ambulance services are not covered by federal No Surprises Act protections. However, [state] may have state-level protections. This $[amount] charge should be reviewed against state law."

### Rule 7: GFE Noncompliant
**Trigger**: Patient is uninsured/self-pay AND GFE missing required fields OR late OR missing co-providers
**Citation**: 45 CFR 149.610
**Severity**: Violation
**Explanation Template**: "As an uninsured/self-pay patient, you must receive a Good Faith Estimate within 3 business days of scheduling, including all co-providers and applicable discounts. The GFE provided was noncompliant."

### Rule 8: PPDR Eligible
**Trigger**: Patient is uninsured/self-pay AND actual bill exceeds GFE by $400+
**Citation**: 45 CFR 149.620
**Severity**: Violation
**Explanation Template**: "The actual bill of $[billed] exceeds the Good Faith Estimate of $[gfe] by $[difference]. Since this exceeds $400, you can initiate Patient-Provider Dispute Resolution within 120 days of the first bill date."

## Dispute Text Templates

### EMERGENCY_BALANCE_BILL
"This charge violates the No Surprises Act (45 CFR 149.110). Emergency services must be billed using in-network cost sharing. Charged: $[charged]. Expected in-network: $[expected]. Difference: $[diff]. Please correct and reissue a compliant bill."

### ANCILLARY_PROTECTION
"This out-of-network charge for [specialty] services at an in-network facility violates 45 CFR 149.420(b). Patients cannot waive protections for ancillary services. Provider: [provider]. Please adjust to in-network cost sharing and void the balance bill."

### DEFECTIVE_NOTICE_CONSENT
"Out-of-network services at in-network facilities require HHS standard notice and written consent with correct timing and a separate estimate (45 CFR 149.420(c)). Your documentation is missing or defective. Please treat these services as protected and bill at in-network cost sharing."

### AIR_AMBULANCE
"Out-of-network air ambulance services are protected under 45 CFR 149.440. Cost sharing must match in-network rules and balance billing is prohibited. Please adjust the claim."

### GROUND_AMBULANCE_GAP
"Ground ambulance services are not federally covered by the NSA. State rules may limit charges in [state]. Please confirm applicable state protections."

### GFE_NONCOMPLIANT
"For uninsured or self-pay patients, the Good Faith Estimate must include required fields, co-providers, and correct timing per 45 CFR 149.610. Please issue a compliant GFE or adjust charges."

### PPDR_OVER_GFE
"The billed amount of $[billed] exceeds the Good Faith Estimate of $[gfe] by $[diff], which exceeds the $400 threshold. You may initiate Patient-Provider Dispute Resolution within 120 days per 45 CFR 149.620."
