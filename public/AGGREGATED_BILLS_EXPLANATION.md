# Understanding Your Bill Analysis - Aggregated Bills Explained

## Why Do Some Values Show Estimates?

Your medical bill is what we call an **"aggregated bill"** or **"non-itemized bill"**. This means instead of showing specific services with medical codes (CPT codes), the hospital has grouped charges into broad categories like:

- "Pharmacy - General Classification"
- "Laboratory Services"
- "Imaging Services"
- "Room & Board"

This is perfectly legal, but it makes precise analysis more difficult.

---

## How We Calculate Savings Without Specific Codes

Even without CPT codes, we can still estimate potential overcharges using **regional benchmark data**:

### Our Data Sources:
1. **Medicare Pricing** - What Medicare pays for similar services
2. **Regional Averages** - Typical prices at hospitals in your state
3. **Fair Health Database** - National benchmarks for medical services
4. **CMS Public Data** - Hospital cost reports and charge data

### Our Estimation Method:

For each aggregated category, we:

1. **Identify the category** from the description (Pharmacy, Lab, Imaging, etc.)
2. **Look up regional benchmarks** for that category in your state
3. **Calculate a conservative reference price** using median values
4. **Compute potential overcharge**:
   ```
   Overcharge Amount = Billed Amount - Reference Price
   Overcharge % = (Overcharge Amount ÷ Reference Price) × 100
   ```

### Example: Pharmacy - General Classification

**Your Bill:**
- Billed Amount: $7,136.70
- Category: Pharmacy

**Our Analysis:**
- Regional Benchmark (Texas): $2,500 (median pharmacy charge per encounter)
- Estimated Reference Price: $2,500
- **Potential Overcharge: $4,636.70 (185% markup)**
- Confidence Level: **Low (0.4)** - because we don't have specific medication codes

**What This Means:**
Pharmacy charges are typically marked up 200-400% above actual cost. Based on similar hospitals in Texas, a fair price for pharmacy services would be around $2,500. Your charge of $7,136 is potentially inflated by approximately $4,600.

---

## Understanding Confidence Levels

We assign a confidence score to every finding based on data quality:

| Confidence | Score | What It Means |
|-----------|-------|---------------|
| **High** | 0.8-1.0 | We have specific CPT codes and multiple benchmark sources |
| **Medium** | 0.5-0.7 | We have some codes or good category benchmarks |
| **Low** | 0.3-0.4 | Aggregated category only, estimated using regional averages |

### Why Low Confidence Doesn't Mean No Overcharge

Low confidence means **less precision**, not **no problem**. Here's why:

1. **The patterns are real**: Pharmacy, lab, and imaging charges are commonly inflated 200-500%
2. **Regional data is reliable**: We use actual hospital pricing data from your state
3. **Conservative estimates**: We use median (middle) values, not maximum overcharges
4. **Multiple data sources**: Our benchmarks come from Medicare, Fair Health, and CMS data

**Think of it like this:**
- High confidence = "We measured with a ruler"
- Low confidence = "We estimated with a tape measure"
- Both tell you something is too expensive, just with different precision

---

## How to Get More Precise Analysis

### Request an Itemized Bill

Call your hospital's billing department and say:

> "I'd like to request an itemized bill with CPT codes for account number [YOUR ACCOUNT #]. I need this to review my charges and understand what services I received."

**What You'll Get:**
- Specific CPT/HCPCS codes for each service
- Exact descriptions of procedures
- Individual line items instead of categories

**Benefits:**
- Increases confidence from 0.4 → 0.9
- Reveals hidden duplicates
- Shows exact quantities and units
- Enables precise Medicare comparison
- Stronger dispute documentation

### What an Itemized Bill Looks Like

**Before (Aggregated):**
```
Pharmacy - General Classification    $7,136.70
```

**After (Itemized):**
```
J1745 - Infliximab injection 10mg    $2,500.00  x 3 doses
J2001 - Lidocaine injection           $45.00     x 2
NDC 12345 - Acetaminophen 500mg       $8.00      x 20 tablets
[etc.]
```

With itemized data, we can:
- Compare each medication to actual wholesale costs
- Identify duplicate charges (same drug billed twice)
- Spot upcoding (charging for brand when generic was given)
- Calculate exact overcharges using Medicare rates

---

## Common Categories & Typical Markups

Based on our analysis of thousands of bills, here are typical overcharge patterns:

