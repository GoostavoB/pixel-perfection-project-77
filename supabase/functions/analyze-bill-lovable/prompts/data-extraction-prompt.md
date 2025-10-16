# Medical Bill Data Extraction Prompt

## Mission

Extract structured data from medical bills with MAXIMUM ACCURACY. Your job is to extract the data exactly as it appears on the bill - DO NOT analyze, calculate, or interpret anything.

## Critical Rules

1. **ONLY EXTRACT - DO NOT ANALYZE**
   - Extract line items exactly as shown
   - Do not flag duplicates
   - Do not calculate overcharges
   - Do not assess NSA violations
   - All analysis happens in post-processing

2. **Extract ALL Fields Accurately**
   - Line number (as it appears on bill)
   - Date of service (YYYY-MM-DD format)
   - Description (exact text from bill)
   - CPT/HCPCS code (if present, otherwise "N/A")
   - Revenue code (if present)
   - Units/Quantity
   - **Billed amount** (exact dollar amount charged)
   - **Allowed amount** (CRITICAL - extract from "Allowed", "Plan Allowed", "Insurance Allowed" column if present)
   - Provider NPI (if shown)
   - Department/Service type

3. **Allowed Amount Extraction (CRITICAL)**
   - Look for columns labeled: "Allowed", "Plan Allowed", "Insurance Allowed", "Contracted Rate", "Network Rate"
   - If present, extract the EXACT dollar amount
   - If not present, set to null (not 0)
   - This is the most important field for overcharge detection

4. **Normalization Rules**
   - Dates: Convert to YYYY-MM-DD
   - Currency: Remove $, commas, convert to decimal number
   - Text: Preserve exact spelling and capitalization
   - Codes: Preserve exact format (including dashes, spaces)

## Output Format

Return ONLY a JSON array of line items:

```json
{
  "bill_metadata": {
    "hospital_name": "string",
    "patient_name": "string or null",
    "account_number": "string or null",
    "total_billed": number,
    "service_dates": "YYYY-MM-DD or range"
  },
  "line_items": [
    {
      "line_id": "string",
      "date_of_service": "YYYY-MM-DD",
      "description": "string",
      "cpt_or_hcpcs": "string or N/A",
      "revenue_code": "string or null",
      "department": "string or null",
      "units": number,
      "billed_amount": number,
      "allowed_amount": number or null,
      "provider_id_ref": "string or null",
      "modifier": "string or null"
    }
  ]
}
```

## What NOT to Include

- Do not add "overcharge_amount" field
- Do not add "duplicate_flag" field
- Do not add "issue_type" field
- Do not add "confidence" field
- Do not add "recommended_action" field

All analysis fields will be calculated by the post-processing rules engine.

## Quality Checks

1. Every line from the bill is extracted
2. All dollar amounts are accurate to the cent
3. Allowed amounts are extracted when present (not set to 0)
4. CPT codes match exactly (including format)
5. No extra analysis fields are added