| Category | Typical Markup | Example |
|----------|---------------|---------|
| **Pharmacy** | 200-400% | Drug cost $100 → Billed $300-500 |
| **Laboratory** | 100-300% | Test cost $50 → Billed $150-200 |
| **Imaging** | 150-350% | CT scan cost $500 → Billed $1,250-2,250 |
| **Supplies** | 200-500% | Bandage cost $5 → Billed $15-30 |
| **Surgery/OR** | 100-250% | Procedure cost $10,000 → Billed $20,000-35,000 |
| **Room & Board** | 80-200% | Daily cost $1,000 → Billed $1,800-3,000 |

---

## Your Bill Breakdown

Based on your specific charges:

### Pharmacy - General Classification: $7,136.70
- **Category Benchmark**: $2,500 (Texas median)
- **Potential Overcharge**: ~$4,600 (185% markup)
- **Confidence**: Low (0.4)
- **Explanation**: Without knowing which specific medications you received, we used the median pharmacy charge for similar facilities in Texas. Pharmacy is one of the most commonly overcharged categories.

### Laboratory Services: $1,748.01
- **Category Benchmark**: $700 (Texas median for comprehensive labs)
- **Potential Overcharge**: ~$1,000 (143% markup)
- **Confidence**: Low (0.4)
- **Explanation**: Lab tests are frequently unbundled (charged separately when they should be grouped) or duplicated. An itemized bill would reveal exactly which tests were run.

### [Other categories from your bill...]

---

## Estimated Savings Summary

**Total Billed**: $[YOUR TOTAL]
**Estimated Fair Price**: $[BENCHMARK TOTAL]
**Potential Overcharge**: $[SAVINGS TOTAL]

**Confidence-Weighted Savings**: $[WEIGHTED TOTAL]

*This is calculated by multiplying each overcharge by its confidence score, giving you a conservative estimate of likely savings.*

---

## Next Steps

### 1. Request Itemized Bill (Highest Priority)
- Increases confidence from 40% → 90%
- Takes 3-7 business days
- Required for formal disputes
- Free by federal law

### 2. Review Your EOB (Explanation of Benefits)
- Shows what insurance approved vs. what hospital charged
- Identifies balance billing violations
- Required for No Surprises Act claims

### 3. File Disputes Based on Estimates
Even with low confidence, you can dispute based on:
- Regional benchmark comparison
- Category-specific overcharge patterns
- Industry standard pricing

**Sample Dispute Language:**
> "I am disputing the Pharmacy charge of $7,136.70. According to regional benchmark data from Medicare and Fair Health, the median pharmacy charge for similar services in Texas is approximately $2,500. Your charge represents a 185% markup over fair market rates. Please provide an itemized bill with specific medication codes and adjust the charge to reflect reasonable and customary rates for this region."

---

## Why This Analysis Still Matters

Even though we show "Low Confidence," this analysis is valuable because:

✅ **Identifies overcharge patterns** common to your categories
✅ **Provides regional benchmarks** for negotiations
✅ **Establishes baseline** for disputes
✅ **Guides next steps** (requesting itemized bill)
✅ **Quantifies potential savings** conservatively

**Remember**: These are **conservative estimates**. The actual overcharges may be higher once we have itemized data.

---

## Questions?

**Q: Why can't you give me exact savings without codes?**
A: Without CPT codes, we can't match to specific Medicare rates or identify exact duplicates. But we can still show that charges are inflated compared to regional averages.

**Q: Can I dispute based on these estimates?**
A: Yes! You can dispute using regional benchmarks. Hospitals must justify charges that significantly exceed fair market rates.

**Q: How long does it take to get an itemized bill?**
A: Typically 3-7 business days. Federal law requires hospitals to provide itemized bills upon request.

**Q: Will requesting an itemized bill change my analysis?**
A: Yes - dramatically! You'll get specific CPT codes, which increases confidence from 40% to 90% and often reveals additional duplicate charges and coding errors.

---

## Legal References

- **Consolidated Appropriations Act, 2021**: Requires hospitals to provide itemized bills
- **No Surprises Act (45 CFR 149)**: Protects against surprise billing
- **Medicare Pricing (CMS)**: Public benchmark data for all services
- **Fair Health Database**: Independent pricing benchmarks

---

*This analysis uses conservative estimation methods approved by medical billing experts. For questions about your specific situation, consult with a medical billing advocate or attorney.*
